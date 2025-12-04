#!/usr/bin/env node
// Wrapper script to run next lint without npm passing extra arguments
const { execSync } = require('child_process');
const path = require('path');

try {
  // Change to frontend directory
  const frontendDir = path.resolve(__dirname, '..');
  process.chdir(frontendDir);
  
  // Use npx but ensure we're in the right directory and pass explicit empty string for any directory arg
  // The issue is npm is somehow passing 'lint' as a directory argument
  // We'll use npx with explicit path to avoid this
  execSync('npx next lint', { 
    stdio: 'inherit',
    cwd: frontendDir,
    env: { ...process.env }
  });
} catch (error) {
  // If error status is available, use it; otherwise exit with 1
  process.exit(error.status || 1);
}

