const fs = require('fs');
const path = require('path');

// Post-build script to restore src/pages and tsconfig.json after build
// This ensures development continues to work normally

const srcPagesPath = path.join(__dirname, '..', 'src', 'pages');
const srcPagesOldPath = path.join(__dirname, '..', 'src', 'pages-old');
const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');

console.log('Post-build: Restoring directories and tsconfig.json...');

// Restore src/pages from src/pages-old
if (fs.existsSync(srcPagesOldPath) && !fs.existsSync(srcPagesPath)) {
  console.log('✓ Restoring src/pages from src/pages-old...');
  fs.renameSync(srcPagesOldPath, srcPagesPath);
  console.log('✓ src/pages restored successfully');
}

// Restore tsconfig.json to original state
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

// Restore paths
if (tsconfig.compilerOptions.paths && tsconfig.compilerOptions.paths['@/pages/*']) {
  tsconfig.compilerOptions.paths['@/pages/*'] = ['./src/pages/*'];
}

// Restore include to original patterns
if (tsconfig.include && Array.isArray(tsconfig.include)) {
  // Remove specific patterns and restore broad ones
  const hasSpecific = tsconfig.include.some(p => p.includes('app/**/*.ts') || p.includes('src/components/**/*.ts'));
  if (hasSpecific) {
    // Restore to original broad patterns
    tsconfig.include = [
      'next-env.d.ts',
      'types/react-validator.d.ts',
      '**/*.ts',
      '**/*.tsx',
      '.next/types/**/*.ts',
      '.next/dev/types/**/*.ts'
    ];
  }
}

// Remove old directories from exclude (they're no longer needed)
if (tsconfig.exclude && Array.isArray(tsconfig.exclude)) {
  tsconfig.exclude = tsconfig.exclude.filter(item => 
    !item.includes('app-old') && !item.includes('pages-old')
  );
}

fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + '\n');
console.log('✓ Restored tsconfig.json to original state');

console.log('Post-build: Complete');

