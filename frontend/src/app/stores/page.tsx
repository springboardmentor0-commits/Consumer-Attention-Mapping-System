"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useRouter } from "next/navigation"

interface StoreItem {
  id: string
  name: string
  location: string
  created_at: string
}

export default function StoresPage() {
  const { token, role } = useAuth()
  const router = useRouter()
  const [stores, setStores] = useState<StoreItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Dialog form state
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [createError, setCreateError] = useState<string | null>(null)
  const [createLoading, setCreateLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const isWriter = role === "Store Manager" || role === "Admin"

  const fetchStores = async () => {
    if (!token) return
    setLoading(true)
    setError(null)

    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001"

    try {
      const response = await fetch(`${apiBaseUrl}/api/stores`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch stores.")
      }

      const data = await response.json()
      setStores(data)
    } catch (err: any) {
      setError(err.message || "Could not fetch stores.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStores()
  }, [token])

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError(null)
    setCreateLoading(true)

    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001"

    try {
      const response = await fetch(`${apiBaseUrl}/api/stores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, location, zones: [] }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || "Failed to create store.")
      }

      setName("")
      setLocation("")
      setDialogOpen(false)
      fetchStores()
    } catch (err: any) {
      setCreateError(err.message || "Failed to create store.")
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Stores</h1>
            <p className="text-muted-foreground">
              Manage retail store layouts and sensor assignments.
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button disabled={!isWriter} />}>
              Create Store
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleCreateStore}>
                <DialogHeader>
                  <DialogTitle>Create Store</DialogTitle>
                  <DialogDescription>
                    Add a new retail store to layout mapping.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {createError && (
                    <div className="p-3 text-sm rounded bg-destructive/10 text-destructive border border-destructive/20 font-medium">
                      {createError}
                    </div>
                  )}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g. Austin Flagship"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">
                      Location
                    </Label>
                    <Input
                      id="location"
                      placeholder="e.g. Austin, TX"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="col-span-3"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createLoading}>
                    {createLoading ? "Creating..." : "Save Store"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {!isWriter && (
          <div className="p-3 text-sm rounded bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20 font-medium">
            ℹ️ You have read-only access. Store creation and management is locked.
          </div>
        )}

        {loading ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Loading stores...
          </div>
        ) : error ? (
          <div className="p-4 text-sm rounded bg-destructive/10 text-destructive border border-destructive/20 font-medium">
            {error}
          </div>
        ) : stores.length === 0 ? (
          <div className="border border-dashed rounded-lg h-64 flex flex-col items-center justify-center text-center p-6">
            <h3 className="font-semibold text-lg">No stores found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by creating your first store layout.
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell className="font-medium">
                      <Link href={`/stores/${store.id}`} className="hover:underline text-indigo-600 dark:text-indigo-400 font-semibold">
                        {store.name}
                      </Link>
                    </TableCell>
                    <TableCell>{store.location}</TableCell>
                    <TableCell>
                      {new Date(store.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link href={`/stores/${store.id}`}>
                        <Button variant="outline" size="sm">
                          Manage Layout
                        </Button>
                      </Link>
                      <Link href={`/stores/${store.id}/cameras`}>
                        <Button variant="outline" size="sm">
                          Cameras
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
