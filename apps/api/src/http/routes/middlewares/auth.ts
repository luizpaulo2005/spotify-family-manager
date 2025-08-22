import type { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

import { UnauthorizedError } from '../_errors/unauthorized-error.ts'

const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request, reply) => {
    request.getCurrentUserId = async () => {
      try {
        const { sub } = await request.jwtVerify<{ sub: string }>({
          onlyCookie: true,
        })

        return sub
      } catch {
        reply.clearCookie('token', { path: '/' })
        throw new UnauthorizedError('Token inválido.')
      }
    }
  })
})

export { auth }
