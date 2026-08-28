import sharp from 'sharp';
import { copyFile, mkdir } from 'node:fs/promises';

await mkdir('public/brand', { recursive: true });
// Optimize the supplied artwork without redrawing or changing its proportions.
await sharp('assets/source/loufind-logo.png')
  .resize({ width: 1000, withoutEnlargement: true })
  .webp({ quality: 95 })
  .toFile('public/brand/loufind-logo.webp');
for (const size of [64, 180, 192, 512])
  await sharp('assets/source/loufind-logo.png')
    .resize(size, size, { fit: 'contain', background: '#ffffff' })
    .flatten({ background: '#ffffff' })
    .png()
    .toFile(`public/loufind-icon-${size}.png`);
// Keep the old image URLs useful for previously installed shortcuts.
for (const size of [192, 512])
  await copyFile(`public/loufind-icon-${size}.png`, `public/icon-${size}.png`);
for (const name of ['umbrella', 'earbuds', 'id-card', 'calculator'])
  await sharp(`assets/source/${name}.png`)
    .resize({ width: 1000, withoutEnlargement: true })
    .webp({ quality: 83 })
    .toFile(`public/images/${name}.webp`);
await sharp('assets/source/og.png')
  .resize(1200, 630, { fit: 'cover' })
  .png()
  .toFile('public/og.png');
