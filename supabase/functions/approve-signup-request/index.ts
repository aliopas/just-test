import { createClient } from 'npm:@supabase/supabase-js@2.43.5';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with user's token
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
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body with error handling
    let body;
    try {
      const text = await req.text();
      if (!text || text.trim() === "") {
        return new Response(
          JSON.stringify({ error: "Request body is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      body = JSON.parse(text);
    } catch (parseError) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { requestId, note, sendInvite = true, locale = "ar" } = body;

    if (!requestId || typeof requestId !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid requestId" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate locale
    if (locale !== "ar" && locale !== "en") {
      return new Response(
        JSON.stringify({ error: "Invalid locale. Must be 'ar' or 'en'" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create admin client for privileged operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get the signup request
    const { data: request, error: requestError } = await adminClient
      .from("investor_signup_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (requestError) {
      console.error("Error fetching signup request:", requestError);
      if (requestError.code === "PGRST116") {
        return new Response(
          JSON.stringify({ error: "Request not found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      return new Response(
        JSON.stringify({ 
          error: `Failed to fetch request: ${requestError.message}` 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!request) {
      return new Response(
        JSON.stringify({ error: "Request not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (request.status !== "pending") {
      return new Response(
        JSON.stringify({ 
          error: "Request already reviewed",
          currentStatus: request.status 
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate email exists
    if (!request.email || typeof request.email !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid signup request: missing email" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create user in Auth
    let createdUser;
    try {
      if (sendInvite) {
        const { data: inviteData, error: inviteError } =
          await adminClient.auth.admin.inviteUserByEmail(request.email, {
            data: {
              locale,
              full_name: request.full_name ?? undefined,
            },
          });

        if (inviteError) {
          console.error("Error inviting user:", inviteError);
          return new Response(
            JSON.stringify({
              error: `Failed to invite user: ${inviteError.message}`,
            }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        if (!inviteData?.user) {
          return new Response(
            JSON.stringify({
              error: "Failed to invite user: No user data returned",
            }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        createdUser = inviteData.user;

        // Update user metadata if phone exists
        if (request.phone) {
          const { error: updateError } = await adminClient.auth.admin.updateUserById(
            createdUser.id,
            {
              phone: request.phone,
              user_metadata: {
                locale,
                full_name: request.full_name ?? null,
              },
            }
          );

          if (updateError) {
            console.warn("Failed to update user metadata:", updateError);
            // Continue anyway - user is created
          }
        }
      } else {
        // Generate temporary password
        const tempPassword =
          Math.random().toString(36).slice(-12) +
          Math.random().toString(36).slice(-12).toUpperCase() +
          "!@#";

        const { data: created, error: createError } =
          await adminClient.auth.admin.createUser({
            email: request.email,
            phone: request.phone ?? undefined,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
              locale,
              full_name: request.full_name,
            },
          });

        if (createError) {
          console.error("Error creating user:", createError);
          return new Response(
            JSON.stringify({
              error: `Failed to create user: ${createError.message}`,
            }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        if (!created?.user) {
          return new Response(
            JSON.stringify({
              error: "Failed to create user: No user data returned",
            }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        createdUser = created.user;
      }
    } catch (authError) {
      console.error("Unexpected error in user creation:", authError);
      return new Response(
        JSON.stringify({
          error: `Failed to create user: ${authError instanceof Error ? authError.message : "Unknown error"}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!createdUser || !createdUser.id) {
      return new Response(
        JSON.stringify({ error: "Failed to create user: Invalid user data" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create user record in users table
    const { error: insertError } = await adminClient.from("users").insert({
      id: createdUser.id,
      email: request.email,
      phone: request.phone ?? null,
      role: (request.requested_role ?? "investor").toLowerCase(),
      status: "active",
    });

    if (insertError) {
      console.error("Failed to insert user record:", insertError);
      // If it's a duplicate key error, the user might already exist - continue
      if (insertError.code !== "23505") {
        // 23505 is unique violation - user might already exist
        return new Response(
          JSON.stringify({
            error: `Failed to create user record: ${insertError.message}`,
            warning: "User created in Auth but failed to create database record",
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      // Continue anyway - user exists in Auth
    }

    // Update signup request
    const { data: updated, error: updateError } = await adminClient
      .from("investor_signup_requests")
      .update({
        status: "approved",
        reviewer_id: user.id,
        reviewed_at: new Date().toISOString(),
        decision_note: note && typeof note === "string" ? note.trim() : null,
        approved_user_id: createdUser.id,
      })
      .eq("id", requestId)
      .eq("status", "pending")
      .select("*")
      .single();

    if (updateError) {
      console.error("Error updating signup request:", updateError);
      return new Response(
        JSON.stringify({
          error: `Failed to update request: ${updateError.message}`,
          warning: "User created but request update failed",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!updated) {
      return new Response(
        JSON.stringify({
          error: "Failed to update request: Request may have been modified",
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        request: {
          id: updated.id,
          status: updated.status,
          reviewedAt: updated.reviewed_at,
          reviewerId: updated.reviewer_id,
          decisionNote: updated.decision_note,
          approvedUserId: updated.approved_user_id,
        },
        user: {
          id: createdUser.id,
          email: createdUser.email ?? request.email,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error in approve-signup-request:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
