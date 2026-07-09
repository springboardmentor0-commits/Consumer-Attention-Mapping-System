"use client"

import React from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { email, role, logout } = useAuth()

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Premium Header */}
      <header className="border-b bg-card text-card-foreground shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">
              CAMS Dashboard
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {email && (
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{email}</p>
                <p className="text-xs text-muted-foreground capitalize">{role}</p>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={logout}>
              Log out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {children}
      </main>
    </div>
  )
}
