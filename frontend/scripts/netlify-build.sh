#!/bin/bash
set -e

echo "=== Starting Netlify Build Process ==="

# Clean previous builds
echo "Step 1: Cleaning previous builds..."
rm -rf node_modules package-lock.json .next

# Move directories
echo "Step 2: Moving directories..."
if [ -d src/pages ]; then
  mv src/pages pages
  echo "✓ Moved src/pages to pages"
else
  echo "✗ src/pages not found"
fi

if [ -d src/app ]; then
  mv src/app src/app-old
  echo "✓ Moved src/app to src/app-old"
else
  echo "✗ src/app not found (OK)"
fi

# Update tsconfig.json paths
echo "Step 3: Updating tsconfig.json paths..."
node scripts/fix-build-paths.js

# Fix imports in pages directory
echo "Step 4: Fixing imports in pages/..."
if [ -d pages ]; then
  find pages -type f \( -name '*.tsx' -o -name '*.ts' \) -exec sed -i \
    "s|from '\\.\\./components|from '@/components|g; \
     s|from '\\.\\./hooks|from '@/hooks|g; \
     s|from '\\.\\./utils|from '@/utils|g; \
     s|from '\\.\\./styles|from '@/styles|g; \
     s|from '\\.\\./context|from '@/context|g; \
     s|from '\\.\\./types|from '@/types|g; \
     s|from '\\.\\./locales|from '@/locales|g" {} \;
  echo "✓ Fixed imports"
else
  echo "✗ pages directory not found"
fi

# Install dependencies
echo "Step 5: Installing dependencies..."
npm install

# Build
echo "Step 6: Starting build..."
npm run build

echo "=== Build Complete ==="

