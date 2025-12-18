/* eslint-disable no-console */
/**
 * Script لإعادة تعيين كلمة مرور مستخدم في Supabase Auth
 * 
 * الاستخدام:
 *   npm run reset-password -- --email bacuratec2030@gmail.com --password NewPassword123!
 *   أو
 *   ts-node backend/scripts/reset-user-password.ts --email bacuratec2030@gmail.com --password NewPassword123!
 */

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
  console.error(
    'Missing Supabase configuration. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
  );
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function findUserByEmail(email: string) {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    throw new Error(`Failed to list users: ${error.message}`);
  }

  const user = data.users.find((u: any) => u.email === email);
  return user;
}

async function resetPassword(email: string, newPassword: string) {
  console.log(`\n🔐 إعادة تعيين كلمة المرور للمستخدم: ${email}`);

  // البحث عن المستخدم
  const user = await findUserByEmail(email);

  if (!user) {
    console.error(`❌ المستخدم غير موجود: ${email}`);
    console.log('\n💡 المستخدمون الموجودون:');
    const { data: allUsers } = await supabaseAdmin.auth.admin.listUsers();
    allUsers?.users.forEach((u: any) => {
      console.log(`   - ${u.email} (${u.id})`);
    });
    process.exit(1);
  }

  console.log(`✅ تم العثور على المستخدم: ${user.email}`);
  console.log(`   User ID: ${user.id}`);
  console.log(`   Email Confirmed: ${user.email_confirmed_at ? '✅' : '❌'}`);

  // إعادة تعيين كلمة المرور
  const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    password: newPassword,
  });

  if (error) {
    console.error(`❌ فشل إعادة تعيين كلمة المرور: ${error.message}`);
    process.exit(1);
  }

  console.log(`\n✅ تم إعادة تعيين كلمة المرور بنجاح!`);
  console.log(`\n📋 معلومات تسجيل الدخول:`);
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${newPassword}`);
  console.log(`\n⚠️  احفظ هذه المعلومات في مكان آمن!`);
}

// قراءة المعاملات من سطر الأوامر
const args = process.argv.slice(2);
let email: string | undefined;
let password: string | undefined;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--email' && args[i + 1]) {
    email = args[i + 1];
    i++;
  } else if (args[i] === '--password' && args[i + 1]) {
    password = args[i + 1];
    i++;
  }
}

if (!email || !password) {
  console.error('❌ يرجى توفير البريد الإلكتروني وكلمة المرور');
  console.log('\n📖 الاستخدام:');
  console.log('   npm run reset-password -- --email user@example.com --password NewPassword123!');
  console.log('   أو');
  console.log('   ts-node backend/scripts/reset-user-password.ts --email user@example.com --password NewPassword123!');
  process.exit(1);
}

resetPassword(email, password)
  .then(() => {
    console.log('\n✅ تم بنجاح!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ حدث خطأ:', error instanceof Error ? error.message : error);
    process.exit(1);
  });

