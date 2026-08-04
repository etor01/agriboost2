// app/api/wallet/topup/route.ts
// Verifies a Paystack payment reference and credits the user's wallet balance.
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PLATFORM_FEE_RATE = 0.05; // 5%

export async function POST(req: NextRequest) {
  try {
    const { reference, amount: expectedAmount } = await req.json();

    if (!reference) {
      return NextResponse.json({ success: false, error: 'Missing payment reference.' }, { status: 400 });
    }

    // ── 1. Verify payment with Paystack ──────────────────────────────────────
    // If no secret key, run in TEST bypass mode (dev environment)
    let verifiedAmountGHS: number;
    let paystackEmail: string | null = null;

    if (!PAYSTACK_SECRET_KEY || PAYSTACK_SECRET_KEY === 'pk_test_placeholder_key') {
      // Test-mode bypass: trust the client-provided amount
      // In production, PAYSTACK_SECRET_KEY must always be set
      console.warn('[wallet/topup] ⚠️  Running in TEST bypass mode — skipping Paystack verification. Set PAYSTACK_SECRET_KEY in production.');
      verifiedAmountGHS = Number(expectedAmount);
      if (!verifiedAmountGHS || verifiedAmountGHS <= 0) {
        return NextResponse.json({ success: false, error: 'Invalid amount in test mode.' }, { status: 400 });
      }
    } else {
      const verifyRes = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }
      );

      const verifyData = await verifyRes.json();

      if (!verifyData.status || verifyData.data?.status !== 'success') {
        return NextResponse.json(
          { success: false, error: `Payment verification failed: ${verifyData.message || 'unknown error'}` },
          { status: 400 }
        );
      }

      // Amount from Paystack is in pesewas — convert to GHS
      verifiedAmountGHS = verifyData.data.amount / 100;
      paystackEmail = verifyData.data.customer?.email ?? null;
    }


    // ── 2. Authenticate user from Supabase session ───────────────────────────
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated.' }, { status: 401 });
    }

    // Guard: email should match
    if (paystackEmail && user.email && paystackEmail.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Payment email does not match your account email.' },
        { status: 403 }
      );
    }

    // ── 3. Check for duplicate topup (idempotency) ───────────────────────────
    const { data: existing } = await supabase
      .from('transactions')
      .select('id')
      .eq('paystack_reference', reference)
      .eq('transaction_type', 'wallet_topup')
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: false, error: 'This payment reference has already been used.' }, { status: 409 });
    }

    // ── 4. Credit wallet balance using RPC to avoid race conditions ──────────
    // Increment wallet_balance atomically
    const { error: walletErr } = await supabase.rpc('increment_wallet_balance', {
      user_id: user.id,
      increment_amount: verifiedAmountGHS,
    });

    if (walletErr) {
      // Fallback: manual increment if RPC doesn't exist
      const { data: profile } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user.id)
        .single();

      const currentBalance = Number(profile?.wallet_balance ?? 0);
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ wallet_balance: Number((currentBalance + verifiedAmountGHS).toFixed(2)) })
        .eq('id', user.id);

      if (updateErr) {
        return NextResponse.json({ success: false, error: 'Failed to credit wallet.' }, { status: 500 });
      }
    }

    // ── 5. Record transaction ────────────────────────────────────────────────
    await supabase.from('transactions').insert({
      profile_id: user.id,
      paystack_reference: reference,
      amount: verifiedAmountGHS,
      service_name: `Wallet Top-up — GH₵ ${verifiedAmountGHS.toFixed(2)}`,
      status: 'completed',
      escrow_held: false,
      transaction_type: 'wallet_topup',
      delivery_fee: 0,
      platform_fee: 0,
      sales_amount: 0,
      platform_fee_collected: false,
      farmer_balance_credited: false,
    });

    // ── 6. Log activity ──────────────────────────────────────────────────────
    await supabase.from('activities').insert({
      profile_id: user.id,
      activity_type: 'payment_received',
      title: 'Wallet Loaded 💰',
      description: `GH₵ ${verifiedAmountGHS.toFixed(2)} successfully added to your AgriBoost wallet via Paystack.`,
    });

    return NextResponse.json({
      success: true,
      amount: verifiedAmountGHS,
      message: `GH₵ ${verifiedAmountGHS.toFixed(2)} added to your wallet!`,
    });
  } catch (err: any) {
    console.error('[wallet/topup] Error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal error.' }, { status: 500 });
  }
}
