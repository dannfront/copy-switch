const fs = require('fs')
const path = require('path')
const { default: pngToIco } = require('png-to-ico')

const source = path.join(__dirname, '..', 'build', 'icon.png')
const buildDest = path.join(__dirname, '..', 'build', 'icon.ico')
const resourcesDest = path.join(__dirname, '..', 'resources', 'icon.ico')

async function convert() {
  try {
    const buf = await pngToIco(source)
    fs.writeFileSync(buildDest, buf)
    console.log(`Created: ${buildDest}`)

    fs.writeFileSync(resourcesDest, buf)
    console.log(`Created: ${resourcesDest}`)
  } catch (err) {
    console.error('Error converting icon:', err.message)
    process.exit(1)
  }
}

convert()
