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

interface CameraItem {
  id: string
  camera_name: string
  stream_url: string
  status: string
  zone_id: string | null
  created_at: string
}

interface ZoneItem {
  id: string
  zone_name: string
}

export default function CamerasPage() {
  const { token, role } = useAuth()
  const { id: storeId } = useParams()
  const router = useRouter()

  const [cameras, setCameras] = useState<CameraItem[]>([])
  const [zones, setZones] = useState<ZoneItem[]>([])
  const [storeName, setStoreName] = useState("Store Layout")
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Camera Form State
  const [cameraName, setCameraName] = useState("")
  const [streamUrl, setStreamUrl] = useState("")
  const [statusVal, setStatusVal] = useState("active")
  const [selectedZoneId, setSelectedZoneId] = useState("")
  
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraLoading, setCameraLoading] = useState(false)

  // Ingestion tracking state
  const [ingestionStatus, setIngestionStatus] = useState<Dict<string, string>>({})

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
      if (!storeResponse.ok) throw new Error("Store not found.")
      const storeData = await storeResponse.json()
      setStoreName(storeData.name)

      // 2. Fetch cameras
      const camerasResponse = await fetch(`${apiBaseUrl}/api/stores/${storeId}/cameras`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (camerasResponse.ok) {
        const camerasData = await camerasResponse.json()
        setCameras(camerasData)
      }

      // 3. Fetch zones for dropdown
      const zonesResponse = await fetch(`${apiBaseUrl}/api/stores/${storeId}/zones`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (zonesResponse.ok) {
        const zonesData = await zonesResponse.json()
        setZones(zonesData)
      }

    } catch (err: any) {
      setError(err.message || "Failed to load camera configurations.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [token, storeId])

  const handleAddCamera = async (e: React.FormEvent) => {
    e.preventDefault()
    setCameraError(null)
    setCameraLoading(true)

    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001"

    try {
      const response = await fetch(`${apiBaseUrl}/api/stores/${storeId}/cameras`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          camera_name: cameraName,
          stream_url: streamUrl,
          status: statusVal,
          zone_id: selectedZoneId || null,
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || "Failed to add camera.")
      }

      setCameraName("")
      setStreamUrl("")
      setSelectedZoneId("")
      fetchData()
    } catch (err: any) {
      setCameraError(err.message || "Error adding camera.")
    } finally {
      setCameraLoading(false)
    }
  }

  const handleDeleteCamera = async (cameraId: string) => {
    if (!confirm("Are you sure you want to delete this camera?")) return
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001"
    try {
      const response = await fetch(`${apiBaseUrl}/api/cameras/${cameraId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Delete failed.")
      fetchData()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleStartIngest = async (cameraId: string) => {
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001"
    try {
      setIngestionStatus(prev => ({ ...prev, [cameraId]: "starting" }))
      const response = await fetch(`${apiBaseUrl}/api/video/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ camera_id: cameraId }),
      })
      if (!response.ok) throw new Error("Failed to start ingestion.")
      setIngestionStatus(prev => ({ ...prev, [cameraId]: "running" }))
    } catch (err: any) {
      alert(err.message)
      setIngestionStatus(prev => ({ ...prev, [cameraId]: "error" }))
    }
  }

  const handleStopIngest = async (cameraId: string) => {
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001"
    try {
      setIngestionStatus(prev => ({ ...prev, [cameraId]: "stopping" }))
      const response = await fetch(`${apiBaseUrl}/api/video/stop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ camera_id: cameraId }),
      })
      if (!response.ok) throw new Error("Failed to stop ingestion.")
      setIngestionStatus(prev => ({ ...prev, [cameraId]: "stopped" }))
    } catch (err: any) {
      alert(err.message)
      setIngestionStatus(prev => ({ ...prev, [cameraId]: "error" }))
    }
  }

  const getZoneName = (zoneId: string | null) => {
    if (!zoneId) return "Unassigned"
    const z = zones.find(item => item.id === zoneId)
    return z ? z.zone_name : "Unassigned"
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push(`/stores/${storeId}`)}>
            ← Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{storeName} Cameras</h1>
            <p className="text-muted-foreground">Assign cameras and manage video stream loops.</p>
          </div>
        </div>

        {error ? (
          <div className="p-4 text-sm rounded bg-destructive/10 text-destructive border border-destructive/20 font-medium">
            {error}
          </div>
        ) : loading ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Loading camera configurations...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* ADD CAMERA FORM */}
            {isWriter && (
              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Add Camera</CardTitle>
                    <CardDescription>Assign a new stream sensor unit</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddCamera} className="space-y-4">
                      {cameraError && <div className="text-xs text-destructive">{cameraError}</div>}
                      
                      <div className="space-y-1">
                        <Label htmlFor="cameraName">Camera Name</Label>
                        <Input
                          id="cameraName"
                          placeholder="e.g. Aisle 3 Entrance Cam"
                          value={cameraName}
                          onChange={(e) => setCameraName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="streamUrl">Stream URL / Source</Label>
                        <Input
                          id="streamUrl"
                          placeholder="rtsp://... or e.g. 0 (webcam) or file path"
                          value={streamUrl}
                          onChange={(e) => setStreamUrl(e.target.value)}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor="zoneId">Associated Zone</Label>
                          <select
                            id="zoneId"
                            value={selectedZoneId}
                            onChange={(e) => setSelectedZoneId(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1"
                          >
                            <option value="">None</option>
                            {zones.map((zone) => (
                              <option key={zone.id} value={zone.id}>
                                {zone.zone_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="status">Status</Label>
                          <select
                            id="status"
                            value={statusVal}
                            onChange={(e) => setStatusVal(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={cameraLoading}>
                        {cameraLoading ? "Adding..." : "Add Camera"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* CAMERAS TABLE LIST */}
            <div className={isWriter ? "lg:col-span-2 space-y-6" : "lg:col-span-3 space-y-6"}>
              <Card>
                <CardHeader>
                  <CardTitle>Camera Feeds</CardTitle>
                  <CardDescription>Configured feeds and processing status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden bg-card">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>Zone</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ingestion</TableHead>
                          {isWriter && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cameras.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={isWriter ? 6 : 5} className="text-center text-muted-foreground h-32">
                              No cameras assigned to this store layout.
                            </TableCell>
                          </TableRow>
                        ) : (
                          cameras.map((camera) => (
                            <TableRow key={camera.id}>
                              <TableCell className="font-medium">{camera.camera_name}</TableCell>
                              <TableCell className="font-mono text-xs max-w-[150px] truncate">
                                {camera.stream_url}
                              </TableCell>
                              <TableCell className="text-xs">{getZoneName(camera.zone_id)}</TableCell>
                              <TableCell className="capitalize text-xs">
                                <span className={`inline-flex px-2 py-0.5 rounded-full font-semibold ${camera.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-zinc-500/10 text-zinc-600'}`}>
                                  {camera.status}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {ingestionStatus[camera.id] === "running" ? (
                                    <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleStopIngest(camera.id)}>
                                      Stop Ingest
                                    </Button>
                                  ) : (
                                    <Button variant="outline" size="sm" onClick={() => handleStartIngest(camera.id)}>
                                      Start Ingest
                                    </Button>
                                  )}
                                  {ingestionStatus[camera.id] && (
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">
                                      {ingestionStatus[camera.id]}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              {isWriter && (
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDeleteCamera(camera.id)}
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
type Dict<K extends string | number | symbol, V> = { [P in K]: V };
