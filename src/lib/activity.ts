import { supabase } from './supabase';
import { createSupabaseError } from './errors';
import { logger } from './logger';

export interface Activity {
    id?: string;
    rental_id: string;
    user_id?: string;
    activity_type: string;
    description: string;
    metadata?: Record<string, any>;
    created_at?: string;
}

export async function logActivity(activity: Partial<Activity>) {
    logger.supabase('INSERT', 'activity_log', { rental_id: activity.rental_id, type: activity.activity_type });

    const { data, error } = await supabase
        .from('activity_log')
        .insert([activity])
        .select()
        .single();

    if (error) {
        // Log error but don't throw - activity logging should not break main flow
        logger.error('Failed to log activity', { error: error.message, activity });
        return null;
    }

    return data;
}

export async function getActivitiesByRental(rentalId: string, limit: number = 50) {
    logger.supabase('SELECT BY RENTAL', 'activity_log', { rentalId, limit });

    const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .eq('rental_id', rentalId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        throw createSupabaseError(error, 'getActivitiesByRental', 'activity_log');
    }

    return data;
}

export async function getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
}

// Activity type helpers
export const ActivityTypes = {
    PAYMENT_UPLOADED: 'payment_uploaded',
    DOCUMENT_SHARED: 'document_shared',
    DOCUMENT_UPLOADED: 'document_uploaded',
    TICKET_CREATED: 'ticket_created',
    TICKET_RESOLVED: 'ticket_resolved',
    RENEWAL_REQUESTED: 'renewal_requested',
    RENEWAL_APPROVED: 'renewal_approved',
    RENEWAL_REJECTED: 'renewal_rejected',
    CONTRACT_SIGNED: 'contract_signed'
} as const;

// Helper to get icon for activity type
export function getActivityIcon(activityType: string): string {
    const iconMap: Record<string, string> = {
        payment_uploaded: '💳',
        document_shared: '📄',
        document_uploaded: '📤',
        ticket_created: '🔧',
        ticket_resolved: '✅',
        renewal_requested: '🔄',
        renewal_approved: '✅',
        renewal_rejected: '❌',
        contract_signed: '📝'
    };
    return iconMap[activityType] || '📌';
}

// Helper to format relative time
export function getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Justo ahora';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;

    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

// Helper to group activities by date
export function groupActivitiesByDate(activities: Activity[]): { label: string; activities: Activity[] }[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const groups = {
        today: [] as Activity[],
        yesterday: [] as Activity[],
        thisWeek: [] as Activity[],
        older: [] as Activity[]
    };

    activities.forEach(activity => {
        const activityDate = new Date(activity.created_at!);
        activityDate.setHours(0, 0, 0, 0);

        if (activityDate.getTime() === today.getTime()) {
            groups.today.push(activity);
        } else if (activityDate.getTime() === yesterday.getTime()) {
            groups.yesterday.push(activity);
        } else if (activityDate > weekAgo) {
            groups.thisWeek.push(activity);
        } else {
            groups.older.push(activity);
        }
    });

    const result = [];
    if (groups.today.length > 0) result.push({ label: 'Hoy', activities: groups.today });
    if (groups.yesterday.length > 0) result.push({ label: 'Ayer', activities: groups.yesterday });
    if (groups.thisWeek.length > 0) result.push({ label: 'Esta semana', activities: groups.thisWeek });
    if (groups.older.length > 0) result.push({ label: 'Más antiguo', activities: groups.older });

    return result;
}
