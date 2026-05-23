const fs = require('fs')
const path = require('path')

const repoRoot = path.resolve(__dirname, '..')
const frontendRoot = path.join(repoRoot, 'frontend')
const SVG_SOURCE = path.join(frontendRoot, 'public', 'icon-master.svg')
const OG_SOURCE = path.join(frontendRoot, 'public', 'og-image.svg')
const OUT_DIR = path.join(frontendRoot, 'public')

const sharp = require(require.resolve('sharp', { paths: [frontendRoot] }))

const ICONS = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
]

async function generateIcons() {
  const svgBuf = fs.readFileSync(SVG_SOURCE)
  fs.mkdirSync(OUT_DIR, { recursive: true })

  for (const { name, size } of ICONS) {
    const outPath = path.join(OUT_DIR, name)
    await sharp(svgBuf)
      .resize(size, size)
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(outPath)
    console.log(`✓ ${size}x${size} -> frontend/public/${name}`)
  }

  await sharp(OG_SOURCE)
    .resize(1200, 630)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, 'og-image.png'))
  console.log('✓ 1200x630 -> frontend/public/og-image.png')

  try {
    const pngToIcoModule = require(require.resolve('png-to-ico', { paths: [frontendRoot] }))
    const pngToIco = pngToIcoModule.default ?? pngToIcoModule
    const ico = await pngToIco([
      path.join(OUT_DIR, 'favicon-16x16.png'),
      path.join(OUT_DIR, 'favicon-32x32.png'),
      path.join(OUT_DIR, 'favicon-48x48.png'),
    ])
    fs.writeFileSync(path.join(OUT_DIR, 'favicon.ico'), ico)
    console.log('✓ favicon.ico (16 + 32 + 48)')
  } catch (error) {
    console.warn('⚠ png-to-ico non installe - favicon.ico non genere')
    console.warn('  Installer avec: npm install sharp png-to-ico --save-dev')
    if (error && error.message) {
      console.warn(`  ${error.message}`)
    }
  }

  console.log('\n✅ Toutes les icones generees dans frontend/public/')
}

generateIcons().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
