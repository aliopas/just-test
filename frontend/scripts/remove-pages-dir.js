const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '..', 'src', 'pages');

try {
  if (fs.existsSync(pagesDir)) {
    fs.rmSync(pagesDir, { recursive: true, force: true });
    console.log('✓ Successfully removed src/pages directory');
  } else {
    console.log('✓ src/pages directory does not exist (already removed)');
  }
} catch (error) {
  console.error('✗ Error removing pages directory:', error.message);
  process.exit(1);
}

