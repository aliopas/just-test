const fs = require('fs');
const path = require('path');

// Update tsconfig.json to point @/pages/* to ./pages/* instead of ./src/pages/*
const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

if (tsconfig.compilerOptions.paths) {
  if (tsconfig.compilerOptions.paths['@/pages/*']) {
    tsconfig.compilerOptions.paths['@/pages/*'] = ['./pages/*'];
    console.log('✓ Updated @/pages/* path mapping to ./pages/*');
  }
}

fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + '\n');
console.log('✓ tsconfig.json updated successfully');

