import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

const signOut = async (request: NextRequest) => {
  const cookie = await cookies()

  cookie.delete('token')

  const host = request.headers.get('host')
  const protocol = request.headers.get('x-forwarded-proto') || 'http'

  const redirectUrl = `${protocol}://${host}/auth/sign-in`

  return NextResponse.redirect(redirectUrl)
}

export { signOut as GET }
