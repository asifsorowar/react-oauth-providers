export function setSessionItem(key: string, value: string, ttlMs: number) {
  const data = {
    value,
    expires: Date.now() + ttlMs,
  }

  sessionStorage.setItem(key, JSON.stringify(data))
}

export function getSessionItem(key: string): string | null {
  const dataStr = sessionStorage.getItem(key)
  if (!dataStr) return null

  try {
    const data = JSON.parse(dataStr)
    if (Date.now() > data.expires) {
      sessionStorage.removeItem(key)
      return null
    }

    return data.value
  } catch {
    return null
  }
}

export function removeSessionItem(key: string) {
  try {
    sessionStorage.removeItem(key)
  } catch (error) {
    return null
  }
}
