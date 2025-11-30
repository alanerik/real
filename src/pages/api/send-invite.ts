import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

// Simple logger for API routes (server-side)
const logger = {
  error: (message: string, error?: any) => {
    if (import.meta.env.DEV) {
      console.error(`❌ [API ERROR] ${message}`, error);
    } else {
      // In production, log only the message without sensitive details
      console.error(`❌ [API ERROR] ${message}`);
    }
  }
};

export const POST: APIRoute = async ({ request }) => {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({
      message: 'Missing Supabase configuration (URL or Service Role Key)',
    }), { status: 500 });
  }

  // Create a Supabase client with the Service Role Key to have admin privileges
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });


  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({
      error: 'Unauthorized: Missing authentication token',
    }), { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return new Response(JSON.stringify({
      error: 'Unauthorized: Invalid or expired token',
    }), { status: 401 });
  }

  const getSiteUrl = () => {
    if (import.meta.env.PUBLIC_SITE_URL) return import.meta.env.PUBLIC_SITE_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return new URL(request.url).origin;
  };

  const siteUrl = getSiteUrl();

  try {
    const body = await request.json();
    const { email, propertyTitle } = body;

    if (!email) {
      return new Response(JSON.stringify({
        message: 'Missing required fields: email',
      }), { status: 400 });
    }

    // Use Supabase Admin to invite the user
    // This sends the standard Supabase "Invite User" email
    // We pass data to be used in the email template
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        property_title: propertyTitle || 'Propiedad'
      },
      redirectTo: `${siteUrl}/tenant/accept-invitation?email=${email}`
    });



    if (error) {
      // Log detailed error server-side only
      logger.error('Supabase Invite error', error);

      // Generate a fallback link for manual sharing
      const fallbackLink = `${siteUrl}/tenant/accept-invitation?email=${encodeURIComponent(email)}`;

      // Return generic error message to client (security best practice)
      return new Response(JSON.stringify({
        error: 'No se pudo enviar la invitación. Por favor intenta de nuevo.',
        fallbackLink
      }), { status: 500 });
    }

    // Also return a link for manual sharing if needed
    const inviteLink = `${siteUrl}/tenant/accept-invitation?email=${encodeURIComponent(email)}`;

    return new Response(JSON.stringify({
      data,
      inviteLink
    }), { status: 200 });
  } catch (error) {
    // Log detailed error server-side only
    logger.error('Server error in send-invite', error);

    // Return generic error to client
    return new Response(JSON.stringify({
      error: 'Error del servidor. Por favor intenta de nuevo.'
    }), { status: 500 });
  }
};
