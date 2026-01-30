import sharp from 'sharp';

import fs from 'fs';
import path from 'path';

async function splitImage(imagePath, outputDir, gridSize, imageName) {
  try {
    // تحميل الصورة
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    
    // حساب حجم كل قطعة
    const tileWidth = Math.floor(metadata.width / gridSize);
    const tileHeight = Math.floor(metadata.height / gridSize);
    
    // إنشاء مجلد الإخراج
    await fs.mkdir(outputDir, { recursive: true });
    
    console.log(`تقسيم ${imageName} إلى ${gridSize}x${gridSize}...`);
    
    let tileNumber = 1;
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const outputPath = path.join(outputDir, `${tileNumber}.jpg`);
        
        // استخراج القطعة
        await image
          .clone()
          .extract({
            left: col * tileWidth,
            top: row * tileHeight,
            width: tileWidth,
            height: tileHeight
          })
          .jpeg({ quality: 90 })
          .toFile(outputPath);
        
        console.log(`  حفظ القطعة ${tileNumber}`);
        tileNumber++;
      }
    }
    
    // إنشاء القطعة الفارغة
    const emptyPath = path.join(outputDir, 'empty.jpg');
    await sharp({
      create: {
        width: tileWidth,
        height: tileHeight,
        channels: 3,
        background: { r: 226, g: 232, b: 240 } // رمادي فاتح
      }
    })
    .jpeg({ quality: 90 })
    .toFile(emptyPath);
    
    console.log(`✓ تم تقسيم ${imageName} إلى ${gridSize * gridSize} قطعة`);
    
  } catch (error) {
    console.error(`خطأ في تقسيم ${imageName}:`, error.message);
  }
}

async function createPreview(imagePath, outputDir, imageName) {
  try {
    const previewPath = path.join(outputDir, 'preview.jpg');
    
    await sharp(imagePath)
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 90 })
      .toFile(previewPath);
    
    console.log(`✓ تم إنشاء معاينة لـ ${imageName}`);
  } catch (error) {
    console.error(`خطأ في إنشاء معاينة ${imageName}:`, error.message);
  }
}

async function prepareAllImages() {
  const images = [
    { name: 'تفاحة', folder: 'apple', sizes: [3, 4] },
    { name: 'أسد', folder: 'lion', sizes: [3] }
  
  ];
  
  console.log('بدء تحضير صور لعبة Puzzle...\n');
  
  for (const image of images) {
    const sourcePath = path.join(__dirname, `../src/assets/games/puzzle/source/${image.folder}.jpg`);
    
    // التحقق من وجود الصورة المصدر
    try {
      await fs.access(sourcePath);
    } catch {
      console.log(`✗ الصورة غير موجودة: ${sourcePath}`);
      continue;
    }
    
    // إنشاء معاينة
    const previewDir = path.join(__dirname, `../src/assets/games/puzzle/${image.folder}`);
    await createPreview(sourcePath, previewDir, image.name);
    
    // تقسيم لكل حجم
    for (const size of image.sizes) {
      const outputDir = path.join(__dirname, `../src/assets/games/puzzle/${image.folder}/${size}x${size}`);
      await splitImage(sourcePath, outputDir, size, image.name);
    }
    
    console.log('');
  }
  
  console.log('✓ تم تحضير جميع الصور بنجاح!');
}

// تشغيل السكريبت
prepareAllImages().catch(console.error);