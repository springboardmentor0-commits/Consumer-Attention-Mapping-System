"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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

const ROLES = [
  "Retail Analyst",
  "Store Manager",
  "Marketing Manager",
  "Admin",
] as const

type Role = (typeof ROLES)[number]

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [roleName, setRoleName] = useState<Role>("Retail Analyst")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    setLoading(true)
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001"

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role_name: roleName }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || "Registration failed.")
      }

      setSuccess(true)
      setTimeout(() => router.push("/login"), 2000)
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex-1 flex items-center justify-center p-4 bg-[#F8FAFC] dark:bg-slate-950">
      <Card className="w-full max-w-md bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/60 dark:shadow-slate-950/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden">
        <CardHeader className="space-y-1.5 text-center pt-8 pb-6 px-8">
          <CardTitle className="text-2xl font-bold font-serif text-slate-900 dark:text-slate-100">
            Create Account
          </CardTitle>
          <CardDescription className="text-sm text-slate-500 dark:text-slate-400 font-sans">
            Register to access the Consumer Attention Mapping System
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 px-8 pb-6 font-sans">
            {success && (
              <div className="p-3 text-sm rounded-xl bg-green-500/10 text-green-600 border border-green-500/20 font-medium">
                Registration successful! Redirecting to login...
              </div>
            )}
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
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 font-sans transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-xl"
                required
                disabled={success}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Role
              </Label>
              <select
                id="role"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value as Role)}
                disabled={success}
                className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-1 text-sm shadow-sm transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 text-slate-900 dark:text-slate-100 font-sans"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r} className="bg-background text-foreground">
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 font-sans transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-xl"
                required
                disabled={success}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-10 border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 font-sans transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 rounded-xl"
                required
                disabled={success}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 px-8 pb-8 pt-2">
            <Button
              className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition-all duration-150 ease-in-out cursor-pointer"
              type="submit"
              disabled={loading || success}
            >
              {loading ? "Creating account..." : "Register"}
            </Button>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center font-sans">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold hover:underline transition-colors"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

