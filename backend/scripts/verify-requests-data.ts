/**
 * Script to verify that requests data is being fetched correctly from Supabase
 * Run with: npx ts-node backend/scripts/verify-requests-data.ts
 */

import { requireSupabaseAdmin } from '../src/lib/supabase';

async function verifyRequestsData() {
  console.log('🔍 Starting verification of requests data...\n');

  const adminClient = requireSupabaseAdmin();

  try {
    // 1. Check if requests table exists and has data
    console.log('1️⃣ Checking requests table...');
    const { data: requests, error: requestsError, count } = await adminClient
      .from('requests')
      .select('*', { count: 'exact' })
      .limit(5);

    if (requestsError) {
      console.error('❌ Error fetching from requests table:', requestsError);
      return;
    }

    console.log(`✅ Requests table accessible. Total count: ${count ?? 0}`);
    if (requests && requests.length > 0) {
      console.log(`   Sample request:`, {
        id: requests[0].id,
        request_number: requests[0].request_number,
        status: requests[0].status,
        type: requests[0].type,
        user_id: requests[0].user_id,
      });
    } else {
      console.log('⚠️  No requests found in the table');
    }

    // 2. Check if v_request_workflow view exists
    console.log('\n2️⃣ Checking v_request_workflow view...');
    const { data: workflowData, error: workflowError } = await adminClient
      .from('v_request_workflow')
      .select('*')
      .limit(3);

    if (workflowError) {
      console.error('❌ Error fetching from v_request_workflow view:', workflowError);
      console.error('   This view is required for investor requests!');
    } else {
      console.log(`✅ v_request_workflow view accessible. Found ${workflowData?.length ?? 0} records`);
      if (workflowData && workflowData.length > 0) {
        console.log(`   Sample workflow data:`, {
          id: workflowData[0].id,
          request_number: workflowData[0].request_number,
          status: workflowData[0].status,
          last_event: workflowData[0].last_event,
        });
      }
    }

    // 3. Check users table
    console.log('\n3️⃣ Checking users table...');
    const { data: users, error: usersError, count: usersCount } = await adminClient
      .from('users')
      .select('id, email, role, status', { count: 'exact' })
      .limit(3);

    if (usersError) {
      console.error('❌ Error fetching from users table:', usersError);
    } else {
      console.log(`✅ Users table accessible. Total count: ${usersCount ?? 0}`);
      if (users && users.length > 0) {
        console.log(`   Sample user:`, users[0]);
      }
    }

    // 4. Check investor_profiles table
    console.log('\n4️⃣ Checking investor_profiles table...');
    const { data: profiles, error: profilesError, count: profilesCount } = await adminClient
      .from('investor_profiles')
      .select('user_id, full_name, preferred_name', { count: 'exact' })
      .limit(3);

    if (profilesError) {
      console.error('❌ Error fetching from investor_profiles table:', profilesError);
    } else {
      console.log(`✅ investor_profiles table accessible. Total count: ${profilesCount ?? 0}`);
      if (profiles && profiles.length > 0) {
        console.log(`   Sample profile:`, profiles[0]);
      }
    }

    // 5. Test admin requests query (similar to listAdminRequests)
    console.log('\n5️⃣ Testing admin requests query...');
    const { data: adminRequests, error: adminError, count: adminCount } = await adminClient
      .from('requests')
      .select(
        `
        id,
        request_number,
        status,
        type,
        amount,
        currency,
        target_price,
        expiry_at,
        metadata,
        created_at,
        updated_at,
        user_id
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .limit(5);

    if (adminError) {
      console.error('❌ Error in admin requests query:', adminError);
    } else {
      console.log(`✅ Admin requests query successful. Found ${adminCount ?? 0} total requests`);
      if (adminRequests && adminRequests.length > 0) {
        console.log(`   Sample admin request:`, {
          id: adminRequests[0].id,
          request_number: adminRequests[0].request_number,
          status: adminRequests[0].status,
          type: adminRequests[0].type,
          user_id: adminRequests[0].user_id,
        });
      }
    }

    // 6. Test investor requests query (similar to listInvestorRequests)
    console.log('\n6️⃣ Testing investor requests query...');
    if (users && users.length > 0) {
      const testUserId = users[0].id;
      const { data: investorRequests, error: investorError, count: investorCount } = await adminClient
        .from('v_request_workflow')
        .select(
          `
          id,
          request_number,
          type,
          amount,
          currency,
          target_price,
          expiry_at,
          status,
          created_at,
          updated_at,
          last_event
        `,
          { count: 'exact' }
        )
        .eq('user_id', testUserId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (investorError) {
        console.error('❌ Error in investor requests query:', investorError);
      } else {
        console.log(`✅ Investor requests query successful for user ${testUserId}`);
        console.log(`   Found ${investorCount ?? 0} requests for this user`);
        if (investorRequests && investorRequests.length > 0) {
          console.log(`   Sample investor request:`, {
            id: investorRequests[0].id,
            request_number: investorRequests[0].request_number,
            status: investorRequests[0].status,
            type: investorRequests[0].type,
          });
        }
      }
    } else {
      console.log('⚠️  Skipping investor requests test - no users found');
    }

    // 7. Check admin_request_views table
    console.log('\n7️⃣ Checking admin_request_views table...');
    const { data: views, error: viewsError, count: viewsCount } = await adminClient
      .from('admin_request_views')
      .select('*', { count: 'exact' })
      .limit(3);

    if (viewsError) {
      console.error('❌ Error fetching from admin_request_views table:', viewsError);
    } else {
      console.log(`✅ admin_request_views table accessible. Total count: ${viewsCount ?? 0}`);
    }

    console.log('\n✅ Verification complete!');
    console.log('\n📋 Summary:');
    console.log(`   - Requests table: ${requestsError ? '❌ Error' : '✅ OK'} (${count ?? 0} records)`);
    console.log(`   - v_request_workflow view: ${workflowError ? '❌ Error' : '✅ OK'}`);
    console.log(`   - Users table: ${usersError ? '❌ Error' : '✅ OK'} (${usersCount ?? 0} records)`);
    console.log(`   - Investor profiles table: ${profilesError ? '❌ Error' : '✅ OK'} (${profilesCount ?? 0} records)`);
    console.log(`   - Admin requests query: ${adminError ? '❌ Error' : '✅ OK'}`);
    console.log(`   - Admin request views: ${viewsError ? '❌ Error' : '✅ OK'} (${viewsCount ?? 0} records)`);

  } catch (error) {
    console.error('❌ Fatal error during verification:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
  }
}

// Run verification
verifyRequestsData()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
