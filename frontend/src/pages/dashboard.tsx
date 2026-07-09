import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/auth-context"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { AlertCircle, LogOut, Store } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

type StoreItem = {
  id: string
  name: string
  location: string
  created_at: string
}

export function DashboardPage() {
  const [stores, setStores] = useState<StoreItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { token, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // If not authenticated, redirect to login page
    if (!isAuthenticated || !token) {
      navigate("/login")
      return
    }

    const fetchStores = async () => {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8001"
      try {
        const response = await fetch(`${apiBaseUrl}/api/stores`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          if (response.status === 401) {
            logout()
            navigate("/login")
            return
          }
          throw new Error("Failed to fetch stores data.")
        }

        const data = await response.json()
        setStores(data)
      } catch (err: any) {
        setError(err.message || "Could not retrieve stores.")
      } finally {
        setLoading(false)
      }
    }

    fetchStores()
  }, [token, isAuthenticated, navigate, logout])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b bg-card py-4 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Store className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tight">
            Store Manager Portal
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-w-5xl w-full mx-auto space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            List of stores registered in the Consumer Attention Mapping System.
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading stores...</p>
          </div>
        ) : (
          <div className="border rounded-lg bg-card overflow-hidden shadow-sm">
            <Table>
              <TableCaption>A list of active mapped store locations.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Index</TableHead>
                  <TableHead>Store Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                      No stores found. Set up a store using the backend APIs to see them here.
                    </TableCell>
                  </TableRow>
                ) : (
                  stores.map((store, index) => (
                    <TableRow key={store.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-semibold">{store.name}</TableCell>
                      <TableCell>{store.location}</TableCell>
                      <TableCell className="text-right text-muted-foreground text-xs">
                        {new Date(store.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  )
}
