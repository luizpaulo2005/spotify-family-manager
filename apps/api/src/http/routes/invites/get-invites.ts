import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../../../lib/prisma.ts'
import { UnauthorizedError } from '../_errors/unauthorized-error.ts'
import { auth } from '../middlewares/auth.ts'

const getInvites = (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/invites',
      {
        schema: {
          tags: ['invites'],
          summary: 'Get user invites',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              invites: z.array(
                z.object({
                  id: z.uuid(),
                  email: z.email(),
                  code: z.uuid(),
                  expiresAt: z.date(),
                  createdAt: z.date(),
                  family: z.object({
                    id: z.uuid(),
                    name: z.string(),
                    owner: z.object({
                      id: z.uuid(),
                      name: z.string(),
                      avatarUrl: z.url().nullable(),
                    }),
                  }),
                }),
              ),
            }),
          },
        },
      },
      async (request) => {
        const userId = await request.getCurrentUserId()

        const user = await prisma.user.findUnique({
          where: { id: userId },
        })

        if (!user) {
          throw new UnauthorizedError('User not found')
        }

        const invites = await prisma.invite.findMany({
          where: { email: user.email },
          include: {
            family: {
              select: {
                id: true,
                name: true,
                owner: {
                  select: {
                    id: true,
                    name: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        })

        return { invites }
      },
    )
}

export { getInvites }
