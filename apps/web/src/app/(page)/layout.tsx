import { Navbar } from '@/components/navbar'
import { QueryProvider } from '@/providers/query'

export default function PageLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <QueryProvider>
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-2 p-2">
        <Navbar />
        {children}
      </div>
    </QueryProvider>
  )
}
