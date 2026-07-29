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
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("cams_token")
      const storedEmail = localStorage.getItem("cams_email")
      const storedRole = localStorage.getItem("cams_role")

      if (storedToken) {
        setToken(storedToken)
        setEmail(storedEmail)
        setRole(storedRole)
      }
    } catch (e) {
      console.error("Failed to restore auth session:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  const login = (newToken: string, newEmail: string, newRole: string) => {
    setToken(newToken)
    setEmail(newEmail)
    setRole(newRole)
    try {
      localStorage.setItem("cams_token", newToken)
      localStorage.setItem("cams_email", newEmail)
      localStorage.setItem("cams_role", newRole)
    } catch (e) {
      console.error("Failed to save auth session:", e)
    }
    router.push("/stores")
  }

  const logout = () => {
    setToken(null)
    setEmail(null)
    setRole(null)
    try {
      localStorage.removeItem("cams_token")
      localStorage.removeItem("cams_email")
      localStorage.removeItem("cams_role")
    } catch (e) {
      console.error("Failed to clear auth session:", e)
    }
    router.push("/login")
  }

  // Basic route protection check
  useEffect(() => {
    if (loading) return
    const publicRoutes = ["/login", "/register"]
    const isPublicRoute = publicRoutes.includes(pathname)
    if (!token && !isPublicRoute) {
      router.push("/login")
    }
  }, [token, loading, pathname, router])


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
