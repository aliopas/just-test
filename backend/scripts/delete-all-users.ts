/* eslint-disable no-console */
import 'dotenv/config';
import { supabaseAdmin } from '../src/lib/supabase';

async function deleteAllUsers() {
  if (!supabaseAdmin) {
    throw new Error(
      'Supabase service role key is required. Please set SUPABASE_SERVICE_ROLE_KEY before running this script.'
    );
  }

  const pageSize = 1000;
  let totalDeleted = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: pageSize,
    });

    if (error) {
      throw new Error(`Failed to list users: ${error.message}`);
    }

    const users = data?.users ?? [];
    hasMore = users.length > 0;
    if (!hasMore) {
      continue;
    }

    for (const user of users) {
      const userId = user.id;
      const email = user.email ?? 'unknown-email';

      const { error: deleteAppUserError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', userId);

      if (deleteAppUserError && deleteAppUserError.code !== 'PGRST116') {
        console.warn(
          `⚠️ Failed to delete user profile for ${email}: ${deleteAppUserError.message}`
        );
      }

      const { error: deleteAuthError } =
        await supabaseAdmin.auth.admin.deleteUser(userId);
      if (deleteAuthError) {
        console.warn(
          `⚠️ Failed to delete auth user for ${email}: ${deleteAuthError.message}`
        );
        continue;
      }

      totalDeleted += 1;
      console.info(`🗑️ Deleted user ${email} (${userId})`);
    }
  }

  console.info(`✅ Completed. Total users deleted: ${totalDeleted}`);
}

deleteAllUsers()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Failed to delete all users:', error);
    process.exit(1);
  });
