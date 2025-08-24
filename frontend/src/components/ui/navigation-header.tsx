'use client'

import Link from 'next/link'
import { useTheme } from '@/contexts/theme-context'
import { Button } from '@/components/ui/button'
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle'
import { Home, LogOut, Settings, Activity } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface NavigationHeaderProps {
  title?: string
  showBackButton?: boolean
}

export function NavigationHeader({ title, showBackButton = true }: NavigationHeaderProps) {
  const { companyName } = useTheme()
  const router = useRouter()

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold">{title || companyName || 'FisioHub'}</h1>
            {title && companyName && (
              <p className="text-sm text-muted-foreground">{companyName}</p>
            )}
          </div>
        </div>

        <div className="flex-1" />

        <nav className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          
          <Link href="/indicators">
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Activity className="h-4 w-4 mr-2" />
              Indicadores
            </Button>
          </Link>

          <DarkModeToggle />

          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </nav>
      </div>
    </header>
  )
}