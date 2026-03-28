const STORAGE_KEY = 'mbti_lab_result'

export function useHistory() {
  function saveResult(result) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...result,
      completedAt: Date.now(),
    }))
  }

  function loadResult() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  function clearResult() {
    localStorage.removeItem(STORAGE_KEY)
  }

  return { saveResult, loadResult, clearResult }
}
