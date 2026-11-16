import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
const source = new URL('./portraits-master.png', import.meta.url)
const out = new URL('../public/portraits/', import.meta.url)
await mkdir(out, { recursive: true })
const { width, height } = await sharp(source.pathname).metadata()
// Row-major order in the animation-style atlas. Keep every breed distinct.
const portraits = [
 ['INTJ', 'Russian Blue'], ['INTP', 'Exotic Shorthair'],
 ['ENTJ', 'Maine Coon'], ['ENTP', 'Sphynx'],
 ['INFJ', 'Ragdoll'], ['INFP', 'Persian'],
 ['ENFJ', 'Selkirk Rex'], ['ENFP', 'Abyssinian'],
 ['ISTJ', 'American Shorthair'], ['ISFJ', 'Scottish Fold'],
 ['ESTJ', 'American Curl'], ['ESFJ', 'Japanese Bobtail'],
 ['ISTP', 'Siamese'], ['ISFP', 'Turkish Van'],
 ['ESTP', 'Oriental Shorthair'], ['ESFP', 'Bengal'],
]
if (portraits.length !== 16 || new Set(portraits.map(([, breed]) => breed)).size !== 16) {
 throw new Error('The portrait atlas must contain sixteen distinct breeds')
}
const types = portraits.map(([type]) => type)
for (const [i, type] of types.entries()) {
 const x = i % 4, y = Math.floor(i / 4)
 const left = Math.round(x * width / 4), top = Math.round(y * height / 4)
 await sharp(source.pathname).extract({ left, top, width: Math.round((x+1)*width/4)-left, height: Math.round((y+1)*height/4)-top }).resize(320,320).extend({ top: 20, bottom: 20, left: 20, right: 20, background: '#10141e' }).webp({ quality: 88 }).toFile(new URL(`${type}.webp`, out).pathname)
}
