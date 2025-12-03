#!/bin/bash
set -e

echo "=== Starting Netlify Build Process ==="
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Clean only .next directory (don't delete node_modules - too slow and Netlify caches it)
echo "Step 1: Cleaning previous build output..."
rm -rf .next

# Move directories
echo "Step 2: Preparing directories for Next.js build..."
# Don't move src/pages - keep it in src/ to avoid conflicts with app/
# Next.js doesn't allow pages/ and app/ in the same level

if [ -d src/app ]; then
  mv src/app src/app-old
  echo "✓ Moved src/app to src/app-old"
else
  echo "✓ src/app already moved or doesn't exist (OK)"
fi

# Ensure pages directory doesn't exist in root (would conflict with app/)
if [ -d pages ]; then
  echo "⚠ Removing root/pages to avoid conflict with app/..."
  rm -rf pages
  echo "✓ root/pages removed"
fi

# Update tsconfig.json paths (keep src/pages mapping)
echo "Step 3: Updating tsconfig.json paths..."
if [ -f scripts/fix-build-paths.js ]; then
  node scripts/fix-build-paths.js
  echo "✓ tsconfig.json updated"
else
  echo "⚠ fix-build-paths.js not found, skipping..."
fi

# Install dependencies (Netlify caches node_modules, so this should be fast)
echo "Step 4: Installing dependencies..."
npm ci --prefer-offline --no-audit --no-fund || npm install --prefer-offline --no-audit --no-fund

# Build
echo "Step 5: Starting Next.js build..."
npm run build

echo "=== Build Complete ==="
echo "Build output directory: .next"

