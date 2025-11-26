import { supabase } from './supabase';

export interface Rental {
    id?: string;
    property_id: string;
    tenant_name: string;
    tenant_contact: string;
    start_date: string;
    end_date: string;
    status: 'active' | 'completed' | 'cancelled' | 'pending';
    total_amount: number;
    notes: string;
    created_at?: string;
    properties?: {
        title: string;
        slug: string;
    };
}

export async function getRentals() {
    const { data, error } = await supabase
        .from('rentals')
        .select(`
            *,
            properties (
                title,
                slug
            ),
            payments (
                id,
                amount,
                due_date,
                status
            )
        `)
        .order('start_date', { ascending: false });

    if (error) {
        console.error('Error fetching rentals:', error);
        return [];
    }

    // Calculate payment status for each rental
    return data.map(rental => ({
        ...rental,
        paymentStatus: calculatePaymentStatus(rental.payments || [])
    }));
}

function calculatePaymentStatus(payments: any[]) {
    if (!payments || payments.length === 0) return 'unknown';

    const now = new Date();

    // Check for overdue payments
    const overdue = payments.some(p =>
        p.status === 'pending' && new Date(p.due_date) < now
    );

    if (overdue) return 'overdue';

    // Check for upcoming payments (within 7 days)
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcoming = payments.some(p =>
        p.status === 'pending' &&
        new Date(p.due_date) > now &&
        new Date(p.due_date) < sevenDaysFromNow
    );

    if (upcoming) return 'upcoming';

    return 'ok';
}

export async function getRentalById(id: string) {
    const { data, error } = await supabase
        .from('rentals')
        .select(`
            *,
            properties (
                *
            )
        `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching rental:', error);
        return null;
    }

    return data;
}

export async function createRental(rental: Rental) {
    const { data, error } = await supabase
        .from('rentals')
        .insert([rental])
        .select()
        .single();

    if (error) {
        console.error('Error creating rental:', error);
        throw error;
    }

    return data;
}

export async function updateRental(id: string, rental: Partial<Rental>) {
    const { data, error } = await supabase
        .from('rentals')
        .update(rental)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating rental:', error);
        throw error;
    }

    return data;
}

export async function deleteRental(id: string) {
    const { error } = await supabase
        .from('rentals')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting rental:', error);
        throw error;
    }

    return true;
}

export async function getActiveRentals() {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('rentals')
        .select(`
            *,
            properties (
                title,
                slug
            )
        `)
        .or(`status.eq.active,status.eq.pending`)
        .gte('end_date', today)
        .order('end_date', { ascending: true });

    if (error) {
        console.error('Error fetching active rentals:', error);
        return [];
    }

    return data;
}

// Payments
export interface Payment {
    id?: string;
    rental_id: string;
    amount: number;
    date: string;
    type: string;
    notes: string;
    created_at?: string;
}

export async function getPayments(rentalId: string) {
    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('rental_id', rentalId)
        .order('date', { ascending: false });

    if (error) {
        console.error('Error fetching payments:', error);
        return [];
    }

    return data;
}

export async function createPayment(payment: Payment) {
    const { data, error } = await supabase
        .from('payments')
        .insert([payment])
        .select()
        .single();

    if (error) {
        console.error('Error creating payment:', error);
        throw error;
    }

    return data;
}

export async function updatePayment(id: string, payment: Partial<Payment>) {
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
}

export async function deletePayment(id: string) {
    const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting payment:', error);
        throw error;
    }

    return true;
}

// Attachments
export interface Attachment {
    id?: string;
    rental_id: string;
    file_name: string;
    file_path: string;
    file_type: string;
    category?: string;
    description?: string;
    visible_to_tenant?: boolean;
    created_at?: string;
}

export async function getAttachments(rentalId: string) {
    const { data, error } = await supabase
        .from('rental_attachments')
        .select('*')
        .eq('rental_id', rentalId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching attachments:', error);
        return [];
    }

    return data;
}

interface UploadOptions {
    category?: string;
    description?: string;
    visibleToTenant?: boolean;
}

export async function uploadAttachment(file: File, rentalId: string, options: UploadOptions = {}) {
    // File validation
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
    ];

    if (file.size > MAX_SIZE) {
        throw new Error('El archivo excede el tamaño máximo de 10MB');
    }

    // Check file type (optional: strict check)
    // if (!ALLOWED_TYPES.includes(file.type)) {
    //    throw new Error('Tipo de archivo no permitido');
    // }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${rentalId}/${fileName}`;

    // Upload to Storage
    const { error: uploadError } = await supabase.storage
        .from('rental-documents')
        .upload(filePath, file);

    if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
    }

    // Create record in DB
    const attachment: Attachment = {
        rental_id: rentalId,
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
        category: options.category || 'other',
        description: options.description || '',
        visible_to_tenant: options.visibleToTenant ?? true
    };

    const { data, error: dbError } = await supabase
        .from('rental_attachments')
        .insert([attachment])
        .select()
        .single();

    if (dbError) {
        console.error('Error creating attachment record:', dbError);
        // Clean up storage if DB insert fails
        await supabase.storage.from('rental-documents').remove([filePath]);
        throw dbError;
    }

    return data;
}

export async function deleteAttachment(id: string, filePath: string) {
    // Delete from Storage
    const { error: storageError } = await supabase.storage
        .from('rental-documents')
        .remove([filePath]);

    if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        throw storageError;
    }

    // Delete from DB
    const { error: dbError } = await supabase
        .from('rental_attachments')
        .delete()
        .eq('id', id);

    if (dbError) {
        console.error('Error deleting attachment record:', dbError);
        throw dbError;
    }

    return true;
}

export function getAttachmentUrl(filePath: string) {
    const { data } = supabase.storage
        .from('rental-documents')
        .getPublicUrl(filePath);

    return data.publicUrl;
}
