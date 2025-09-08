import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../../../lib/prisma.ts'
import { UnauthorizedError } from '../_errors/unauthorized-error.ts'
import { auth } from '../middlewares/auth.ts'

const rejectInvite = (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/invites/:id/reject',
      {
        schema: {
          tags: ['invites'],
          summary: 'Reject/revoke an invite',
          description:
            'Allows invite recipient to reject or family admin to revoke an invite',
          security: [{ bearerAuth: [] }],
          params: z.object({
            id: z.uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const user = await prisma.user.findUnique({
          where: { id: userId },
        })

        if (!user) {
          throw new UnauthorizedError('User not found')
        }

        const { id } = request.params

        const invite = await prisma.invite.findUnique({
          where: { id },
          include: {
            family: {
              include: {
                members: {
                  where: { userId },
                  select: { role: true },
                },
              },
            },
          },
        })

        if (!invite) {
          throw new UnauthorizedError('Invite not found')
        }

        // Check if user is the invite recipient or a family admin
        const isInviteRecipient = invite.email === user.email
        const familyMember = invite.family.members[0]
        const isAdmin = familyMember?.role === 'admin'

        if (!isInviteRecipient && !isAdmin) {
          throw new UnauthorizedError(
            'User is not authorized to reject this invite',
          )
        }

        await prisma.invite.delete({
          where: { id: invite.id },
        })

        return reply.status(204).send()
      },
    )
}

export { rejectInvite }
