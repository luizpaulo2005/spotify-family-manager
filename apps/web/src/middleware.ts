import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

const publicRoutes = ['/auth/sign-in', '/auth/sign-up']

export async function middleware(request: NextRequest) {
  const cookie = await cookies()
  const token = cookie.get('token')
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname)

  // 1. Se logado e for rota pública → redireciona para "/"
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 2. Se não logado e for rota privada → redireciona para "/auth/sign-in"
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }

  // 3. Caso contrário (logado + rota privada || não logado + rota pública) → libera
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
