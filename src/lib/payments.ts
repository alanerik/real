import { supabase } from './supabase';

export const getPaymentsByRental = async (rentalId: string) => {
    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('rental_id', rentalId)
        .order('due_date', { ascending: false });

    if (error) {
        console.error('Error fetching payments:', error);
        throw error;
    }

    return data;
};

export const getPaymentsByTenant = async () => {
    // This will automatically filter by tenant_user_id via RLS
    const { data: rental } = await supabase
        .from('rentals')
        .select('id')
        .eq('tenant_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

    if (!rental) return [];

    return getPaymentsByRental(rental.id);
};

export const createPayment = async (payment: any) => {
    // Map payment_method to type for backward compatibility with existing schema
    const paymentData = {
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
        console.error('Error creating payment:', error);
        throw error;
    }

    return data;
};

export const updatePayment = async (id: string, payment: any) => {
    const { data, error } = await supabase
        .from('payments')
        .update(payment)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating payment:', error);
        throw error;
    }

    return data;
};

export const updatePaymentStatus = async (id: string, status: string) => {
    const updateData: any = { status };

    // If marking as paid, set payment_date to today
    if (status === 'paid') {
        updateData.payment_date = new Date().toISOString().split('T')[0];
    }

    return updatePayment(id, updateData);
};

export const deletePayment = async (id: string) => {
    const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting payment:', error);
        throw error;
    }

    return true;
};

export const getUpcomingPayments = async (rentalId: string, days: number = 7) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('rental_id', rentalId)
        .eq('status', 'pending')
        .gte('due_date', today.toISOString().split('T')[0])
        .lte('due_date', futureDate.toISOString().split('T')[0])
        .order('due_date', { ascending: true });

    if (error) {
        console.error('Error fetching upcoming payments:', error);
        throw error;
    }

    return data;
};

export const getOverduePayments = async (rentalId: string) => {
    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('rental_id', rentalId)
        .eq('status', 'overdue')
        .order('due_date', { ascending: true });

    if (error) {
        console.error('Error fetching overdue payments:', error);
        throw error;
    }

    return data;
};
