#!/bin/bash
# Exit on error, but allow continuation for some operations
set -e

# Function to log with timestamp
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "=== Starting Netlify Build Process ==="
log "Current directory: $(pwd)"
log "Node version: $(node --version)"
log "NPM version: $(npm --version)"

# Clean only .next directory (don't delete node_modules - too slow and Netlify caches it)
log "Step 1: Cleaning previous build output..."
rm -rf .next || true

# Move directories
log "Step 2: Preparing directories for Next.js build..."

if [ -d src/app ]; then
  mv src/app src/app-old || true
  log "✓ Moved src/app to src/app-old"
else
  log "✓ src/app already moved or doesn't exist (OK)"
fi

# Ensure pages directory doesn't exist in root (would conflict with app/)
if [ -d pages ]; then
  log "⚠ Removing root/pages to avoid conflict with app/..."
  rm -rf pages || true
  log "✓ root/pages removed"
fi

# Update tsconfig.json paths (keep src/pages mapping)
log "Step 3: Updating tsconfig.json paths..."
if [ -f scripts/fix-build-paths.js ]; then
  node scripts/fix-build-paths.js || log "⚠ fix-build-paths.js failed, continuing..."
  log "✓ tsconfig.json updated"
else
  log "⚠ fix-build-paths.js not found, skipping..."
fi

# Install dependencies (Netlify caches node_modules, so this should be fast)
log "Step 4: Installing dependencies..."
if ! npm ci --prefer-offline --no-audit --no-fund; then
  log "⚠ npm ci failed, trying npm install..."
  npm install --prefer-offline --no-audit --no-fund || {
    log "❌ Failed to install dependencies"
    exit 1
  }
fi

# Build - Netlify handles timeout via netlify.toml timeout setting
log "Step 5: Starting Next.js build..."
if npm run build; then
  log "✓ Build completed successfully"
else
  BUILD_EXIT_CODE=$?
  log "❌ Build failed with exit code $BUILD_EXIT_CODE"
  exit $BUILD_EXIT_CODE
fi

log "=== Build Complete ==="
log "Build output directory: .next"

