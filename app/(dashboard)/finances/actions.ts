// app/(dashboard)/finances/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// This action is called by the client after a successful Paystack transaction.
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
        });

    if (error) {
        console.error('Error recording transaction:', error);
        return { success: false, message: error.message };
    }

    // Log to activities table!
    await supabase.from('activities').insert({
        profile_id: user.id,
        activity_type: 'payment_received',
        title: 'Payment Completed',
        description: `Successfully processed GH₵ ${transactionData.amount.toFixed(2)} for ${transactionData.service_name}`
    });

    // Revalidate the finances page to show the new transaction
    revalidatePath('/finances');

    return { success: true, message: 'Transaction recorded successfully.' };
}
