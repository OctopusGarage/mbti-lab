export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === '/mbti-lab' || url.pathname === '/mbti-lab/') {
      return env.ASSETS.fetch(new Request(new URL('/', url.origin), request))
    }

    if (url.pathname.startsWith('/mbti-lab/')) {
      const stripped = url.pathname.slice('/mbti-lab'.length)
      const rewritten = new URL(stripped + url.search, url.origin)
      return env.ASSETS.fetch(new Request(rewritten, request))
    }

    return env.ASSETS.fetch(request)
  }
}
