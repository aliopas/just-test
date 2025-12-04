#!/usr/bin/env node
// Wrapper script to run next lint without npm passing extra arguments
// This works around an issue where npm/npx passes 'lint' as a directory argument to next lint
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

try {
  // Change to frontend directory
  const frontendDir = path.resolve(__dirname, '..');
  process.chdir(frontendDir);
  
  // Use require.resolve to find the next package
  let nextCliPath;
  try {
    // Try to resolve next/bin/next
    nextCliPath = require.resolve('next/bin/next');
  } catch (e) {
    // Fallback: construct path manually
    const nextPackagePath = require.resolve('next/package.json');
    const nextDir = path.dirname(nextPackagePath);
    // Next.js 16 might have the CLI in different locations
    const possiblePaths = [
      path.join(nextDir, 'dist', 'bin', 'next'),
      path.join(nextDir, 'bin', 'next'),
      path.join(nextDir, 'cli', 'next.js'),
    ];
    
    nextCliPath = possiblePaths.find(p => fs.existsSync(p));
    if (!nextCliPath) {
      throw new Error('Could not find Next.js CLI. Tried: ' + possiblePaths.join(', '));
    }
  }
  
  // Clean environment - remove npm lifecycle variables that might confuse next
  const cleanEnv = { ...process.env };
  // Remove npm lifecycle variables
  Object.keys(cleanEnv).forEach(key => {
    if (key.startsWith('npm_') || key.startsWith('npm_config_')) {
      delete cleanEnv[key];
    }
  });
  // Explicitly set NODE_ENV if not set
  if (!cleanEnv.NODE_ENV) {
    cleanEnv.NODE_ENV = 'development';
  }
  
  // Spawn node with the next CLI directly, passing only 'lint' as argument
  // Use spawn instead of execFileSync to avoid any shell interpretation
  const child = spawn('node', [nextCliPath, 'lint'], {
    stdio: 'inherit',
    cwd: frontendDir,
    shell: false,
    env: cleanEnv
  });
  
  child.on('exit', (code) => {
    process.exit(code || 0);
  });
  
  child.on('error', (error) => {
    console.error('Error spawning next lint:', error.message);
    process.exit(1);
  });
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

