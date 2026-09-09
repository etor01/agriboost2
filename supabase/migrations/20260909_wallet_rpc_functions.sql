-- ============================================================================
-- Migration: Atomic Wallet RPC Functions with Row-Level Locking (FOR UPDATE)
-- Run this in your Supabase Studio → SQL Editor to enable strict ACID serialization
-- ============================================================================

-- 1. Deduct wallet balance atomically with FOR UPDATE row lock
CREATE OR REPLACE FUNCTION deduct_wallet_balance(
  user_id UUID,
  deduct_amount NUMERIC
)
RETURNS TABLE (
  success BOOLEAN,
  new_balance NUMERIC,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_bal NUMERIC;
  updated_bal NUMERIC;
BEGIN
  -- Acquire exclusive row lock on the user's profile
  SELECT wallet_balance INTO current_bal
  FROM profiles
  WHERE id = user_id
  FOR UPDATE;

  -- Verify user profile exists
  IF current_bal IS NULL THEN
    RETURN QUERY SELECT FALSE, 0::NUMERIC, 'User profile not found.'::TEXT;
    RETURN;
  END IF;

  -- Check for sufficient funds
  IF current_bal < deduct_amount THEN
    RETURN QUERY SELECT 
      FALSE, 
      current_bal, 
      FORMAT('Insufficient balance. Required: GH₵ %s, Available: GH₵ %s.', deduct_amount::TEXT, current_bal::TEXT);
    RETURN;
  END IF;

  -- Deduct atomically
  UPDATE profiles
  SET 
    wallet_balance = ROUND((current_bal - deduct_amount)::NUMERIC, 2),
    updated_at = NOW()
  WHERE id = user_id
  RETURNING wallet_balance INTO updated_bal;

  RETURN QUERY SELECT TRUE, updated_bal, NULL::TEXT;
END;
$$;

-- 2. Increment wallet balance atomically with FOR UPDATE row lock
CREATE OR REPLACE FUNCTION increment_wallet_balance(
  user_id UUID,
  increment_amount NUMERIC
)
RETURNS TABLE (
  success BOOLEAN,
  new_balance NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_bal NUMERIC;
  updated_bal NUMERIC;
BEGIN
  -- Acquire exclusive row lock on the user's profile
  SELECT wallet_balance INTO current_bal
  FROM profiles
  WHERE id = user_id
  FOR UPDATE;

  IF current_bal IS NULL THEN
    current_bal := 0;
  END IF;

  UPDATE profiles
  SET 
    wallet_balance = ROUND((current_bal + increment_amount)::NUMERIC, 2),
    updated_at = NOW()
  WHERE id = user_id
  RETURNING wallet_balance INTO updated_bal;

  RETURN QUERY SELECT TRUE, updated_bal;
END;
$$;

-- 3. Grant execute permissions to authenticated users and service_role
GRANT EXECUTE ON FUNCTION deduct_wallet_balance(UUID, NUMERIC) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION increment_wallet_balance(UUID, NUMERIC) TO authenticated, service_role;
