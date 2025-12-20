const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE_IMAGE = path.join(__dirname, '..', 'image.png');
const PROJECT_ROOT = path.join(__dirname, '..');

// iOS 图标尺寸配置
const iosIcons = [
  { size: 20, scales: [1, 2, 3] },
  { size: 29, scales: [1, 2, 3] },
  { size: 40, scales: [1, 2, 3] },
  { size: 60, scales: [2, 3] },
  { size: 76, scales: [1, 2] },
  { size: 83.5, scales: [2] },
  { size: 1024, scales: [1] },
];

// Android 图标尺寸配置
const androidIcons = [
  { dir: 'mipmap-mdpi', size: 48 },
  { dir: 'mipmap-hdpi', size: 72 },
  { dir: 'mipmap-xhdpi', size: 96 },
  { dir: 'mipmap-xxhdpi', size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
];

// Web 图标尺寸配置
const webIcons = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
];

async function generateIosIcons() {
  const outputDir = path.join(PROJECT_ROOT, 'ios/App/App/Assets.xcassets/AppIcon.appiconset');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const contents = { images: [], info: { author: 'xcode', version: 1 } };

  for (const icon of iosIcons) {
    for (const scale of icon.scales) {
      const actualSize = Math.round(icon.size * scale);
      const filename = `AppIcon-${icon.size}x${icon.size}@${scale}x.png`;
      
      await sharp(SOURCE_IMAGE)
        .resize(actualSize, actualSize)
        .png()
        .toFile(path.join(outputDir, filename));
      
      contents.images.push({
        filename,
        idiom: icon.size === 76 || icon.size === 83.5 ? 'ipad' : 
               icon.size === 1024 ? 'ios-marketing' : 'iphone',
        scale: `${scale}x`,
        size: `${icon.size}x${icon.size}`,
      });
      
      console.log(`✓ iOS: ${filename} (${actualSize}x${actualSize})`);
    }
  }

  // 添加 iPad 图标
  const ipadExtras = [
    { size: 20, scales: [1, 2] },
    { size: 29, scales: [1, 2] },
    { size: 40, scales: [1, 2] },
  ];
  
  for (const icon of ipadExtras) {
    for (const scale of icon.scales) {
      const actualSize = Math.round(icon.size * scale);
      const filename = `AppIcon-iPad-${icon.size}x${icon.size}@${scale}x.png`;
      
      await sharp(SOURCE_IMAGE)
        .resize(actualSize, actualSize)
        .png()
        .toFile(path.join(outputDir, filename));
      
      contents.images.push({
        filename,
        idiom: 'ipad',
        scale: `${scale}x`,
        size: `${icon.size}x${icon.size}`,
      });
      
      console.log(`✓ iOS iPad: ${filename} (${actualSize}x${actualSize})`);
    }
  }

  fs.writeFileSync(
    path.join(outputDir, 'Contents.json'),
    JSON.stringify(contents, null, 2)
  );
  console.log('✓ iOS Contents.json generated');
}

async function generateAndroidIcons() {
  const resDir = path.join(PROJECT_ROOT, 'android/app/src/main/res');

  for (const icon of androidIcons) {
    const outputDir = path.join(resDir, icon.dir);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // ic_launcher.png
    await sharp(SOURCE_IMAGE)
      .resize(icon.size, icon.size)
      .png()
      .toFile(path.join(outputDir, 'ic_launcher.png'));

    // ic_launcher_round.png (圆形)
    const roundBuffer = await sharp(SOURCE_IMAGE)
      .resize(icon.size, icon.size)
      .png()
      .toBuffer();

    const circleSvg = `<svg><circle cx="${icon.size/2}" cy="${icon.size/2}" r="${icon.size/2}" fill="white"/></svg>`;
    
    await sharp(roundBuffer)
      .composite([{
        input: Buffer.from(circleSvg),
        blend: 'dest-in'
      }])
      .png()
      .toFile(path.join(outputDir, 'ic_launcher_round.png'));

    // ic_launcher_foreground.png
    await sharp(SOURCE_IMAGE)
      .resize(icon.size, icon.size)
      .png()
      .toFile(path.join(outputDir, 'ic_launcher_foreground.png'));

    console.log(`✓ Android: ${icon.dir} (${icon.size}x${icon.size})`);
  }
}

async function generateWebIcons() {
  const publicDir = path.join(PROJECT_ROOT, 'public');
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  for (const icon of webIcons) {
    await sharp(SOURCE_IMAGE)
      .resize(icon.size, icon.size)
      .png()
      .toFile(path.join(publicDir, icon.name));
    
    console.log(`✓ Web: ${icon.name} (${icon.size}x${icon.size})`);
  }

  // 生成 favicon.ico (使用 32x32 PNG 作为替代)
  await sharp(SOURCE_IMAGE)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  
  // 复制到根目录作为 favicon
  fs.copyFileSync(
    path.join(publicDir, 'favicon.png'),
    path.join(PROJECT_ROOT, 'favicon.png')
  );
  
  console.log('✓ Web: favicon.png');
}

async function main() {
  console.log('🎨 Generating app icons from image.png...\n');
  
  try {
    console.log('--- iOS Icons ---');
    await generateIosIcons();
    
    console.log('\n--- Android Icons ---');
    await generateAndroidIcons();
    
    console.log('\n--- Web Icons ---');
    await generateWebIcons();
    
    console.log('\n✅ All icons generated successfully!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
