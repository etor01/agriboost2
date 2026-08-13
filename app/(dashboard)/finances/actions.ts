// app/(dashboard)/finances/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Expected subscription amount in pesewas (GH₵120.00)
const SUBSCRIPTION_AMOUNT_PESEWAS = 12000;

/**
 * Activates the 5-Star Farmer premium subscription after a successful Paystack payment.
 *
 * Steps:
 *  1. Authenticate the current user.
 *  2. Verify the Paystack transaction reference via Paystack's API.
 *  3. Guard against double-processing (idempotency) by checking the subscriptions table.
 *  4. Upgrade the user's profile to premium (1 year).
 *  5. Insert a new row into the subscriptions table.
 *  6. Record the transaction and log an activity.
 */
export async function recordSuccessfulTransaction(transactionData: {
    service_name: string;
    amount: number;
    payment_gateway_ref: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'User not authenticated.' };
    }

    const reference = transactionData.payment_gateway_ref;

    // ── Step 1: Idempotency guard ──────────────────────────────────────────────
    // If this reference was already processed, return success without re-processing.
    const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('paystack_subscription_id', reference)
        .maybeSingle();

    if (existingSub) {
        revalidatePath('/finances');
        return { success: true };
    }

    // ── Step 2: Verify the Paystack reference ──────────────────────────────────
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
        console.error('PAYSTACK_SECRET_KEY environment variable is not set.');
        return { success: false, error: 'Payment configuration error. Contact support.' };
    }

    let paystackData: any;
    try {
        const verifyRes = await fetch(
            `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${paystackSecretKey}`,
                    'Content-Type': 'application/json',
                },
                // Server Actions run on Node; set a reasonable timeout via AbortSignal
                signal: AbortSignal.timeout(15_000),
            }
        );

        if (!verifyRes.ok) {
            console.error('Paystack verification HTTP error:', verifyRes.status);
            return { success: false, error: 'Payment verification failed. Please contact support.' };
        }

        const verifyJson = await verifyRes.json();
        paystackData = verifyJson?.data;

        if (!verifyJson.status || paystackData?.status !== 'success') {
            console.error('Paystack verification status not success:', verifyJson);
            return { success: false, error: 'Payment not confirmed by Paystack. Please try again or contact support.' };
        }
    } catch (err: any) {
        console.error('Paystack verification network error:', err?.message ?? err);
        return { success: false, error: 'Could not reach payment gateway. Please contact support.' };
    }

    // ── Step 3: Validate the amount ────────────────────────────────────────────
    const verifiedAmount: number = paystackData?.amount ?? 0; // Paystack returns in pesewas
    if (verifiedAmount < SUBSCRIPTION_AMOUNT_PESEWAS) {
        console.error(`Amount mismatch: expected ${SUBSCRIPTION_AMOUNT_PESEWAS}, got ${verifiedAmount}`);
        return { success: false, error: 'Payment amount does not match the subscription price.' };
    }

    // ── Step 4: Calculate subscription dates ───────────────────────────────────
    const now = new Date();
    const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    const startDate = now.toISOString();
    const endDate = oneYearFromNow.toISOString();

    // ── Step 5: Upgrade profile to premium ─────────────────────────────────────
    const { error: profileError } = await supabase
        .from('profiles')
        .update({
            subscription_tier: 'premium',
            subscription_end_date: endDate,
            ai_scans_remaining: 999,
        })
        .eq('id', user.id);

    if (profileError) {
        console.error('Failed to upgrade profile:', profileError);
        return { success: false, error: 'Failed to activate premium. Please contact support.' };
    }

    // ── Step 6: Insert into subscriptions table ────────────────────────────────
    const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
            profile_id: user.id,
            start_date: startDate,
            end_date: endDate,
            status: 'active',
            paystack_subscription_id: reference,
        });

    if (subError) {
        console.error('Failed to insert subscription record:', subError);
        // Profile is already upgraded — log the error but don't surface a failure to the user.
        // A background job or manual fix can reconcile the subscriptions row.
    }

    // ── Step 7: Record the transaction ────────────────────────────────────────
    const { error: txError } = await supabase
        .from('transactions')
        .insert({
            profile_id: user.id,
            service_name: transactionData.service_name,
            amount: transactionData.amount, // GH₵ (not pesewas) for display
            status: 'completed',
            paystack_reference: reference,
            transaction_type: 'purchase',
            delivery_fee: 0,
            platform_fee: 0,
            sales_amount: 0,
            platform_fee_collected: false,
            farmer_balance_credited: false,
        });

    if (txError) {
        console.error('Failed to record transaction:', txError);
        // Non-fatal — subscription is already active.
    }

    // ── Step 8: Log an activity ────────────────────────────────────────────────
    await supabase.from('activities').insert({
        profile_id: user.id,
        activity_type: 'payment_received',
        title: '5-Star Farmer Plan Activated 🌟',
        description: 'Annual premium subscription activated.',
    });

    revalidatePath('/finances');
    revalidatePath('/');          // Refresh sidebar/header that shows subscription badge
    revalidatePath('/ai-center'); // Refresh AI Center scan counter

    return { success: true };
}

/**
 * Returns the full financial summary for the current user:
 * - wallet_balance, available_balance (farmer payout)
 * - totalEscrow, totalEarned (from transactions)
 * - topup history, withdrawal history
 */
export async function getFinancialSummary() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const [profileResult, txResult] = await Promise.all([
        supabase
            .from('profiles')
            .select('wallet_balance, available_balance, role')
            .eq('id', user.id)
            .single(),
        supabase
            .from('transactions')
            .select('amount, sales_amount, delivery_fee, platform_fee, escrow_held, status, transaction_type, created_at')
            .eq('profile_id', user.id)
            .order('created_at', { ascending: false }),
    ]);

    const profile = profileResult.data;
    const txList = txResult.data || [];

    let totalEscrow = 0;
    let totalEarned = 0;
    let totalTopups = 0;
    let totalWithdrawn = 0;

    for (const tx of txList) {
        const amt = Number(tx.amount ?? 0);
        const salesAmt = Number(tx.sales_amount ?? 0);

        if (tx.transaction_type === 'wallet_topup') {
            totalTopups += amt;
        } else if (tx.transaction_type === 'farmer_withdrawal') {
            totalWithdrawn += amt;
        } else if (tx.escrow_held && tx.status !== 'completed') {
            totalEscrow += salesAmt > 0 ? salesAmt : amt;
        } else if (tx.transaction_type === 'escrow_release' && tx.status === 'completed') {
            totalEarned += salesAmt > 0 ? salesAmt : amt;
        }
    }

    return {
        walletBalance: Number(profile?.wallet_balance ?? 0),
        availableBalance: Number(profile?.available_balance ?? 0),
        role: profile?.role || 'buyer',
        totalEscrow: Number(totalEscrow.toFixed(2)),
        totalEarned: Number(totalEarned.toFixed(2)),
        totalTopups: Number(totalTopups.toFixed(2)),
        totalWithdrawn: Number(totalWithdrawn.toFixed(2)),
        transactions: txList,
    };
}
