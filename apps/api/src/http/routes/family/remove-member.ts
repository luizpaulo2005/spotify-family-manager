import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '../../../lib/prisma.ts'
import { UnauthorizedError } from '../_errors/unauthorized-error.ts'
import { auth } from '../middlewares/auth.ts'
import { BadRequestError } from '../_errors/bad-request-error.ts'

const removeMember = (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/family/:id/remove-member/:memberId',
      {
        schema: {
          tags: ['family'],
          summary: 'Remove a member from the family',
          security: [{ bearerAuth: [] }],
          params: z.object({
            id: z.uuid(),
            memberId: z.uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const { id, memberId } = request.params

        const userMembership = await prisma.familyMember.findUnique({
          where: { familyId_userId: { familyId: id, userId } },
        })

        if (!userMembership) {
          throw new UnauthorizedError('You are not a member of this family')
        }

        if (userMembership.role !== 'admin') {
          throw new UnauthorizedError(
            'You are not allowed to remove members from this family',
          )
        }

        const member = await prisma.familyMember.findUnique({
          where: { id: memberId },
        })

        if (!member) {
          throw new BadRequestError('Member not found')
        }

        await prisma.familyMember.delete({
          where: { id: memberId },
        })

        return reply.status(204).send()
      },
    )
}

export { removeMember }
