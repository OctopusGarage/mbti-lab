import { brandedQr, loadImage } from './brandedQr.js'

// Render locally: no external QR service sees the shared address.
export async function renderAppCard({ url, label }) {
  await document.fonts?.ready
  const canvas = document.createElement('canvas')
  canvas.width = 720
  canvas.height = 920
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable')
  ctx.fillStyle = '#f5f5f7'
  ctx.fillRect(0, 0, 720, 920)
  ctx.textAlign = 'center'
  ctx.fillStyle = '#29265b'
  ctx.font = '600 52px system-ui, sans-serif'
  ctx.fillText('MBTI Lab', 360, 110)
  const qr = await loadImage(await brandedQr(url, 500))
  ctx.drawImage(qr, 110, 200, 500, 500)
  ctx.font = '500 28px system-ui, sans-serif'
  ctx.fillText(label, 360, 760, 640)
  return canvas.toDataURL('image/png')
}
