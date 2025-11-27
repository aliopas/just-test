#!/usr/bin/env node

/**
 * Script to run Story 3.4 tests
 * Usage: node run-tests.js
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('========================================');
console.log('اختبار Story 3.4: رفع الملفات');
console.log('========================================');
console.log('');

// Run Jest tests
const jestProcess = spawn('npx', [
  'jest',
  'backend/tests/request.controller.test.ts',
  '--testNamePattern=presignAttachment',
  '--verbose'
], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

jestProcess.on('close', (code) => {
  console.log('');
  console.log('========================================');
  if (code === 0) {
    console.log('✅ جميع الاختبارات نجحت!');
  } else {
    console.log('❌ بعض الاختبارات فشلت');
  }
  console.log('========================================');
  process.exit(code);
});

jestProcess.on('error', (error) => {
  console.error('❌ خطأ في تشغيل الاختبارات:', error.message);
  console.log('');
  console.log('حاول تشغيل:');
  console.log('  npm test -- request.controller.test.ts --testNamePattern="presignAttachment"');
  process.exit(1);
});

