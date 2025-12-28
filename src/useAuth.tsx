import { useContext } from 'react'
import { AuthContext } from './AuthContext'
import type { IAuthContext } from './types'

export function useAuth(): IAuthContext {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return ctx
}
