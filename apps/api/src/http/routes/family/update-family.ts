import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '../../../lib/prisma.ts'
import { bankDetailsSchema } from '../../../schemas/bank-details.ts'
import { BadRequestError } from '../_errors/bad-request-error.ts'
import { auth } from '../middlewares/auth.ts'

const updateFamily = (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/family/:id',
      {
        schema: {
          tags: ['family'],
          summary: 'Update family details',
          security: [{ bearerAuth: [] }],
          params: z.object({
            id: z.uuid(),
          }),
          body: z.object({
            name: z.string().min(2).max(128).optional(),
            description: z.string().optional(),
            maxMembers: z.number().int().positive().min(2).max(10).optional(),
            monthlyCost: z.number().positive().optional(),
            dueDay: z.int().min(1).max(31).optional(),
            paymentMethod: z.enum(['transfer', 'pix']).optional(),
            pixKey: z.string().optional(),
            bankDetails: bankDetailsSchema.optional(),
          }),
        },
      },
      async (request, reply) => {
        const { id } = request.params

        const family = await prisma.family.findUnique({
          where: { id },
        })

        if (!family) {
          throw new BadRequestError('Family not found')
        }

        await prisma.family.update({
          where: { id },
          data: {
            ...request.body,
          },
        })

        return reply.status(200).send()
      },
    )
}

export { updateFamily }
