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
export const sendTenantInvitation = async (rentalId: string, email: string, propertyTitle?: string) => {
    // First, update the rental with the tenant email
    const { error: updateError } = await supabase
        .from('rentals')
        .update({ tenant_email: email })
        .eq('id', rentalId);

    if (updateError) {
        console.error('Error updating rental with tenant email:', updateError);
        throw updateError;
    }

    // Generate the invitation link
    const inviteUrl = `${window.location.origin}/tenant/accept-invitation?email=${encodeURIComponent(email)}`;

    // Call the API to send the email
    try {
        const response = await fetch('/api/send-invite', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                propertyTitle,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            // Return the fallback link from the API response
            throw new Error(result.error || result.message || 'Failed to send email');
        }

        return {
            success: true,
            message: `Invitación enviada a ${email}`,
            inviteLink: result.inviteLink || inviteUrl,
            data: result
        };
    } catch (error) {
        console.error('Error sending invitation email:', error);
        // Return the invitation link so it can be copied manually
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error al enviar invitación',
            inviteLink: inviteUrl,
            error
        };
    }
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
