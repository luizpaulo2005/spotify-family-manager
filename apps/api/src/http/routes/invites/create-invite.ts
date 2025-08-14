import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../../../lib/prisma.ts'
import { BadRequestError } from '../_errors/bad-request-error.ts'
import { UnauthorizedError } from '../_errors/unauthorized-error.ts'
import { auth } from '../middlewares/auth.ts'

const createInvite = (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/invites',
      {
        schema: {
          tags: ['invites'],
          summary: 'Create an invite',
          security: [{ bearerAuth: [] }],
          body: z.object({
            email: z.string().email(),
            familyId: z.string().uuid(),
          }),
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const { email, familyId } = request.body

        const member = await prisma.familyMember.findUnique({
          where: { familyId_userId: { familyId, userId } },
        })

        if (!member) {
          throw new UnauthorizedError('User is not a member of the family')
        }

        if (member.role !== 'admin') {
          throw new UnauthorizedError('User is not an admin')
        }

        // uncomment the lines below if you want to check if user has a account
        // const user = await prisma.user.findUnique({
        //   where: { email },
        // })

        // if (!user) {
        //   throw new BadRequestError('User not found')
        // }

        const invite = await prisma.invite.findUnique({
          where: { familyId_email: { familyId, email } },
        })

        if (invite) {
          throw new BadRequestError('Invite already exists')
        }

        await prisma.invite.create({
          data: {
            email,
            familyId,
          },
        })

        return reply.status(201).send()
      },
    )
}

export { createInvite }
