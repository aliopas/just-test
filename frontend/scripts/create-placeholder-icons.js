// Simple script to create placeholder PWA icons
// Run with: node scripts/create-placeholder-icons.js

const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create a simple SVG icon and convert to base64 PNG
// Since we don't have canvas, we'll create a minimal SVG that browsers can use
function createSVGIcon(size) {
  const fontSize = size * 0.6;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#2563eb" rx="${size * 0.1}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">B</text>
</svg>`;
}

// Create minimal PNG data URL (1x1 transparent pixel)
// This is a workaround - browsers should handle SVG in manifest
// But for now, we'll create a simple placeholder
const minimalPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

const sizes = [192, 512];

console.log('Creating placeholder icons...');

sizes.forEach(size => {
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(iconsDir, filename);
  
  // For now, write a minimal transparent PNG
  // In production, replace these with real icons
  fs.writeFileSync(filepath, minimalPNG);
  console.log(`Created ${filename} (placeholder - replace with real icon)`);
});

// Also create SVG versions (some browsers support SVG in manifest)
sizes.forEach(size => {
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  fs.writeFileSync(filepath, createSVGIcon(size));
  console.log(`Created ${filename}`);
});

console.log('\n✅ Placeholder icons created!');
console.log('⚠️  Replace these with real icons before production.');
console.log('   Use the generate-placeholder-icons.html file to create better icons.');

