import { supabase } from './supabase';

/**
 * Get the current tenant's rental information
 */
export const getTenantRental = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
        .from('rentals')
        .select(`
      *,
      properties (
        id,
        title,
        city,
        image_url,
        bedrooms,
        bathrooms
      )
    `)
        .eq('tenant_user_id', user.id)
        .single();

    if (error) {
        console.error('Error fetching tenant rental:', error);
        throw error;
    }

    return data;
};

/**
 * Check if a user is a tenant (has an active rental)
 */
export const isTenant = async () => {
    try {
        const rental = await getTenantRental();
        return !!rental;
    } catch {
        return false;
    }
};

/**
 * Create a tenant account and link to rental
 * This is called when tenant accepts invitation
 */
export const linkTenantToRental = async (rentalId: string, userId: string) => {
    const { data, error } = await supabase
        .from('rentals')
        .update({ tenant_user_id: userId })
        .eq('id', rentalId)
        .select()
        .single();

    if (error) {
        console.error('Error linking tenant to rental:', error);
        throw error;
    }

    return data;
};

/**
 * Send invitation email to tenant
 * This would typically integrate with an email service
 */
export const sendTenantInvitation = async (rentalId: string, email: string) => {
    // First, update the rental with the tenant email
    const { error: updateError } = await supabase
        .from('rentals')
        .update({ tenant_email: email })
        .eq('id', rentalId);

    if (updateError) {
        console.error('Error updating rental with tenant email:', updateError);
        throw updateError;
    }

    // In a real implementation, you would:
    // 1. Generate a secure invitation token
    // 2. Send an email with a link like: /tenant/accept-invitation?token=xxx
    // 3. When they click, they create their account and get linked to the rental

    // For now, we'll return a success message
    // You can integrate with services like SendGrid, Resend, or Supabase Edge Functions

    return {
        success: true,
        message: `Invitation would be sent to ${email}`,
        // In production, you'd return the invitation link or confirmation
    };
};

/**
 * Get rental by tenant email (for invitation acceptance)
 */
export const getRentalByEmail = async (email: string) => {
    const { data, error } = await supabase
        .from('rentals')
        .select('*')
        .eq('tenant_email', email)
        .is('tenant_user_id', null) // Only get rentals without linked accounts
        .single();

    if (error) {
        console.error('Error fetching rental by email:', error);
        throw error;
    }

    return data;
};
