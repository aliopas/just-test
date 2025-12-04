#!/usr/bin/env node

/**
 * سكريبت اختبار بسيط لتسجيل الدخول
 * Usage: node test-login-simple.js
 */

const https = require('https');
const http = require('http');

// البيانات الافتراضية
const EMAIL = 'bacuratec2030@gmail.com';
const PASSWORD = 'BACURA2030@@440';
const BACKEND_URL = process.env.BACKEND_URL || 'https://investor-bacura.netlify.app';

const loginData = JSON.stringify({
  email: EMAIL,
  password: PASSWORD,
});

const url = new URL(`${BACKEND_URL}/api/v1/auth/login`);

console.log('==========================================');
console.log('اختبار تسجيل الدخول');
console.log('==========================================');
console.log(`البريد الإلكتروني: ${EMAIL}`);
console.log(`URL السيرفر: ${BACKEND_URL}`);
console.log(`المسار الكامل: ${url.href}`);
console.log('==========================================');
console.log('');

const options = {
  hostname: url.hostname,
  port: url.port || (url.protocol === 'https:' ? 443 : 80),
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData),
    'Accept': 'application/json',
  },
};

const client = url.protocol === 'https:' ? https : http;

const req = client.request(options, (res) => {
  let data = '';

  console.log(`\n📊 حالة الاستجابة: ${res.statusCode} ${res.statusMessage}`);
  console.log(`📋 Headers:`);
  Object.entries(res.headers).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });
  console.log('');

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📦 Response Body:');
    try {
      const json = JSON.parse(data);
      
      if (res.statusCode === 200) {
        console.log('\n✅ نجح تسجيل الدخول!');
        console.log('\nمعلومات المستخدم:');
        if (json.user) {
          console.log(`   - معرف المستخدم: ${json.user.id}`);
          console.log(`   - البريد الإلكتروني: ${json.user.email}`);
          console.log(`   - الدور: ${json.user.role || 'غير محدد'}`);
        }
        if (json.session) {
          console.log('\nمعلومات الجلسة:');
          console.log(`   - Access Token: ${json.session.accessToken ? '✓ موجود' : '✗ غير موجود'}`);
          console.log(`   - Refresh Token: ${json.session.refreshToken ? '✓ موجود' : '✗ غير موجود'}`);
          console.log(`   - مدة الصلاحية: ${json.session.expiresIn || json.expiresIn || 'غير محدد'} ثانية`);
        }
        console.log('\nالاستجابة الكاملة:');
        console.log(JSON.stringify(json, null, 2));
      } else {
        console.log('\n❌ فشل تسجيل الدخول');
        if (json.error) {
          console.log(`\nرمز الخطأ: ${json.error.code || 'غير معروف'}`);
          console.log(`الرسالة: ${json.error.message || 'خطأ غير معروف'}`);
        }
        console.log('\nالاستجابة الكاملة:');
        console.log(JSON.stringify(json, null, 2));
      }
    } catch (e) {
      console.log('⚠️  فشل تحليل JSON، عرض النص الخام:');
      console.log(data);
    }
    console.log('');
    console.log('==========================================');
    console.log('انتهى الاختبار');
    console.log('==========================================');
  });
});

req.on('error', (error) => {
  console.error('\n❌ خطأ في الاتصال:');
  console.error(`   ${error.message}`);
  console.error('');
  console.error('الأسباب المحتملة:');
  console.error('   1. السيرفر غير متاح أو متوقف');
  console.error('   2. مشكلة في الشبكة أو الإنترنت');
  console.error('   3. مشكلة في SSL/HTTPS');
  console.error('   4. مشكلة CORS');
  console.error('');
  console.log('==========================================');
  console.log('فشل الاختبار');
  console.log('==========================================');
});

req.write(loginData);
req.end();

