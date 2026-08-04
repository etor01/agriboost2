// app/(dashboard)/finances/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Records a successful subscription transaction (5-Star Farmer).
 * This is called after a Paystack payment for subscriptions, NOT wallet top-ups.
 */
export async function recordSuccessfulTransaction(transactionData: {
    service_name: string;
    amount: number;
    payment_gateway_ref: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: 'User not authenticated.' };
    }

    const { error } = await supabase
        .from('transactions')
        .insert({
            profile_id: user.id,
            service_name: transactionData.service_name,
            amount: transactionData.amount,
            status: 'completed',
            paystack_reference: transactionData.payment_gateway_ref,
            transaction_type: 'purchase',
            delivery_fee: 0,
            platform_fee: 0,
            sales_amount: 0,
            platform_fee_collected: false,
            farmer_balance_credited: false,
        });

    if (error) {
        console.error('Error recording transaction:', error);
        return { success: false, message: error.message };
    }

    await supabase.from('activities').insert({
        profile_id: user.id,
        activity_type: 'payment_received',
        title: 'Subscription Payment Completed',
        description: `Successfully processed GH₵ ${transactionData.amount.toFixed(2)} for ${transactionData.service_name}`
    });

    revalidatePath('/finances');
    return { success: true, message: 'Transaction recorded successfully.' };
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
