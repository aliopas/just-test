import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({
  path:
    process.env.SUPABASE_ENV_PATH ??
    (process.cwd().includes('backend') ? '../.env' : 'backend/.env'),
});

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase configuration. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

type SeedUserConfig = {
  email: string;
  password: string;
  roleSlug: 'admin' | 'investor';
  status?: 'active' | 'pending';
};

async function findRoleId(slug: string): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from('roles')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to lookup role "${slug}": ${error.message}`);
  }

  if (!data?.id) {
    throw new Error(`Role "${slug}" not found`);
  }

  return data.id;
}

async function findUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  let page = 1;
  const perPage = 200;

  for (;;) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    const matched = data.users?.find(
      user => user.email?.trim().toLowerCase() === normalized
    );

    if (matched) {
      return matched;
    }

    if (!data.users?.length || data.users.length < perPage) {
      return undefined;
    }

    page += 1;
  }
}

async function ensureUser(config: SeedUserConfig): Promise<void> {
  const { email, password, roleSlug, status = 'active' } = config;

  const existingUser = await findUserByEmail(email);

  let userId = existingUser?.id;

  if (!userId) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: roleSlug },
    });

    if (error) {
      throw new Error(`Failed to create user ${email}: ${error.message}`);
    }

    userId = data?.user?.id ?? undefined;
  } else {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: { role: roleSlug },
    });

    if (error) {
      throw new Error(`Failed to update user ${email}: ${error.message}`);
    }
  }

  if (!userId) {
    throw new Error(`Unable to resolve user id for ${email}`);
  }

  const roleId = await findRoleId(roleSlug);

  const { error: upsertUserError } = await supabaseAdmin
    .from('users')
    .upsert(
      {
        id: userId,
        email,
        role: roleSlug,
        status,
      },
      { onConflict: 'id' }
    );

  if (upsertUserError) {
    throw new Error(`Failed to upsert profile for ${email}: ${upsertUserError.message}`);
  }

  const { error: upsertRoleError } = await supabaseAdmin
    .from('user_roles')
    .upsert(
      {
        user_id: userId,
        role_id: roleId,
      },
      { onConflict: 'user_id,role_id' }
    );

  if (upsertRoleError) {
    throw new Error(`Failed to map role for ${email}: ${upsertRoleError.message}`);
  }

  console.info(`✔ Seeded ${roleSlug} user: ${email}`);
}

async function main() {
  try {
    await ensureUser({
      email: 'admin.demo@invastors.dev',
      password: 'AdminDemo123!',
      roleSlug: 'admin',
    });

    await ensureUser({
      email: 'investor.demo@invastors.dev',
      password: 'InvestorDemo123!',
      roleSlug: 'investor',
    });

    console.info('✅ Demo users are ready.');
    process.exit(0);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();

