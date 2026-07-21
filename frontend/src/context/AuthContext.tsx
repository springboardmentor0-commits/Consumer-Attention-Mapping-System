"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  token: string | null
  email: string | null
  role: string | null
  login: (token: string, email: string, role: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  const login = (newToken: string, newEmail: string, newRole: string) => {
    setToken(newToken)
    setEmail(newEmail)
    setRole(newRole)
    router.push("/stores")
  }

  const logout = () => {
    setToken(null)
    setEmail(null)
    setRole(null)
    router.push("/login")
  }

  // Basic route protection check
  useEffect(() => {
    const publicRoutes = ["/login", "/register"]
    const isPublicRoute = publicRoutes.includes(pathname)
    if (!token && !isPublicRoute) {
      router.push("/login")
    }
  }, [token, pathname, router])

  return (
    <AuthContext.Provider
      value={{
        token,
        email,
        role,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
