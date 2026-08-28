import sharp from 'sharp';
for (const size of [192, 512])
  await sharp('public/icon.svg')
    .resize(size, size)
    .png()
    .toFile(`public/icon-${size}.png`);
for (const name of ['umbrella', 'earbuds', 'id-card', 'calculator'])
  await sharp(`assets/source/${name}.png`)
    .resize({ width: 1000, withoutEnlargement: true })
    .webp({ quality: 83 })
    .toFile(`public/images/${name}.webp`);
await sharp('assets/source/og.png')
  .resize(1200, 630, { fit: 'cover' })
  .png()
  .toFile('public/og.png');
