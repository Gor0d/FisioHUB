"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DarkModeToggle() {
  const [isDark, setIsDark] = React.useState(false)

  React.useEffect(() => {
    // Verificar estado atual
    const isDarkMode = document.documentElement.classList.contains('dark')
    setIsDark(isDarkMode)
  }, [])

  const toggleDarkMode = () => {
    const root = document.documentElement
    const newDarkMode = !isDark
    
    if (newDarkMode) {
      root.classList.add('dark')
      localStorage.setItem('fisiohub-ui-theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('fisiohub-ui-theme', 'light')
    }
    
    setIsDark(newDarkMode)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleDarkMode}
      className="flex items-center gap-2"
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="hidden sm:inline">
        {isDark ? 'Claro' : 'Escuro'}
      </span>
    </Button>
  )
}