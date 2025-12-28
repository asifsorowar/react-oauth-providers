export const toURL = (input: string): URL => {
  // If input is absolute, URL works directly
  try {
    return new URL(input)
  } catch {
    // If input is relative, use window.location.origin as base
    return new URL(input, window.location.origin)
  }
}

export const makeKey = (key: string, prefix?: string) => {
  return prefix ? `${prefix}_${key}` : key
}
