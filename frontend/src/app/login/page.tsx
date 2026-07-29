"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001"

    try {
      const formData = new URLSearchParams()
      formData.append("username", email)
      formData.append("password", password)

      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || "Authentication failed.")
      }

      const data = await response.json()
      
      // Decode JWT to extract role and email details
      const payloadBase64 = data.access_token.split(".")[1]
      const payloadDecoded = JSON.parse(atob(payloadBase64))
      const userRole = payloadDecoded.role || "User"
      const userEmail = payloadDecoded.sub || email

      login(data.access_token, userEmail, userRole)
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex-1 flex items-center justify-center p-4 bg-[#F8FAFC] dark:bg-slate-950">
      <Card className="w-full max-w-md bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/60 dark:shadow-slate-950/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden">
        <CardHeader className="space-y-1.5 text-center pt-8 pb-6 px-8">
          <CardTitle className="text-2xl font-bold font-serif text-slate-900 dark:text-slate-100">
            Sign In
          </CardTitle>
          <CardDescription className="text-sm text-slate-500 dark:text-slate-400 font-sans">
            Enter your credentials to access your dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 px-8 pb-6 font-sans">
            {error && (
              <div className="p-3 text-sm rounded-xl bg-destructive/10 text-destructive border border-destructive/20 font-medium">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 font-sans transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 font-sans transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-xl"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 px-8 pb-8 pt-2">
            <Button
              className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition-all duration-150 ease-in-out cursor-pointer"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center font-sans">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold hover:underline transition-colors"
              >
                Create one
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

