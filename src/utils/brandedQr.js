import QRCode from 'qrcode'

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('QR artwork unavailable'))
    image.src = src
  })
}

// H correction, four-module quiet zone, and a deliberately small center badge.
export async function brandedQr(url, width = 224) {
  const data = await QRCode.toDataURL(url, {
    width, margin: 4, errorCorrectionLevel: 'H',
    color: { dark: '#111111', light: '#ffffff' },
  })
  const [qr, logo] = await Promise.all([
    loadImage(data), loadImage(`${import.meta.env.BASE_URL}icon-192.png`),
  ])
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = width
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable')
  ctx.drawImage(qr, 0, 0, width, width)
  const badge = Math.round(width * .16), inset = Math.max(2, Math.round(width * .015))
  const start = Math.floor((width - badge) / 2)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(start - inset, start - inset, badge + inset * 2, badge + inset * 2)
  ctx.drawImage(logo, start, start, badge, badge)
  return canvas.toDataURL('image/png')
}
export { loadImage }
