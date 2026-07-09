"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { DashboardLayout } from "@/components/DashboardLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ShelfItem {
  id: string
  shelf_name: string
  zone_coordinates: number[][]
  created_at: string
}

interface ZoneItem {
  id: string
  zone_name: string
  coordinates: number[][]
  zone_type: string
  created_at: string
}

export default function StoreDetailPage() {
  const { token, role } = useAuth()
  const { id: storeId } = useParams()
  const router = useRouter()

  const [shelves, setShelves] = useState<ShelfItem[]>([])
  const [zones, setZones] = useState<ZoneItem[]>([])
  const [storeName, setStoreName] = useState("Store Layout")
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Shelf Form State
  const [shelfName, setShelfName] = useState("")
  const [shelfCoordsRaw, setShelfCoordsRaw] = useState("[[0,0], [10,10]]")
  const [shelfError, setShelfError] = useState<string | null>(null)
  const [shelfLoading, setShelfLoading] = useState(false)

  // Zone Form State
  const [zoneName, setZoneName] = useState("")
  const [zoneCoordsRaw, setZoneCoordsRaw] = useState("[[0,0], [10,10]]")
  const [zoneType, setZoneType] = useState("checkout")
  const [zoneError, setZoneError] = useState<string | null>(null)
  const [zoneLoading, setZoneLoading] = useState(false)

  const isWriter = role === "Store Manager" || role === "Admin"

  const fetchData = async () => {
    if (!token || !storeId) return
    setLoading(true)
    setError(null)

    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001"

    try {
      // 1. Fetch store info
      const storeResponse = await fetch(`${apiBaseUrl}/api/stores/${storeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (storeResponse.status === 404) {
        throw new Error("Store layout not found.")
      }
      if (!storeResponse.ok) {
        throw new Error("Failed to fetch store details.")
      }
      const storeData = await storeResponse.json()
      setStoreName(storeData.name)

      // 2. Fetch shelves
      const shelvesResponse = await fetch(`${apiBaseUrl}/api/stores/${storeId}/shelves`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (shelvesResponse.ok) {
        const shelvesData = await shelvesResponse.json()
        setShelves(shelvesData)
      }

      // 3. Fetch zones
      const zonesResponse = await fetch(`${apiBaseUrl}/api/stores/${storeId}/zones`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (zonesResponse.ok) {
        const zonesData = await zonesResponse.json()
        setZones(zonesData)
      }

    } catch (err: any) {
      setError(err.message || "Failed to load store layout details.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [token, storeId])

  const handleAddShelf = async (e: React.FormEvent) => {
    e.preventDefault()
    setShelfError(null)
    setShelfLoading(true)

    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001"

    try {
      let parsedCoords: number[][]
      try {
        parsedCoords = JSON.parse(shelfCoordsRaw)
        if (!Array.isArray(parsedCoords) || !parsedCoords.every(p => Array.isArray(p) && p.length === 2)) {
          throw new Error()
        }
      } catch {
        throw new Error("Invalid coordinate syntax. Must be like: [[x1,y1], [x2,y2]]")
      }

      const response = await fetch(`${apiBaseUrl}/api/stores/${storeId}/shelves`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shelf_name: shelfName,
          zone_coordinates: parsedCoords,
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || "Failed to add shelf.")
      }

      setShelfName("")
      fetchData()
    } catch (err: any) {
      setShelfError(err.message || "Error adding shelf.")
    } finally {
      setShelfLoading(false)
    }
  }

  const handleAddZone = async (e: React.FormEvent) => {
    e.preventDefault()
    setZoneError(null)
    setZoneLoading(true)

    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001"

    try {
      let parsedCoords: number[][]
      try {
        parsedCoords = JSON.parse(zoneCoordsRaw)
        if (!Array.isArray(parsedCoords) || !parsedCoords.every(p => Array.isArray(p) && p.length === 2)) {
          throw new Error()
        }
      } catch {
        throw new Error("Invalid coordinate syntax. Must be like: [[x1,y1], [x2,y2]]")
      }

      const response = await fetch(`${apiBaseUrl}/api/stores/${storeId}/zones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          zone_name: zoneName,
          coordinates: parsedCoords,
          zone_type: zoneType,
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || "Failed to add zone.")
      }

      setZoneName("")
      fetchData()
    } catch (err: any) {
      setZoneError(err.message || "Error adding zone.")
    } finally {
      setZoneLoading(false)
    }
  }

  const handleDeleteShelf = async (shelfId: string) => {
    if (!confirm("Are you sure you want to delete this shelf?")) return
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001"
    try {
      const response = await fetch(`${apiBaseUrl}/api/shelves/${shelfId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Delete failed.")
      fetchData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleDeleteZone = async (zoneId: string) => {
    if (!confirm("Are you sure you want to delete this zone?")) return
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001"
    try {
      const response = await fetch(`${apiBaseUrl}/api/zones/${zoneId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Delete failed.")
      fetchData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push("/stores")}>
            ← Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{storeName}</h1>
            <p className="text-muted-foreground">Manage shelves and shopper attention zones.</p>
          </div>
        </div>

        {error ? (
          <div className="p-4 text-sm rounded bg-destructive/10 text-destructive border border-destructive/20 font-medium">
            {error}
          </div>
        ) : loading ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Loading layout details...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* SHELVES MANAGEMENT */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Shelves</CardTitle>
                  <CardDescription>Physical store shelving units mapping</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isWriter && (
                    <form onSubmit={handleAddShelf} className="p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-900 space-y-4">
                      <h4 className="font-semibold text-sm">Add Shelf</h4>
                      {shelfError && <div className="text-xs text-destructive">{shelfError}</div>}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor="shelfName">Shelf Name</Label>
                          <Input
                            id="shelfName"
                            placeholder="e.g. Shelf A"
                            value={shelfName}
                            onChange={(e) => setShelfName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="shelfCoords">Coordinates (JSON)</Label>
                          <Input
                            id="shelfCoords"
                            value={shelfCoordsRaw}
                            onChange={(e) => setShelfCoordsRaw(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" size="sm" className="w-full" disabled={shelfLoading}>
                        {shelfLoading ? "Adding..." : "Add Shelf"}
                      </Button>
                    </form>
                  )}

                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Coordinates</TableHead>
                          {isWriter && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {shelves.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground h-20">
                              No shelves added yet.
                            </TableCell>
                          </TableRow>
                        ) : (
                          shelves.map((shelf) => (
                            <TableRow key={shelf.id}>
                              <TableCell className="font-medium">{shelf.shelf_name}</TableCell>
                              <TableCell className="font-mono text-xs">
                                {JSON.stringify(shelf.zone_coordinates)}
                              </TableCell>
                              {isWriter && (
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDeleteShelf(shelf.id)}
                                  >
                                    Delete
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ZONES MANAGEMENT */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Zones</CardTitle>
                  <CardDescription>Attention tracking zones within the layout</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isWriter && (
                    <form onSubmit={handleAddZone} className="p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-900 space-y-4">
                      <h4 className="font-semibold text-sm">Add Zone</h4>
                      {zoneError && <div className="text-xs text-destructive">{zoneError}</div>}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor="zoneName">Zone Name</Label>
                          <Input
                            id="zoneName"
                            placeholder="e.g. Snack Section"
                            value={zoneName}
                            onChange={(e) => setZoneName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="zoneType">Zone Type</Label>
                          <select
                            id="zoneType"
                            value={zoneType}
                            onChange={(e) => setZoneType(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1"
                          >
                            <option value="checkout" className="bg-background">Checkout</option>
                            <option value="aisle" className="bg-background">Aisle</option>
                            <option value="display" className="bg-background">Promo Display</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="zoneCoords">Coordinates (JSON)</Label>
                        <Input
                          id="zoneCoords"
                          value={zoneCoordsRaw}
                          onChange={(e) => setZoneCoordsRaw(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" size="sm" className="w-full" disabled={zoneLoading}>
                        {zoneLoading ? "Adding..." : "Add Zone"}
                      </Button>
                    </form>
                  )}

                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Coordinates</TableHead>
                          {isWriter && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {zones.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground h-20">
                              No zones added yet.
                            </TableCell>
                          </TableRow>
                        ) : (
                          zones.map((zone) => (
                            <TableRow key={zone.id}>
                              <TableCell className="font-medium">{zone.zone_name}</TableCell>
                              <TableCell className="capitalize text-xs font-semibold">
                                {zone.zone_type}
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {JSON.stringify(zone.coordinates)}
                              </TableCell>
                              {isWriter && (
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDeleteZone(zone.id)}
                                  >
                                    Delete
                                  </Button>
                                </TableCell>
                              )}
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
