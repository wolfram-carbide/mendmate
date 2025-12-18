/**
 * Simple favicon generator script
 * This creates a PNG version of the MendMate logo for the favicon
 *
 * If sharp is available, run: npm install sharp
 * Then run: node scripts/generate-favicon.js
 *
 * Otherwise, use the SVG favicon which works in all modern browsers
 */

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// SVG content for the logo
const svgContent = `
<svg width="512" height="512" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="favicon-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#C2410C"/>
      <stop offset="100%" style="stop-color:#FBBF24"/>
    </linearGradient>
  </defs>
  <path d="M40 4 C58 4 68 4 72 8 C76 12 76 22 76 40 C76 58 76 68 72 72 C68 76 58 76 40 76 C22 76 12 76 8 72 C4 68 4 58 4 40 C4 22 4 12 8 8 C12 4 22 4 40 4" fill="url(#favicon-gradient)"/>
  <path d="M16 54 L28 28 L40 41 L52 23 L64 18" fill="none" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const outputPath = join(__dirname, '../client/public/favicon.png');

// Generate PNG at 32x32 (standard favicon size)
sharp(Buffer.from(svgContent))
  .resize(32, 32)
  .png()
  .toFile(outputPath)
  .then(() => {
    console.log('✅ Favicon generated successfully at:', outputPath);
  })
  .catch(err => {
    console.error('❌ Error generating favicon:', err);
    process.exit(1);
  });
