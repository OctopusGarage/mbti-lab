import QRCode from 'qrcode'

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
  const qr = QRCode.create(url, { errorCorrectionLevel: 'M' }).modules
  const unit = Math.floor(500 / (qr.size + 8))
  const size = (qr.size + 8) * unit
  const left = (720 - size) / 2
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(left, 200, size, size)
  ctx.fillStyle = '#17191f'
  for (let y = 0; y < qr.size; y++) for (let x = 0; x < qr.size; x++) {
    if (qr.get(y, x)) ctx.fillRect(left + (x + 4) * unit, 200 + (y + 4) * unit, unit, unit)
  }
  ctx.font = '500 28px system-ui, sans-serif'
  ctx.fillText(label, 360, 760, 640)
  ctx.font = '22px system-ui, sans-serif'
  ctx.fillStyle = '#62626a'
  ctx.fillText(url, 360, 830, 640)
  return canvas.toDataURL('image/png')
}
