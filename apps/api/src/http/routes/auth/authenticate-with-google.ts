import { env } from '@spotify-family-manager/env'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../../../lib/prisma.ts'
import { BadRequestError } from '../_errors/bad-request-error.ts'

const authenticateWithGoogle = (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/auth/google',
    {
      schema: {
        tags: ['auth'],
        summary: 'Authenticate user with Google',
        body: z.object({
          code: z.string(),
        }),
        response: {
          201: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { code } = request.body

      const googleOauthURL = new URL('https://oauth2.googleapis.com/token')

      googleOauthURL.searchParams.set('client_id', env.GOOGLE_OAUTH_CLIENT_ID)
      googleOauthURL.searchParams.set(
        'client_secret',
        env.GOOGLE_OAUTH_CLIENT_SECRET,
      )
      googleOauthURL.searchParams.set(
        'redirect_uri',
        env.GOOGLE_OAUTH_REDIRECT_URI,
      )
      googleOauthURL.searchParams.set('code', code)
      googleOauthURL.searchParams.set('grant_type', 'authorization_code')

      const googleAccessTokenResponse = await fetch(googleOauthURL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      })

      const googleAccessTokenData = await googleAccessTokenResponse.json()

      const { access_token: googleAccessToken } = z
        .object({
          access_token: z.string(),
          expires_in: z.number(),
          scope: z.string(),
          token_type: z.literal('Bearer'),
          id_token: z.string(),
        })
        .parse(googleAccessTokenData)

      const googleUserResponse = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: {
            Authorization: `Bearer ${googleAccessToken}`,
          },
        },
      )

      const googleUserData = await googleUserResponse.json()

      const { sub, email, name, picture } = z
        .object({
          sub: z.string(),
          name: z.string(),
          email: z.string().email(),
          picture: z.string().url(),
        })
        .parse(googleUserData)

      let user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            googleId: sub,
            email,
            name,
            avatarUrl: picture,
          },
        })
      }

      if (user.password !== null) {
        throw new BadRequestError(
          'Você já possui uma senha definida, faça o login com a senha.',
        )
      }

      const token = await reply.jwtSign(
        {
          sub: user.id,
        },
        {
          sign: {
            expiresIn: '7d',
          },
        },
      )

      reply.setCookie('token', token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        path: '/',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: env.NODE_ENV === 'production',
        signed: false, // Não assinar o cookie para compatibilidade com Next.js
      })

      return reply.status(201).send()
    },
  )
}

export { authenticateWithGoogle }
