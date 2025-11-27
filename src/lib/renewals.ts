import { supabase } from './supabase';
import { createSupabaseError, ValidationError } from './errors';
import { logger } from './logger';
import type { Rental } from './rentals';

export interface RenewalRequest {
    id?: string;
    rental_id: string;
    requested_by: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    requested_duration_months: number;
    proposed_amount: number;
    tenant_message?: string;
    admin_response?: string;
    created_at?: string;
    updated_at?: string;
}

export async function createRenewalRequest(request: Partial<RenewalRequest>) {
    logger.supabase('INSERT', 'renewal_requests', { rental_id: request.rental_id });

    // Validation
    if (!request.requested_duration_months || request.requested_duration_months < 6) {
        throw new ValidationError('La duración mínima es de 6 meses', 'requested_duration_months');
    }

    if (!request.proposed_amount || request.proposed_amount <= 0) {
        throw new ValidationError('El monto debe ser mayor a 0', 'proposed_amount');
    }

    const { data, error } = await supabase
        .from('renewal_requests')
        .insert([{
            ...request,
            status: 'pending'
        }])
        .select()
        .single();

    if (error) {
        throw createSupabaseError(error, 'createRenewalRequest', 'renewal_requests');
    }

    logger.info('Renewal request created successfully', { id: data.id });
    return data;
}

export async function getRenewalRequestsByRental(rentalId: string) {
    logger.supabase('SELECT BY RENTAL', 'renewal_requests', { rentalId });

    const { data, error } = await supabase
        .from('renewal_requests')
        .select('*')
        .eq('rental_id', rentalId)
        .order('created_at', { ascending: false });

    if (error) {
        throw createSupabaseError(error, 'getRenewalRequestsByRental', 'renewal_requests');
    }

    return data;
}

export async function getPendingRenewalRequest(rentalId: string) {
    logger.supabase('SELECT PENDING', 'renewal_requests', { rentalId });

    const { data, error } = await supabase
        .from('renewal_requests')
        .select('*')
        .eq('rental_id', rentalId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw createSupabaseError(error, 'getPendingRenewalRequest', 'renewal_requests');
    }

    return data;
}

export async function updateRenewalStatus(
    id: string,
    status: 'approved' | 'rejected' | 'cancelled',
    adminResponse?: string
) {
    logger.supabase('UPDATE STATUS', 'renewal_requests', { id, status });

    const { data, error } = await supabase
        .from('renewal_requests')
        .update({
            status,
            admin_response: adminResponse,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw createSupabaseError(error, 'updateRenewalStatus', 'renewal_requests');
    }

    logger.info('Renewal request status updated', { id, status });
    return data;
}

export function canRequestRenewal(rental: Rental, pendingRequest?: RenewalRequest): { can: boolean; reason?: string } {
    // Check if contract is active
    if (rental.status !== 'active') {
        return { can: false, reason: 'El contrato no está activo' };
    }

    // Check if there's a pending request
    if (pendingRequest) {
        return { can: false, reason: 'Ya tienes una solicitud pendiente' };
    }

    // Check if contract ends within 60 days
    const endDate = new Date(rental.end_date);
    const today = new Date();
    const daysUntilExpiration = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiration > 60) {
        return { can: false, reason: `Podrás solicitar renovación ${daysUntilExpiration - 60} días antes del vencimiento` };
    }

    if (daysUntilExpiration < 0) {
        return { can: false, reason: 'El contrato ya venció' };
    }

    return { can: true };
}

export function getDaysUntilExpiration(endDate: string): number {
    const end = new Date(endDate);
    const today = new Date();
    return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
