import { supabase } from './supabase';
import { createSupabaseError, ValidationError } from './errors';
import { logger } from './logger';

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

// Type for rentals with joined data from database queries
type RentalWithJoins = Rental & {
    payments?: PaymentStatus[];
    paymentStatus?: string;
};

interface PaymentStatus {
    id: string;
    amount: number;
    due_date: string;
    status: string;
}

export async function getRentals() {
    logger.supabase('SELECT', 'rentals');

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
        throw createSupabaseError(error, 'getRentals', 'rentals');
    }

    // Calculate payment status for each rental
    return data.map(rental => ({
        ...rental,
        paymentStatus: calculatePaymentStatus(rental.payments || [])
    }));
}

function calculatePaymentStatus(payments: PaymentStatus[]): string {
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
    logger.supabase('SELECT BY ID', 'rentals', { id });

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
        throw createSupabaseError(error, 'getRentalById', 'rentals');
    }

    return data;
}

export async function createRental(rental: Rental) {
    logger.supabase('INSERT', 'rentals', { property_id: rental.property_id });

    const { data, error } = await supabase
        .from('rentals')
        .insert([rental])
        .select()
        .single();

    if (error) {
        throw createSupabaseError(error, 'createRental', 'rentals');
    }

    logger.info('Rental created successfully', { id: data.id });
    return data;
}

export async function updateRental(id: string, rental: Partial<Rental>) {
    logger.supabase('UPDATE', 'rentals', { id });

    // Remove joined fields that shouldn't be sent to the DB
    const { properties, payments, paymentStatus, ...updateData } = rental as RentalWithJoins;

    const { data, error } = await supabase
        .from('rentals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw createSupabaseError(error, 'updateRental', 'rentals');
    }

    logger.info('Rental updated successfully', { id });
    return data;
}

export async function deleteRental(id: string) {
    logger.supabase('DELETE', 'rentals', { id });

    const { error } = await supabase
        .from('rentals')
        .delete()
        .eq('id', id);

    if (error) {
        throw createSupabaseError(error, 'deleteRental', 'rentals');
    }

    logger.info('Rental deleted successfully', { id });
    return true;
}

export async function getActiveRentals() {
    const today = new Date().toISOString().split('T')[0];
    logger.supabase('SELECT ACTIVE', 'rentals', { today });

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
        throw createSupabaseError(error, 'getActiveRentals', 'rentals');
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
    logger.supabase('SELECT PAYMENTS', 'payments', { rentalId });

    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('rental_id', rentalId)
        .order('date', { ascending: false });

    if (error) {
        throw createSupabaseError(error, 'getPayments', 'payments');
    }

    return data;
}

export async function createPayment(payment: Payment) {
    logger.supabase('INSERT', 'payments', { rental_id: payment.rental_id });

    const { data, error } = await supabase
        .from('payments')
        .insert([payment])
        .select()
        .single();

    if (error) {
        throw createSupabaseError(error, 'createPayment', 'payments');
    }

    logger.info('Payment created successfully', { id: data.id });
    return data;
}

export async function updatePayment(id: string, payment: Partial<Payment>) {
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
}

export async function deletePayment(id: string) {
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
    uploaded_by_tenant?: boolean;
    created_at?: string;
}

export async function getAttachments(rentalId: string) {
    logger.supabase('SELECT ATTACHMENTS', 'rental_attachments', { rentalId });

    const { data, error } = await supabase
        .from('rental_attachments')
        .select('*')
        .eq('rental_id', rentalId)
        .order('created_at', { ascending: false });

    if (error) {
        throw createSupabaseError(error, 'getAttachments', 'rental_attachments');
    }

    return data;
}

interface UploadOptions {
    category?: string;
    description?: string;
    visibleToTenant?: boolean;
    uploadedByTenant?: boolean;
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

    const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];

    // Validate file size
    if (file.size > MAX_SIZE) {
        throw new ValidationError('El archivo excede el tamaño máximo de 10MB', 'file');
    }

    // Validate MIME type
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new ValidationError(
            `Tipo de archivo no permitido. Formatos aceptados: PDF, DOC, DOCX, JPG, PNG`,
            'file'
        );
    }

    // Validate file extension (double-check for security)
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
        throw new ValidationError(
            `Extensión de archivo no permitida. Extensiones aceptadas: ${ALLOWED_EXTENSIONS.join(', ')}`,
            'file'
        );
    }

    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${rentalId}/${fileName}`;

    logger.supabase('UPLOAD', 'rental-documents', { fileName, size: file.size });

    // Upload to Storage
    const { error: uploadError } = await supabase.storage
        .from('rental-documents')
        .upload(filePath, file);

    if (uploadError) {
        throw createSupabaseError(uploadError, 'uploadAttachment', 'rental-documents');
    }

    // Create record in DB
    const attachment: Attachment = {
        rental_id: rentalId,
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
        category: options.category || 'other',
        description: options.description || '',
        visible_to_tenant: options.visibleToTenant ?? true,
        uploaded_by_tenant: options.uploadedByTenant ?? false
    };

    const { data, error: dbError } = await supabase
        .from('rental_attachments')
        .insert([attachment])
        .select()
        .single();

    if (dbError) {
        // Clean up storage if DB insert fails
        await supabase.storage.from('rental-documents').remove([filePath]);
        throw createSupabaseError(dbError, 'uploadAttachment', 'rental_attachments');
    }

    logger.info('Attachment uploaded successfully', { id: data.id, fileName: file.name });
    return data;
}

export async function deleteAttachment(id: string, filePath: string) {
    logger.supabase('DELETE', 'rental_attachments', { id });

    // Delete from Storage
    const { error: storageError } = await supabase.storage
        .from('rental-documents')
        .remove([filePath]);

    if (storageError) {
        throw createSupabaseError(storageError, 'deleteAttachment', 'rental-documents');
    }

    // Delete from DB
    const { error: dbError } = await supabase
        .from('rental_attachments')
        .delete()
        .eq('id', id);

    if (dbError) {
        throw createSupabaseError(dbError, 'deleteAttachment', 'rental_attachments');
    }

    logger.info('Attachment deleted successfully', { id });
    return true;
}

export function getAttachmentUrl(filePath: string) {
    const { data } = supabase.storage
        .from('rental-documents')
        .getPublicUrl(filePath);

    return data.publicUrl;
}
