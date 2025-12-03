#!/bin/bash
set -e

echo "=== Starting Netlify Build Process ==="

# Clean previous builds
echo "Step 1: Cleaning previous builds..."
rm -rf node_modules package-lock.json .next

# Move directories
echo "Step 2: Moving directories..."
# Don't move src/pages - keep it in src/ to avoid conflicts with app/
# Next.js doesn't allow pages/ and app/ in the same level

if [ -d src/app ]; then
  mv src/app src/app-old
  echo "✓ Moved src/app to src/app-old"
else
  echo "✗ src/app not found (OK)"
fi

# Ensure pages directory doesn't exist in root (would conflict with app/)
if [ -d pages ]; then
  echo "⚠ Warning: pages/ directory exists in root, removing to avoid conflict with app/"
  rm -rf pages
fi

# Update tsconfig.json paths (keep src/pages mapping)
echo "Step 3: Updating tsconfig.json paths..."
node scripts/fix-build-paths.js

# Install dependencies
echo "Step 4: Installing dependencies..."
npm install

# Build
echo "Step 5: Starting build..."
npm run build

echo "=== Build Complete ==="

