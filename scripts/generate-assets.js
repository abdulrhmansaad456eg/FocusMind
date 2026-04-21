#!/usr/bin/env node

/**
 * Asset Generation Script
 * 
 * This script converts SVG assets to PNG format for Expo
 * Requirements: sharp (npm install sharp)
 * 
 * Run: node scripts/generate-assets.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is installed
try {
  require.resolve('sharp');
} catch (e) {
  console.error('❌ sharp is not installed. Run: npm install --save-dev sharp');
  process.exit(1);
}

const sharp = require('sharp');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

// Asset specifications
const assets = [
  {
    name: 'icon.png',
    source: 'icon.svg',
    sizes: [1024], // App icon
  },
  {
    name: 'adaptive-icon.png',
    source: 'adaptive-icon.svg',
    sizes: [108], // Android adaptive icon
  },
  {
    name: 'splash-icon.png',
    source: 'splash-icon.svg',
    sizes: [1024], // Light mode splash
  },
  {
    name: 'splash-icon-dark.png',
    source: 'splash-icon-dark.svg',
    sizes: [1024], // Dark mode splash
  },
  {
    name: 'notification-icon.png',
    source: 'notification-icon.svg',
    sizes: [96, 72, 48], // Notification icons
  },
  {
    name: 'favicon.png',
    source: 'icon.svg',
    sizes: [32], // Web favicon
  },
];

async function generateAsset(asset) {
  const sourcePath = path.join(ASSETS_DIR, asset.source);
  
  if (!fs.existsSync(sourcePath)) {
    console.warn(`⚠️  Source not found: ${asset.source}`);
    return;
  }

  for (const size of asset.sizes) {
    const outputName = asset.sizes.length === 1 
      ? asset.name 
      : asset.name.replace('.png', `-${size}.png`);
    const outputPath = path.join(ASSETS_DIR, outputName);

    try {
      await sharp(sourcePath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${outputName} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${outputName}:`, error.message);
    }
  }
}

async function main() {
  console.log('🎨 Generating FocusMind assets...\n');

  for (const asset of assets) {
    await generateAsset(asset);
  }

  console.log('\n✨ Asset generation complete!');
  console.log('\nNext steps:');
  console.log('1. Review generated PNGs in assets/ folder');
  console.log('2. Run expo prebuild to apply changes');
  console.log('3. Build app: eas build --platform android --profile preview');
}

main().catch(console.error);
