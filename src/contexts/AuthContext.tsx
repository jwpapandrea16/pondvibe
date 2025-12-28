'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '@/types/database'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  canCreateReview: boolean
  login: (token: string, user: User) => void
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Only access localStorage on client side
    if (typeof window === 'undefined') return

    try {
      // Load user and token from localStorage on mount
      const storedToken = localStorage.getItem('auth_token')
      const storedUser = localStorage.getItem('auth_user')

      if (storedToken && storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        setToken(storedToken)
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
        } catch (e) {
          console.error('Failed to parse stored user:', e)
          localStorage.removeItem('auth_user')
          localStorage.removeItem('auth_token')
        }
      } else {
        // Clear invalid data
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_token')
      }
    } catch (e) {
      console.error('Failed to load auth from localStorage:', e)
    }
  }, [])

  const login = (newToken: string, newUser: User) => {
    setToken(newToken)
    setUser(newUser)
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', newToken)
      localStorage.setItem('auth_user', JSON.stringify(newUser))
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(updatedUser))
    }
  }

  const isAuthenticated = !!user && !!token
  const canCreateReview = isAuthenticated && user.has_plague_nft

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        canCreateReview,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
