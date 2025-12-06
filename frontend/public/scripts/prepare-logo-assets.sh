#!/bin/bash

# Script to prepare logo assets from docs/images/logo.png
# This script copies the logo and creates og-image.png

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PUBLIC_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_ROOT="$(cd "$PUBLIC_DIR/../.." && pwd)"
LOGO_SOURCE="$PROJECT_ROOT/docs/images/logo.png"
OG_IMAGE_OUTPUT="$PUBLIC_DIR/og-image.png"

echo "🚀 Preparing logo assets..."

# Check if source logo exists
if [ ! -f "$LOGO_SOURCE" ]; then
    echo "❌ Error: Logo source not found at $LOGO_SOURCE"
    echo "   Please ensure docs/images/logo.png exists"
    exit 1
fi

echo "✅ Found logo at: $LOGO_SOURCE"

# Check if ImageMagick is installed
if command -v magick &> /dev/null; then
    echo "✅ ImageMagick found, creating og-image.png..."
    
    # Create og-image.png (1200x630) with logo centered
    magick "$LOGO_SOURCE" \
        -resize 800x800 \
        -gravity center \
        -extent 1200x630 \
        -background "#2D6FA3" \
        "$OG_IMAGE_OUTPUT"
    
    echo "✅ Created og-image.png at: $OG_IMAGE_OUTPUT"
else
    echo "⚠️  ImageMagick not found. Please install it or create og-image.png manually."
    echo "   See: frontend/public/README_OG_IMAGE.md"
    echo ""
    echo "   To install ImageMagick:"
    echo "   - macOS: brew install imagemagick"
    echo "   - Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "   - Windows: Download from https://imagemagick.org/script/download.php"
fi

echo ""
echo "📋 Next steps:"
echo "   1. Create og-image.png (if not created automatically)"
echo "   2. Update icons in frontend/public/icons/ from logo.png"
echo "   3. See: frontend/public/icons/UPDATE_ICONS_FROM_LOGO.md"
echo ""
echo "✅ Done!"

