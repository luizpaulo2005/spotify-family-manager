import { env } from '@spotify-family-manager/env'
import { type CookiesFn, deleteCookie, getCookie } from 'cookies-next'
import ky from 'ky'

const api = ky.create({
  prefixUrl: env.NEXT_PUBLIC_API_URL,
  hooks: {
    beforeRequest: [
      async (request) => {
        let cookieStore: CookiesFn | undefined

        if (typeof window === 'undefined') {
          const { cookies: serverCookies } = await import('next/headers')

          cookieStore = serverCookies
        }

        const token = await getCookie('token', { cookies: cookieStore })

        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            deleteCookie('token')

            window.location.reload()
          }
        }

        return response
      },
    ],
  },
})

export { api }
