import { supabase } from './supabase';

/**
 * Utility functions for rental management
 */

// Available services that can be included in a rental
export const AVAILABLE_SERVICES = [
    { value: 'water', label: 'Agua', icon: '' },
    { value: 'electricity', label: 'Electricidad', icon: '' },
    { value: 'gas', label: 'Gas', icon: '' },
    { value: 'internet', label: 'Internet', icon: '' },
    { value: 'cable', label: 'Cable TV', icon: '' },
    { value: 'parking', label: 'Estacionamiento', icon: '' },
    { value: 'pool', label: 'Piscina', icon: '' },
    { value: 'gym', label: 'Gimnasio', icon: '' },
    { value: 'cleaning', label: 'Limpieza', icon: '' },
] as const;

// Rental types
export const RENTAL_TYPES = {
    long_term: { label: 'Alquiler Anual', icon: '', description: '12+ meses' },
    short_term: { label: 'Alquiler Temporal', icon: '', description: '1-11 meses' },
    vacation: { label: 'Alquiler Vacacional', icon: '', description: 'Días/Semanas' },
} as const;

// Rental status
export const RENTAL_STATUS = {
    pending: { label: 'Pendiente', color: 'warning' },
    active: { label: 'Activo', color: 'success' },
    near_expiration: { label: 'Próximo a Vencer', color: 'warning' },
    expired: { label: 'Vencido', color: 'danger' },
    terminated: { label: 'Terminado', color: 'default' },
    cancelled: { label: 'Cancelado', color: 'danger' },
} as const;

/**
 * Calculate rental duration in months and days
 */
export const calculateRentalDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate total days
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const duration_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calculate months
    const months = (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());

    return {
        duration_months: months,
        duration_days: duration_days,
    };
};

/**
 * Get remaining days until end date
 */
export const getRemainingDays = (endDate: string): number => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return remainingDays > 0 ? remainingDays : 0;
};

/**
 * Calculate rental progress percentage
 */
export const getRentalProgress = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    // If not started yet
    if (today < start) return 0;

    // If already ended
    if (today > end) return 100;

    const totalDuration = end.getTime() - start.getTime();
    const elapsed = today.getTime() - start.getTime();

    return Math.round((elapsed / totalDuration) * 100);
};

/**
 * Determine rental status based on dates
 */
export const determineRentalStatus = (
    startDate: string,
    endDate: string,
    currentStatus?: string
): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    // If manually terminated or cancelled, keep that status
    if (currentStatus === 'terminated' || currentStatus === 'cancelled') {
        return currentStatus;
    }

    // If not started yet
    if (start > today) {
        return 'pending';
    }

    // If already expired
    if (end < today) {
        return 'expired';
    }

    // If expiring soon (30 days or less)
    const daysRemaining = getRemainingDays(endDate);
    if (daysRemaining <= 30) {
        return 'near_expiration';
    }

    // Otherwise active
    return 'active';
};

/**
 * Get color for rental type badge (HeroUI colors)
 */
export const getRentalTypeColor = (type: string): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' => {
    switch (type) {
        case 'long_term':
            return 'primary';
        case 'short_term':
            return 'secondary';
        case 'vacation':
            return 'warning';
        default:
            return 'primary';
    }
};

/**
 * Get color for status badge (HeroUI colors)
 */
export const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' => {
    return (RENTAL_STATUS[status as keyof typeof RENTAL_STATUS]?.color as any) || 'default';
};

/**
 * Get service icon
 */
export const getServiceIcon = (service: string): string => {
    const found = AVAILABLE_SERVICES.find(s => s.value === service);
    return found?.icon || '';
};

/**
 * Get service label
 */
export const getServiceLabel = (service: string): string => {
    const found = AVAILABLE_SERVICES.find(s => s.value === service);
    return found?.label || service;
};

/**
 * Format rental type for display
 */
export const formatRentalType = (type: string): string => {
    return RENTAL_TYPES[type as keyof typeof RENTAL_TYPES]?.label || type;
};

/**
 * Format status for display
 */
export const formatStatus = (status: string): string => {
    return RENTAL_STATUS[status as keyof typeof RENTAL_STATUS]?.label || status;
};

/**
 * Check if rental is expiring soon
 */
export const isExpiringSoon = (endDate: string, days: number = 30): boolean => {
    const remaining = getRemainingDays(endDate);
    return remaining > 0 && remaining <= days;
};

/**
 * Update rental status in database
 */
export const updateRentalStatus = async (rentalId: string) => {
    const { data: rental, error: fetchError } = await supabase
        .from('rentals')
        .select('start_date, end_date, status')
        .eq('id', rentalId)
        .single();

    if (fetchError || !rental) {
        throw fetchError || new Error('Rental not found');
    }

    const newStatus = determineRentalStatus(rental.start_date, rental.end_date, rental.status);

    if (newStatus !== rental.status) {
        const { error: updateError } = await supabase
            .from('rentals')
            .update({ status: newStatus })
            .eq('id', rentalId);

        if (updateError) throw updateError;
    }

    return newStatus;
};
