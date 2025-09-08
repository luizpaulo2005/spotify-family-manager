import './globals.css'

import type { Metadata } from 'next'
import { JetBrains_Mono as JetBrainsMono, Outfit } from 'next/font/google'

import { Toaster } from '@/components/ui/sonner'
import { ProgressProvider } from '@/providers/progress-bar'
import { ThemeProvider } from '@/providers/theme'

const outfitSans = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
})

const jetBrainsMono = JetBrainsMono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Spotify Family Manager',
  description: 'Gerencie sua família do Spotify de forma fácil e rápida',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="system" enableSystem attribute="class">
          <div
            className={`${outfitSans.variable} ${jetBrainsMono.variable} text-foreground antialiased`}
          >
            <ProgressProvider>
              <Toaster
                richColors
                position="top-right"
                expand={true}
                duration={4000}
              />
              {children}
            </ProgressProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
