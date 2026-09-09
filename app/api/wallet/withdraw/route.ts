// app/api/wallet/withdraw/route.ts
// Processes a farmer withdrawal request (dummy — deducts balance, logs for admin).
//
// WHY ZOD? Zod is a TypeScript-first schema validation library. It parses and
// validates incoming request data (amount, method, accountDetails) before your
// business logic runs — rejecting malformed or malicious payloads with clear
// 400-level errors. It's already in package.json (zod ^4.4.3).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// ── Validation Schema ─────────────────────────────────────────────────────────
const WithdrawSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Amount must be a number.' })
    .positive('Amount must be greater than zero.')
    .max(100_000, 'Single withdrawal cannot exceed GH₵ 100,000.'),
  method: z.enum(['momo', 'bank', 'Mobile Money', 'Bank Transfer'], {
    errorMap: () => ({ message: "Method must be 'momo' or 'bank'." }),
  }),
  accountDetails: z
    .string()
    .min(5, 'Account details must be at least 5 characters.')
    .max(200, 'Account details too long.'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ── Validate & parse input ────────────────────────────────────────────────
    const parseResult = WithdrawSchema.safeParse(body);
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message ?? 'Invalid request.';
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    const { amount: withdrawAmount, method: rawMethod, accountDetails } = parseResult.data;
    const method = rawMethod.toLowerCase().includes('momo') || rawMethod.toLowerCase().includes('mobile')
      ? 'momo'
      : 'bank';

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated.' }, { status: 401 });
    }

    // ── 1. Check available balance ───────────────────────────────────────────
    const { data: profile } = await supabase
      .from('profiles')
      .select('available_balance, wallet_balance, firstname, lastname')
      .eq('id', user.id)
      .single();

    const availBal = Number(profile?.available_balance ?? 0);

    if (withdrawAmount > availBal) {
      return NextResponse.json(
        { success: false, error: `Insufficient balance. Available: GH₵ ${availBal.toFixed(2)}` },
        { status: 400 }
      );
    }

    // ── 2. Deduct from available_balance ─────────────────────────────────────
    const newBalance = Number((availBal - withdrawAmount).toFixed(2));
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ available_balance: newBalance })
      .eq('id', user.id);

    if (updateErr) {
      return NextResponse.json({ success: false, error: 'Failed to process withdrawal.' }, { status: 500 });
    }

    // ── 3. Record withdrawal transaction (auto-approved, logged for admin) ───
    const reference = `WITHDRAWAL-${Date.now()}-${user.id.slice(0, 6).toUpperCase()}`;
    const methodLabel = method === 'momo' ? 'Mobile Money' : 'Bank Transfer';
    await supabase.from('transactions').insert({
      profile_id: user.id,
      paystack_reference: reference,
      amount: withdrawAmount,
      service_name: `Farmer Withdrawal — ${methodLabel} (${accountDetails})`,
      status: 'completed',
      escrow_held: false,
      transaction_type: 'farmer_withdrawal',
      delivery_fee: 0,
      platform_fee: 0,
      sales_amount: withdrawAmount,
      platform_fee_collected: false,
      farmer_balance_credited: false,
    });

    // ── 4. Log activity ──────────────────────────────────────────────────────
    await supabase.from('activities').insert({
      profile_id: user.id,
      activity_type: 'payment_received',
      title: 'Withdrawal Processed ✅',
      description: `GH₵ ${withdrawAmount.toFixed(2)} withdrawal to ${methodLabel} processed. Ref: ${reference}`,
    });

    return NextResponse.json({
      success: true,
      amount: withdrawAmount,
      reference,
      newBalance,
      message: `GH₵ ${withdrawAmount.toFixed(2)} sent to your ${method || 'Mobile Money'} account!`,
    });
  } catch (err: any) {
    console.error('[wallet/withdraw] Error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal error.' }, { status: 500 });
  }
}
