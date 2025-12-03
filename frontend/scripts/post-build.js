const fs = require('fs');
const path = require('path');

// Post-build script to restore src/pages and tsconfig.json after build
// This ensures development continues to work normally

const srcPagesPath = path.join(__dirname, '..', 'src', 'pages');
const srcPagesOldPath = path.join(__dirname, '..', 'src', 'pages-old');
const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');

console.log('Post-build: Restoring directories...');

// Restore src/pages from src/pages-old
if (fs.existsSync(srcPagesOldPath) && !fs.existsSync(srcPagesPath)) {
  console.log('✓ Restoring src/pages from src/pages-old...');
  fs.renameSync(srcPagesOldPath, srcPagesPath);
  console.log('✓ src/pages restored successfully');
  
  // Restore tsconfig.json path
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
  if (tsconfig.compilerOptions.paths && tsconfig.compilerOptions.paths['@/pages/*']) {
    tsconfig.compilerOptions.paths['@/pages/*'] = ['./src/pages/*'];
    fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + '\n');
    console.log('✓ Restored tsconfig.json to point @/pages/* to ./src/pages/*');
  }
} else {
  console.log('✓ src/pages already exists or src/pages-old not found (OK)');
}

console.log('Post-build: Complete');

