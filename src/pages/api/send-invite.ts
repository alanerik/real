import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

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
      console.error('Supabase Invite error:', error);

      // Generate a fallback link for manual sharing
      const fallbackLink = `${siteUrl}/tenant/accept-invitation?email=${encodeURIComponent(email)}`;

      return new Response(JSON.stringify({
        error: error.message,
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
    console.error('Server error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500 });
  }
};
