import type { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

import { prisma } from '../../../lib/prisma.ts'
import { UnauthorizedError } from '../_errors/unauthorized-error.ts'

const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request) => {
    request.getCurrentUserId = async () => {
      try {
        const { sub } = await request.jwtVerify<{ sub: string }>()

        return sub
      } catch {
        throw new UnauthorizedError('Token inválido.')
      }
    }

    const userId = await request.getCurrentUserId()

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new UnauthorizedError('Usuário não encontrado.')
    }
  })
})

export { auth }
