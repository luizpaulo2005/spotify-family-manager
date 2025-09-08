import { env } from '@spotify-family-manager/env'
import { compare } from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../../../lib/prisma.ts'
import { BadRequestError } from '../_errors/bad-request-error.ts'

const authenticateWithPassword = (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/auth/password',
    {
      schema: {
        tags: ['auth'],
        summary: 'Authenticate user with email and password',
        body: z.object({
          email: z.email(),
          password: z.string().min(8).max(128),
        }),
        response: {
          201: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        throw new BadRequestError('Credenciais inválidas.')
      }

      if (user.password === null) {
        throw new BadRequestError(
          'Senha não definida, faça o login com o Google.',
        )
      }

      const isPasswordValid = await compare(password, user.password)

      if (!isPasswordValid) {
        throw new BadRequestError('Credenciais inválidas.')
      }

      const token = await reply.jwtSign(
        { sub: user.id },
        { sign: { expiresIn: '7d' } },
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

export { authenticateWithPassword }
