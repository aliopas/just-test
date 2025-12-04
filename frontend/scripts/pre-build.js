const fs = require('fs');
const path = require('path');

// Pre-build script to handle src/app and src/pages to avoid Next.js conflicts
// Next.js requires pages/ and app/ to be in the same folder level
// Since we have app/ in root, we need to move src/pages to root/pages

const srcAppPath = path.join(__dirname, '..', 'src', 'app');
const srcAppOldPath = path.join(__dirname, '..', 'src', 'app-old');
const srcPagesPath = path.join(__dirname, '..', 'src', 'pages');
const srcPagesOldPath = path.join(__dirname, '..', 'src', 'pages-old');
const rootPagesPath = path.join(__dirname, '..', 'pages');
const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');

// Function to update tsconfig.json for build
function updateTsconfigForBuild() {
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
  
  // Ensure @/pages/* continues to point at our SPA pages directory
  if (!tsconfig.compilerOptions.paths) {
    tsconfig.compilerOptions.paths = {};
  }
  tsconfig.compilerOptions.paths['@/pages/*'] = ['./src/spa-pages/*'];

  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + '\n');
  console.log('✓ Updated tsconfig.json for build (paths)');
}

console.log('Pre-build: Checking directories to avoid Next.js conflicts...');

// Handle src/app - move outside src/ to completely avoid Next.js detection
const appBackupPath = path.join(__dirname, '..', '.app-backup');

if (fs.existsSync(srcAppPath)) {
  if (!fs.existsSync(appBackupPath)) {
    console.log('✓ Moving src/app to .app-backup to avoid Next.js conflicts...');
    fs.renameSync(srcAppPath, appBackupPath);
    console.log('✓ src/app moved successfully');
  } else {
    console.log('⚠ .app-backup already exists, removing src/app...');
    fs.rmSync(srcAppPath, { recursive: true, force: true });
    console.log('✓ src/app removed');
  }
} else if (fs.existsSync(srcAppOldPath)) {
  // Clean up old src/app-old if it exists
  console.log('⚠ Removing old src/app-old...');
  fs.rmSync(srcAppOldPath, { recursive: true, force: true });
  console.log('✓ src/app-old removed');
} else {
  console.log('✓ src/app does not exist (OK)');
}

// Handle src/pages - remove completely to avoid Next.js detecting it as Pages Router
// Next.js doesn't allow pages/ and app/ at different levels
// All imports now use @/spa-pages/* instead of @/pages/*

if (fs.existsSync(srcPagesPath)) {
  console.log('⚠ Removing src/pages to avoid Next.js conflicts...');
  fs.rmSync(srcPagesPath, { recursive: true, force: true });
  console.log('✓ src/pages removed');
} else {
  console.log('✓ src/pages does not exist (OK)');
}

// Also clean up src/pages-old if it exists from previous builds
if (fs.existsSync(srcPagesOldPath)) {
  console.log('⚠ Removing old src/pages-old...');
  fs.rmSync(srcPagesOldPath, { recursive: true, force: true });
  console.log('✓ src/pages-old removed');
}

// Remove any root/pages directory that might exist
if (fs.existsSync(rootPagesPath)) {
  console.log('⚠ Removing root/pages to avoid conflict with app/...');
  fs.rmSync(rootPagesPath, { recursive: true, force: true });
  console.log('✓ root/pages removed');
}

// Update tsconfig.json after all directory changes
updateTsconfigForBuild();

console.log('Pre-build: Complete');

