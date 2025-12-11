import { createClient } from 'npm:@supabase/supabase-js@2.43.5';

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
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

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
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

    // Parse request body
    const body = await req.json();
    const {
      email,
      phone,
      fullName,
      role = 'investor',
      status = 'pending',
      locale = 'ar',
      sendInvite = true,
      temporaryPassword,
      investorProfile,
    } = body;

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!sendInvite && !temporaryPassword) {
      return new Response(
        JSON.stringify({ error: 'Temporary password is required when sendInvite is false' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let createdUser;

    // Create user in Auth
    if (sendInvite) {
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: {
          locale,
          full_name: fullName ?? undefined,
        },
      });

      if (inviteError || !inviteData?.user) {
        return new Response(
          JSON.stringify({ error: `Failed to invite user: ${inviteError?.message ?? 'Unknown error'}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      createdUser = inviteData.user;

      if (phone) {
        await supabaseAdmin.auth.admin.updateUserById(createdUser.id, {
          phone,
          user_metadata: {
            locale,
            full_name: fullName ?? null,
          },
        });
      }
    } else {
      const password = temporaryPassword || generateSecurePassword();
      const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        phone: phone ?? undefined,
        password,
        email_confirm: true,
        user_metadata: {
          locale,
          full_name: fullName ?? null,
        },
      });

      if (createError || !created?.user) {
        return new Response(
          JSON.stringify({ error: `Failed to create auth user: ${createError?.message ?? 'Unknown error'}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      createdUser = created.user;
    }

    // Insert into users table
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: createdUser.id,
        email,
        phone: phone ?? null,
        role,
        status,
      });

    if (insertError) {
      // Clean up auth user if insert fails
      await supabaseAdmin.auth.admin.deleteUser(createdUser.id);
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Assign role
    if (role) {
      const { data: roleData } = await supabaseAdmin
        .from('roles')
        .select('id')
        .eq('slug', role.toLowerCase())
        .single();

      if (roleData) {
        await supabaseAdmin
          .from('user_roles')
          .upsert({
            user_id: createdUser.id,
            role_id: roleData.id,
            assigned_by: user.id,
          });
      }
    }

    // Create investor profile if needed
    if (investorProfile || fullName) {
      await supabaseAdmin
        .from('investor_profiles')
        .upsert({
          user_id: createdUser.id,
          full_name: fullName ?? null,
          language: investorProfile?.language ?? locale ?? 'ar',
          communication_preferences: {
            email: true,
            sms: false,
            push: false,
          },
          id_type: investorProfile?.idType ?? null,
          id_number: investorProfile?.idNumber ?? null,
          nationality: investorProfile?.nationality ?? null,
          residency_country: investorProfile?.residencyCountry ?? null,
          city: investorProfile?.city ?? null,
          kyc_status: investorProfile?.kycStatus ?? 'pending',
          risk_profile: investorProfile?.riskProfile ?? null,
        });
    }

    // Log audit
    await supabaseAdmin.from('audit_logs').insert({
      actor_id: user.id,
      action: 'admin.users.create',
      target_type: 'user',
      target_id: createdUser.id,
      diff: {
        email: { before: null, after: email },
        phone: { before: null, after: phone ?? null },
        role: { before: null, after: role },
        status: { before: null, after: status },
      },
    });

    // Fetch created user from view
    const { data: userData } = await supabaseAdmin
      .from('v_admin_users')
      .select('*')
      .eq('id', createdUser.id)
      .single();

    return new Response(
      JSON.stringify({ message: 'User created successfully', user: userData }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateSecurePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password + 'Aa1';
}

