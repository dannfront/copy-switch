const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const toIco = require('to-ico')

const source = path.join(__dirname, '..', 'build', 'icon.png')
const buildDest = path.join(__dirname, '..', 'build', 'icon.ico')
const resourcesDest = path.join(__dirname, '..', 'resources', 'icon.ico')

const sizes = [16, 32, 48, 64, 128, 256]

async function convert() {
  try {
    const buffers = await Promise.all(
      sizes.map(async (size) => {
        const buf = await sharp(source)
          .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer()
        return buf
      })
    )

    const icoBuffer = await toIco(buffers)

    fs.writeFileSync(buildDest, icoBuffer)
    console.log(`Created: ${buildDest} (${sizes.join(', ')}px)`)

    fs.writeFileSync(resourcesDest, icoBuffer)
    console.log(`Created: ${resourcesDest} (${sizes.join(', ')}px)`)
  } catch (err) {
    console.error('Error converting icon:', err.message)
    process.exit(1)
  }
}

convert()
