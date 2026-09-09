-- ============================================================================
-- Migration: Expand order statuses + add status timestamp columns
-- Run this in your Supabase Studio → SQL Editor
-- ============================================================================

-- 1. Drop the existing CHECK constraint on orders.status (if it exists)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- 2. Add new status values by altering the constraint to allow packed & shipped
ALTER TABLE orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('processing', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'));

-- 3. Add status transition timestamp columns (nullable — only set when reached)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS confirmed_at       TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS packed_at          TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS shipped_at         TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cancelled_at       TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cancellation_note  TEXT        DEFAULT NULL;

-- 4. Ensure messages table has the correct FK + RLS policies
--    (messages.order_id → orders.id)
--    This is likely already set up, but safe to verify:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'order_id'
  ) THEN
    ALTER TABLE messages ADD COLUMN order_id UUID REFERENCES orders(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 5. Enable RLS on messages if not already enabled
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 6. RLS policies for messages (farmers and buyers of the same order can read/write)
DROP POLICY IF EXISTS "Order participants can read messages" ON messages;
CREATE POLICY "Order participants can read messages"
  ON messages FOR SELECT
  USING (
    auth.uid() = sender_id
    OR auth.uid() IN (
      SELECT buyer_id FROM orders WHERE id = messages.order_id
    )
    OR auth.uid() IN (
      SELECT t.profile_id FROM transactions t WHERE t.order_id = messages.order_id
    )
  );

DROP POLICY IF EXISTS "Order participants can insert messages" ON messages;
CREATE POLICY "Order participants can insert messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND (
      auth.uid() IN (
        SELECT buyer_id FROM orders WHERE id = messages.order_id
      )
      OR auth.uid() IN (
        SELECT t.profile_id FROM transactions t WHERE t.order_id = messages.order_id
      )
    )
  );

DROP POLICY IF EXISTS "Message read update policy" ON messages;
CREATE POLICY "Message read update policy"
  ON messages FOR UPDATE
  USING (auth.uid() != sender_id)
  WITH CHECK (auth.uid() != sender_id);

-- 7. Enable realtime on orders table (so buyer sees live status updates)
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- 8. Enable realtime on messages table (for chat)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Done!
-- After running this migration, the orders table supports:
--   processing -> confirmed -> packed -> shipped -> delivered
--   processing -> cancelled (farmer rejects)
