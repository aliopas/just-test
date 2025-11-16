# PWA Icons Generation Guide

This guide will help you generate all the required icons for your Progressive Web App.

## Required Icons

You need to generate the following icon sizes:
- **16x16** - Browser favicon
- **32x32** - Browser favicon
- **72x72** - Android/Chrome
- **96x96** - Android/Chrome
- **128x128** - Android/Chrome
- **144x144** - Android/Chrome
- **152x152** - iOS
- **180x180** - Apple Touch Icon
- **192x192** - Android/Chrome (standard)
- **384x384** - Android/Chrome
- **512x512** - Android/Chrome (splash screen)
- **192x192-maskable** - Maskable icon for Android
- **512x512-maskable** - Maskable icon for Android

## Quick Generation Options

### Option 1: Using Online Tools (Easiest)
1. Create a high-resolution logo (at least 512x512px)
2. Use one of these online generators:
   - **PWA Asset Generator**: https://www.pwabuilder.com/imageGenerator
   - **RealFaviconGenerator**: https://realfavicongenerator.net/
   - **Favicon.io**: https://favicon.io/

### Option 2: Using ImageMagick (Command Line)
If you have ImageMagick installed:

```bash
# Navigate to your source image directory
cd frontend/public/icons

# Generate all sizes from a source image (replace 'logo.png' with your source)
magick logo.png -resize 16x16 favicon-16x16.png
magick logo.png -resize 32x32 favicon-32x32.png
magick logo.png -resize 72x72 icon-72x72.png
magick logo.png -resize 96x96 icon-96x96.png
magick logo.png -resize 128x128 icon-128x128.png
magick logo.png -resize 144x144 icon-144x144.png
magick logo.png -resize 152x152 icon-152x152.png
magick logo.png -resize 180x180 apple-touch-icon.png
magick logo.png -resize 192x192 icon-192x192.png
magick logo.png -resize 384x384 icon-384x384.png
magick logo.png -resize 512x512 icon-512x512.png

# For maskable icons, add padding (safe zone)
magick logo.png -resize 154x154 -gravity center -extent 192x192 -background transparent icon-192x192-maskable.png
magick logo.png -resize 410x410 -gravity center -extent 512x512 -background transparent icon-512x512-maskable.png
```

### Option 3: Using Node.js Script
Install the PWA asset generator package:

```bash
npm install --save-dev pwa-asset-generator
```

Then run:

```bash
npx pwa-asset-generator logo.svg ./frontend/public/icons --background "#ffffff" --manifest ./frontend/public/manifest.json
```

## Maskable Icons Important Notes

Maskable icons need a **safe zone** where important content should be centered:
- The safe zone is 80% of the icon
- 10% padding on all sides
- Should work well with different shapes (circle, square, rounded square)

### Testing Maskable Icons
Use this tool to test your maskable icons:
https://maskable.app/

## Design Guidelines

1. **Keep it simple** - Icons should be recognizable at small sizes
2. **High contrast** - Ensure good visibility on different backgrounds
3. **No text** - Text becomes unreadable at small sizes
4. **Square canvas** - All icons should be square
5. **PNG format** - Use PNG with transparency for best compatibility
6. **Color consistency** - Match your brand colors

## Quick Placeholder Icons (Development)

For development/testing, you can create simple colored squares:

```javascript
// Create placeholder-icons.html and open in browser
<canvas id="canvas" width="512" height="512"></canvas>
<script>
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  
  // Draw blue square with letter
  ctx.fillStyle = '#2563eb';
  ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = 'white';
  ctx.font = 'bold 256px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('B', 256, 256);
  
  // Right-click canvas and save as PNG
</script>
```

## Current Status

After generating icons, place them in the `/frontend/public/icons/` directory with these exact names:
- `favicon-16x16.png`
- `favicon-32x32.png`
- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `apple-touch-icon.png` (180x180)
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`
- `icon-192x192-maskable.png`
- `icon-512x512-maskable.png`

## Verification

After adding icons, verify your PWA setup:
1. Run Lighthouse audit in Chrome DevTools
2. Check manifest at: `chrome://webapks/` (on Android)
3. Test installation on mobile device
4. Verify icons appear correctly when installed

