// scripts/optimize-images.js
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

async function optimizeImages() {
  // Ensure the public/assets directory exists
  const assetsDir = join(projectRoot, 'public', 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  try {
    // Create the social media optimized version
    await sharp(join(projectRoot, 'cards', 'verso baralho.png'))
      .resize(1200, 630, {
        fit: 'contain',
        background: { r: 30, g: 27, b: 75, alpha: 1 } // #1e1b4b (indigo-950)
      })
      .jpeg({ quality: 85 })
      .toFile(join(assetsDir, 'verso-baralho-social.jpg'));

    // Copy and optimize the original for web use
    await sharp(join(projectRoot, 'cards', 'verso baralho.png'))
      .png({ quality: 85 })
      .toFile(join(assetsDir, 'verso-baralho.png'));

    console.log('Images optimized successfully!');
  } catch (error) {
    console.error('Error optimizing images:', error);
    process.exit(1);
  }
}

optimizeImages().catch(console.error);
