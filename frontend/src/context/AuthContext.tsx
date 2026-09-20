import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { me } from '@/api/auth'
import type { User } from '@/types/common'

interface AuthContextValue {
  /** 当前登录用户；null 表示未登录 */
  user: User | null
  /** 应用启动时正在恢复登录态（拉取 /auth/me） */
  loading: boolean
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // 启动时恢复登录态（interfaces.md §1.4）；未登录时由请求层兜底跳登录页
  useEffect(() => {
    me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  return <AuthContext.Provider value={{ user, loading, setUser }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 内使用')
  return ctx
}
