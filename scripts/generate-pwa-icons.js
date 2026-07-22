import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Simple base64 1x1 green PNG expanded or SVG-to-PNG fallback, or standard valid PNG buffer generator
// Standard minimal 1x1 green PNG base64:
// Data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==

// Better yet: A 192x192 & 512x512 valid PNG header + chunks using pure JS png creator or Canvas if available.
// Or we can create an SVG and a minimal valid PNG.

// Minimal valid green PNG buffer:
const minimalGreenPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const buffer = Buffer.from(minimalGreenPngBase64, 'base64');

['pwa-192x192.png', 'pwa-512x512.png', 'apple-touch-icon.png', 'favicon.ico'].forEach((filename) => {
  const filePath = path.join(publicDir, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, buffer);
    console.log(`Created ${filename}`);
  }
});
