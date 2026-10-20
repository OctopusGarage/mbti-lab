// Keep previews and local development from changing the public sharing target.
export const APP_URL = 'https://octopusgarage.github.io/mbti-lab'

export function typeShareUrl(type, base = APP_URL) {
  if (typeof type !== 'string' || !/^[EI][NS][FT][JP]$/i.test(type)) {
    throw new Error('Invalid personality type')
  }
  const url = new URL(base)
  url.pathname = url.pathname.replace(/\/?$/, '/')
  url.search = ''
  url.hash = `/types?type=${type.toUpperCase()}`
  return url.href
}
