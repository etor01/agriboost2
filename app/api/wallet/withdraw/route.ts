// app/api/wallet/withdraw/route.ts
// Processes a farmer withdrawal request (dummy — deducts balance, logs for admin).
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { amount, method, accountDetails } = await req.json();
    const withdrawAmount = Number(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid withdrawal amount.' }, { status: 400 });
    }

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
    await supabase.from('transactions').insert({
      profile_id: user.id,
      paystack_reference: reference,
      amount: withdrawAmount,
      service_name: `Farmer Withdrawal — ${method || 'Mobile Money'} (${accountDetails || 'N/A'})`,
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
      description: `GH₵ ${withdrawAmount.toFixed(2)} withdrawal to ${method || 'Mobile Money'} processed. Ref: ${reference}`,
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
