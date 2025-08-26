import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/theme-context'
import { AuthProvider } from '@/contexts/auth-context'
import { ToastProvider } from '@/components/ui/toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FisioHUB - Plataforma SaaS para Gestão de Indicadores Clínicos',
  description: 'Plataforma SaaS completa para gestão inteligente de indicadores clínicos com arquitetura multitenancy e testes automatizados',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('fisiohub-ui-theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  // Sistema padrão
                  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (systemDark) {
                    document.documentElement.classList.add('dark');
                  }
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}