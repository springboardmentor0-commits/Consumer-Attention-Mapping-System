import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground transition-colors duration-200">
        <div className="max-w-md w-full text-center space-y-6 p-6 border rounded-xl shadow-lg bg-card">
          <h1 className="text-3xl font-bold tracking-tight">
            Consumer Attention System
          </h1>
          <p className="text-sm text-muted-foreground">
            Frontend stack successfully configured with Vite, React, TypeScript, Tailwind CSS, and shadcn/ui.
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Toggle Theme
            </span>
            <ModeToggle />
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
