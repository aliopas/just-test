import { createClient } from 'npm:@supabase/supabase-js@2.43.5';

Deno.serve(async (req) => {
  // Enhanced CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create Supabase client with user's token for verification
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create Supabase admin client for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if user has admin.users.manage permission
    const { data: hasPermission } = await supabaseAdmin.rpc('fn_user_has_permission', {
      user_id: user.id,
      permission_slug: 'admin.users.manage',
    });

    if (!hasPermission) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract userId from URL path: /admin-update-user/{userId}
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(p => p);
    const userId = pathParts[pathParts.length - 1];
    
    if (!userId || userId === 'admin-update-user') {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body safely
    let body: any = {};
    try {
      const bodyText = await req.text();
      if (bodyText && bodyText.trim()) {
        body = JSON.parse(bodyText);
      }
    } catch (parseError) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, phone, fullName, role, status, locale, investorProfile } = body;

    // Fetch current user data
    const { data: before, error: beforeError } = await supabaseAdmin
      .from('users')
      .select('id,email,phone,role,status')
      .eq('id', userId)
      .single();

    if (beforeError || !before) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const updates: Record<string, unknown> = {};
    if (email !== undefined && email !== before.email) updates.email = email;
    if (phone !== undefined && phone !== before.phone) updates.phone = phone;
    if (status !== undefined && status !== before.status) updates.status = status;
    if (role !== undefined && role !== before.role) updates.role = role;

    if (Object.keys(updates).length > 0) {
      updates.updated_at = new Date().toISOString();
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update(updates)
        .eq('id', userId);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: `Failed to update user: ${updateError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update auth user
      if (email !== undefined || phone !== undefined || locale !== undefined || fullName !== undefined) {
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          email: email ?? undefined,
          phone: phone ?? undefined,
          user_metadata: {
            locale: locale ?? undefined,
            full_name: fullName ?? null,
          },
        });
      }

      // Revoke sessions if status changed to non-active
      if (status !== undefined && status !== 'active' && status !== before.status) {
        await supabaseAdmin.auth.admin.signOut(userId);
      }
    }

    // Update role if changed
    if (role !== undefined && role !== before.role) {
      const { data: currentRoles } = await supabaseAdmin
        .from('user_roles')
        .select('role_id')
        .eq('user_id', userId);

      if (currentRoles && currentRoles.length > 0) {
        await supabaseAdmin
          .from('user_roles')
          .delete()
          .eq('user_id', userId);
      }

      const { data: roleData } = await supabaseAdmin
        .from('roles')
        .select('id')
        .eq('slug', role.toLowerCase())
        .single();

      if (roleData) {
        await supabaseAdmin
          .from('user_roles')
          .upsert({
            user_id: userId,
            role_id: roleData.id,
            assigned_by: user.id,
          });
      }
    }

    // Update investor profile
    if (investorProfile || fullName !== undefined) {
      const profileUpdates: Record<string, unknown> = {};
      if (fullName !== undefined) profileUpdates.full_name = fullName;
      if (investorProfile?.language !== undefined) profileUpdates.language = investorProfile.language;
      if (investorProfile?.idType !== undefined) profileUpdates.id_type = investorProfile.idType;
      if (investorProfile?.idNumber !== undefined) profileUpdates.id_number = investorProfile.idNumber;
      if (investorProfile?.nationality !== undefined) profileUpdates.nationality = investorProfile.nationality;
      if (investorProfile?.residencyCountry !== undefined) profileUpdates.residency_country = investorProfile.residencyCountry;
      if (investorProfile?.city !== undefined) profileUpdates.city = investorProfile.city;
      if (investorProfile?.kycStatus !== undefined) {
        profileUpdates.kyc_status = investorProfile.kycStatus;
        profileUpdates.kyc_updated_at = new Date().toISOString();
      }
      if (investorProfile?.riskProfile !== undefined) profileUpdates.risk_profile = investorProfile.riskProfile;

      if (Object.keys(profileUpdates).length > 0) {
        profileUpdates.profile_updated_at = new Date().toISOString();
        await supabaseAdmin
          .from('investor_profiles')
          .upsert({
            user_id: userId,
            ...profileUpdates,
          });
      }
    }

    // Log audit
    const afterData = {
      email: email ?? before.email,
      phone: phone ?? before.phone,
      role: role ?? before.role,
      status: status ?? before.status,
    };

    await supabaseAdmin.from('audit_logs').insert({
      actor_id: user.id,
      action: 'admin.users.update',
      target_type: 'user',
      target_id: userId,
      diff: {
        email: { before: before.email, after: afterData.email },
        phone: { before: before.phone, after: afterData.phone },
        role: { before: before.role, after: afterData.role },
        status: { before: before.status, after: afterData.status },
      },
    });

    // Fetch updated user
    const { data: userData } = await supabaseAdmin
      .from('v_admin_users')
      .select('*')
      .eq('id', userId)
      .single();

    return new Response(
      JSON.stringify({ message: 'User updated successfully', user: userData }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

