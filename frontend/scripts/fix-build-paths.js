const fs = require('fs');
const path = require('path');

// Keep tsconfig.json paths as is - SPA pages live in src/spa-pages
// Next.js doesn't allow pages/ and app/ directories at the same level
const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

// Ensure @/pages/* points to ./src/spa-pages/* (don't change it)
if (tsconfig.compilerOptions.paths) {
  if (!tsconfig.compilerOptions.paths['@/pages/*']) {
    tsconfig.compilerOptions.paths['@/pages/*'] = ['./src/spa-pages/*'];
    console.log('✓ Set @/pages/* path mapping to ./src/spa-pages/*');
  } else if (tsconfig.compilerOptions.paths['@/pages/*'][0] !== './src/spa-pages/*') {
    tsconfig.compilerOptions.paths['@/pages/*'] = ['./src/spa-pages/*'];
    console.log('✓ Updated @/pages/* path mapping to ./src/spa-pages/*');
  } else {
    console.log('✓ @/pages/* path mapping is correct (./src/spa-pages/*)');
  }
}

// Ensure old files are excluded from build
const excludeList = [
  'node_modules',
  'vite.config.ts',
  'src/app',
  'src/App.tsx',
  'src/main.tsx',
  'src/index.html'
];

if (!tsconfig.exclude) {
  tsconfig.exclude = [];
}

// Add missing exclusions
excludeList.forEach(item => {
  if (!tsconfig.exclude.includes(item)) {
    tsconfig.exclude.push(item);
  }
});

fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + '\n');
console.log('✓ tsconfig.json updated successfully');

