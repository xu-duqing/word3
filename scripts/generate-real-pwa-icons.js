import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Helper to generate a PNG with specified width and height
function createIconPNG(size) {
  const png = new PNG({
    width: size,
    height: size,
    filterType: -1,
  });

  const bgR = 24;  // #18
  const bgG = 59;  // #3b
  const bgB = 43;  // #2b
  const radius = Math.floor(size * 0.22); // rounded corner radius

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;

      // Check rounded corners
      let isInside = true;
      let dx = 0;
      let dy = 0;

      if (x < radius) dx = radius - x;
      else if (x >= size - radius) dx = x - (size - radius - 1);

      if (y < radius) dy = radius - y;
      else if (y >= size - radius) dy = y - (size - radius - 1);

      if (dx > 0 && dy > 0) {
        if (dx * dx + dy * dy > radius * radius) {
          isInside = false;
        }
      }

      if (!isInside) {
        png.data[idx] = 0;
        png.data[idx + 1] = 0;
        png.data[idx + 2] = 0;
        png.data[idx + 3] = 0; // Transparent
        continue;
      }

      // Fill background
      png.data[idx] = bgR;
      png.data[idx + 1] = bgG;
      png.data[idx + 2] = bgB;
      png.data[idx + 3] = 255;

      // Simple pixel map for number '3' centered in normalized coordinates (0 to 1)
      const nx = (x - size * 0.3) / (size * 0.4); // 0 to 1 horizontal
      const ny = (y - size * 0.25) / (size * 0.5); // 0 to 1 vertical

      if (nx >= 0 && nx <= 1 && ny >= 0 && ny <= 1) {
        const strokeWidth = 0.22;
        let isNumber3 = false;

        // Top bar: ny between 0 and strokeWidth
        if (ny >= 0 && ny <= strokeWidth && nx >= 0 && nx <= 0.95) {
          isNumber3 = true;
        }
        // Middle bar: ny between 0.45 - strokeWidth/2 and 0.45 + strokeWidth/2
        if (ny >= 0.45 - strokeWidth/2 && ny <= 0.45 + strokeWidth/2 && nx >= 0.1 && nx <= 0.9) {
          isNumber3 = true;
        }
        // Bottom bar: ny between 1 - strokeWidth and 1
        if (ny >= 1 - strokeWidth && ny <= 1 && nx >= 0 && nx <= 0.95) {
          isNumber3 = true;
        }
        // Right vertical top-half: nx between 0.95 - strokeWidth and 0.95, ny between 0 and 0.45
        if (nx >= 0.95 - strokeWidth && nx <= 0.95 && ny >= 0 && ny <= 0.45) {
          isNumber3 = true;
        }
        // Right vertical bottom-half: nx between 0.95 - strokeWidth and 0.95, ny between 0.45 and 1
        if (nx >= 0.95 - strokeWidth && nx <= 0.95 && ny >= 0.45 && ny <= 1) {
          isNumber3 = true;
        }

        if (isNumber3) {
          png.data[idx] = 255;
          png.data[idx + 1] = 255;
          png.data[idx + 2] = 255;
          png.data[idx + 3] = 255;
        }
      }
    }
  }

  return PNG.sync.write(png);
}

const pwa192 = createIconPNG(192);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);
console.log('Generated pwa-192x192.png (192x192 px)');

const pwa512 = createIconPNG(512);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);
console.log('Generated pwa-512x512.png (512x512 px)');

const appleTouch = createIconPNG(180);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch);
console.log('Generated apple-touch-icon.png (180x180 px)');

const favicon = createIconPNG(64);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), favicon);
console.log('Generated favicon.ico (64x64 px)');
