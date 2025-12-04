#!/usr/bin/env node

/**
 * سكريبت اختبار تسجيل الدخول
 * Usage: node test-login.js [backend-url]
 */

const https = require('https');
const http = require('http');

// القيم الافتراضية
const EMAIL = 'bacuratec2030@gmail.com';
const PASSWORD = 'BACURA2030@@440';
const BACKEND_URL = process.argv[2] || 'https://investor-bacura.netlify.app';

const loginData = JSON.stringify({
  email: EMAIL,
  password: PASSWORD,
});

const url = new URL(`${BACKEND_URL}/api/v1/auth/login`);

const options = {
  hostname: url.hostname,
  port: url.port || (url.protocol === 'https:' ? 443 : 80),
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData),
  },
};

console.log('==========================================');
console.log('اختبار تسجيل الدخول');
console.log('==========================================');
console.log(`البريد الإلكتروني: ${EMAIL}`);
console.log(`URL السيرفر: ${BACKEND_URL}`);
console.log(`المسار الكامل: ${url.href}`);
console.log('==========================================');
console.log('');

const client = url.protocol === 'https:' ? https : http;

const req = client.request(options, (res) => {
  let data = '';

  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  console.log('');

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response Body:');
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log(data);
    }
    console.log('');
    console.log('==========================================');
    console.log('انتهى الاختبار');
    console.log('==========================================');
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
  console.log('');
  console.log('==========================================');
  console.log('فشل الاختبار');
  console.log('==========================================');
});

req.write(loginData);
req.end();

