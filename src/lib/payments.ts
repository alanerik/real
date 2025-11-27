import { supabase } from './supabase';
import { createSupabaseError } from './errors';
import { logger } from './logger';

export interface PaymentData {
    id?: string;
    rental_id: string;
    amount: number;
    due_date: string;
    payment_date?: string;
    status: 'pending' | 'paid' | 'overdue';
    payment_method?: string;
    type?: string; // For backward compatibility
    date?: string;  // For backward compatibility
    notes?: string;
    created_at?: string;
}

export const getPaymentsByRental = async (rentalId: string) => {
    logger.supabase('SELECT BY RENTAL', 'payments', { rentalId });

    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('rental_id', rentalId)
        .order('due_date', { ascending: false });

    if (error) {
        throw createSupabaseError(error, 'getPaymentsByRental', 'payments');
    }

    return data;
};

export const getPaymentsByTenant = async () => {
    logger.supabase('SELECT BY TENANT', 'payments');

    // This will automatically filter by tenant_user_id via RLS
    const { data: rental } = await supabase
        .from('rentals')
        .select('id')
        .eq('tenant_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

    if (!rental) return [];

    return getPaymentsByRental(rental.id);
};

export const createPayment = async (payment: Partial<PaymentData>) => {
    logger.supabase('INSERT', 'payments', { rental_id: payment.rental_id });

    // Map payment_method to type for backward compatibility with existing schema
    const paymentData: Partial<PaymentData> = {
        ...payment,
        type: payment.payment_method || 'other', // Required by old schema
        date: payment.due_date // Required by old schema
    };

    const { data, error } = await supabase
        .from('payments')
        .insert([paymentData])
        .select()
        .single();

    if (error) {
        throw createSupabaseError(error, 'createPayment', 'payments');
    }

    logger.info('Payment created successfully', { id: data.id });
    return data;
};

export const updatePayment = async (id: string, payment: Partial<PaymentData>) => {
    logger.supabase('UPDATE', 'payments', { id });

    const { data, error } = await supabase
        .from('payments')
        .update(payment)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw createSupabaseError(error, 'updatePayment', 'payments');
    }

    logger.info('Payment updated successfully', { id });
    return data;
};

export const updatePaymentStatus = async (id: string, status: string) => {
    logger.supabase('UPDATE STATUS', 'payments', { id, status });

    const updateData: Partial<PaymentData> = { status: status as PaymentData['status'] };

    // If marking as paid, set payment_date to today
    if (status === 'paid') {
        updateData.payment_date = new Date().toISOString().split('T')[0];
    }

    return updatePayment(id, updateData);
};

export const deletePayment = async (id: string) => {
    logger.supabase('DELETE', 'payments', { id });

    const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

    if (error) {
        throw createSupabaseError(error, 'deletePayment', 'payments');
    }

    logger.info('Payment deleted successfully', { id });
    return true;
};

export const getUpcomingPayments = async (rentalId: string, days: number = 7) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    logger.supabase('SELECT UPCOMING', 'payments', { rentalId, days });

    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('rental_id', rentalId)
        .eq('status', 'pending')
        .gte('due_date', today.toISOString().split('T')[0])
        .lte('due_date', futureDate.toISOString().split('T')[0])
        .order('due_date', { ascending: true });

    if (error) {
        throw createSupabaseError(error, 'getUpcomingPayments', 'payments');
    }

    return data;
};

export const getOverduePayments = async (rentalId: string) => {
    logger.supabase('SELECT OVERDUE', 'payments', { rentalId });

    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('rental_id', rentalId)
        .eq('status', 'overdue')
        .order('due_date', { ascending: true });

    if (error) {
        throw createSupabaseError(error, 'getOverduePayments', 'payments');
    }

    return data;
};
