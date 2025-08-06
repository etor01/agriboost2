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
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: 'User not authenticated.' };
    }

    const { error } = await supabase
        .from('transactions')
        .insert({
            user_id: user.id,
            service_name: transactionData.service_name,
            amount: transactionData.amount,
            status: 'completed',
            payment_gateway_ref: transactionData.payment_gateway_ref,
        });

    if (error) {
        console.error('Error recording transaction:', error);
        return { success: false, message: error.message };
    }

    // Revalidate the finances page to show the new transaction
    revalidatePath('/finances');

    return { success: true, message: 'Transaction recorded successfully.' };
}
