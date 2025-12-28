import type { IAuthStorageType } from '../types'

export const keepToStorage = (type: IAuthStorageType, key: string, value: string) => {
  if (type === 'local') localStorage.setItem(key, value)
  else if (type === 'session') sessionStorage.setItem(key, value)
}

export const removeFromStorage = (type: IAuthStorageType, key: string) => {
  if (type === 'local') localStorage.removeItem(key)
  else if (type === 'session') sessionStorage.removeItem(key)
}

export const getFromStorage = (type: IAuthStorageType, key: string) => {
  if (type === 'local') return localStorage.getItem(key) ?? ''
  else if (type === 'session') return sessionStorage.getItem(key) ?? ''

  return ''
}
