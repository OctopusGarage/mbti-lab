import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const svg = readFileSync(resolve(__dirname, 'icon.svg'))
const out = resolve(__dirname, '../public')

const sizes = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png',         size: 192 },
  { name: 'icon-512.png',         size: 512 },
  { name: 'favicon-32.png',       size: 32  },
]

for (const { name, size } of sizes) {
  await sharp(svg).resize(size, size).png().toFile(`${out}/${name}`)
  console.log(`✓ ${name}`)
}
