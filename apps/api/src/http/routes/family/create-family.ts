import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '../../../lib/prisma.ts'
import { bankDetailsSchema } from '../../../schemas/bank-details.ts'
import { BadRequestError } from '../_errors/bad-request-error.ts'
import { auth } from '../middlewares/auth.ts'

const createFamily = (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/family',
      {
        schema: {
          tags: ['family'],
          summary: 'Create a new family',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string().nonempty(),
            description: z.string().optional(),
            maxMembers: z.number().int().positive().min(2).max(10),
            monthlyCost: z.number().positive(),
            paymentMethod: z.enum(['transfer', 'pix']),
            pixKey: z.string().optional(),
            bankDetails: bankDetailsSchema.optional(),
          }),
          response: {
            201: z.null(),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const family = await prisma.family.create({
          data: {
            ownerId: userId,
            name: request.body.name,
            description: request.body.description,
            maxMembers: request.body.maxMembers,
            monthlyCost: request.body.monthlyCost,
            paymentMethod: request.body.paymentMethod,
            pixKey: request.body.pixKey,
            bankDetails: request.body.bankDetails,
          },
        })

        if (!family) {
          throw new BadRequestError('Failed to create family')
        }

        await prisma.familyMember.create({
          data: {
            userId,
            familyId: family.id,
            role: 'admin',
          },
        })

        return reply.status(201).send()
      },
    )
}

export { createFamily }
