import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const inputDir = './src/assets/images-original';
const outputDir = './src/assets/images';

await fs.mkdir(outputDir, { recursive: true });
const files = await fs.readdir(inputDir);

for (const file of files) {
  if (file.match(/\.(png|jpg|jpeg|webp)$/i)) {
    const filename = path.parse(file).name;

    await sharp(`${inputDir}/${file}`)
      .resize(128, 72, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(`${outputDir}/${filename}.webp`);

    console.log(`Optimized: ${filename}.webp`);
  }
}
