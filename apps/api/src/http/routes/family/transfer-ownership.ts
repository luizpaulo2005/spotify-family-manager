import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../../../lib/prisma.ts'
import { BadRequestError } from '../_errors/bad-request-error.ts'
import { UnauthorizedError } from '../_errors/unauthorized-error.ts'
import { auth } from '../middlewares/auth.ts'

const transferOwnership = (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .patch(
      '/family/:id/transfer-ownership',
      {
        schema: {
          tags: ['family'],
          summary: 'Transfer family ownership',
          security: [{ bearerAuth: [] }],
          params: z.object({
            id: z.uuid(),
          }),
          body: z.object({
            newOwnerId: z.uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { id } = request.params
        const { newOwnerId } = request.body

        if (newOwnerId === userId) {
          throw new BadRequestError(
            'New owner must be different from current owner',
          )
        }

        const family = await prisma.family.findUnique({ where: { id } })

        if (!family) {
          throw new BadRequestError('Family not found')
        }

        if (family.ownerId !== userId) {
          throw new UnauthorizedError('You are not the owner of this family')
        }

        const targetMembership = await prisma.familyMember.findUnique({
          where: { familyId_userId: { familyId: id, userId: newOwnerId } },
        })

        if (!targetMembership) {
          throw new BadRequestError('New owner must be a member of this family')
        }

        await prisma.$transaction([
          prisma.family.update({
            where: { id },
            data: { ownerId: newOwnerId },
          }),
          prisma.familyMember.update({
            where: { id: targetMembership.id },
            data: { role: 'admin' },
          }),
          prisma.familyMember.update({
            where: { familyId_userId: { familyId: id, userId } },
            data: { role: 'member' },
          }),
        ])

        return reply.status(204).send()
      },
    )
}

export { transferOwnership }
