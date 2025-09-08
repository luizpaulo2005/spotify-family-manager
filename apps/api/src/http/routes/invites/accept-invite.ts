import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '../../../lib/prisma.ts'
import { UnauthorizedError } from '../_errors/unauthorized-error.ts'
import { auth } from '../middlewares/auth.ts'

const acceptInvite = (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/invites/:id/accept',
      {
        schema: {
          tags: ['invites'],
          summary: 'Accept an invite',
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
          where: { id, email: user.email },
        })

        if (!invite) {
          throw new UnauthorizedError('Invite not found')
        }

        if (invite.email !== user.email) {
          throw new UnauthorizedError('User is not the owner of the invite')
        }

        // Check if user is already a member
        const existingMember = await prisma.familyMember.findUnique({
          where: { familyId_userId: { familyId: invite.familyId, userId } },
        })

        if (existingMember) {
          throw new UnauthorizedError('User is already a member of this family')
        }

        // Create the family member and delete the invite in a transaction
        await prisma.$transaction([
          prisma.familyMember.create({
            data: {
              familyId: invite.familyId,
              userId,
              role: 'member',
              joinedAt: new Date(),
            },
          }),
          prisma.invite.delete({
            where: { id: invite.id },
          }),
        ])

        return reply.status(204).send()
      },
    )
}

export { acceptInvite }
