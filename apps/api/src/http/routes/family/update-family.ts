import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

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
            id: z.string().uuid(),
          }),
          body: z.object({
            name: z.string().min(2).max(128).optional(),
            description: z.string().optional(),
            maxMembers: z.number().int().positive().min(2).max(10).optional(),
            monthlyCost: z.number().positive().optional(),
            dueDay: z.number().int().min(1).max(31).optional(),
            paymentMethod: z.enum(['transfer', 'pix']).optional(),
            pixKey: z.string().optional(),
            bankDetails: bankDetailsSchema.optional(),
          }),
        },
      },
      async (request, reply) => {
        const { id } = request.params
        const userId = await request.getCurrentUserId()

        // Verificar se a família existe e se o usuário é membro
        const family = await prisma.family.findUnique({
          where: { id },
        })

        if (!family) {
          throw new BadRequestError('Família não encontrada')
        }

        // Verificar se o usuário é admin da família
        const userMember = await prisma.familyMember.findUnique({
          where: {
            familyId_userId: {
              familyId: id,
              userId,
            },
          },
        })

        if (!userMember || userMember.role !== 'admin') {
          throw new BadRequestError(
            'Apenas administradores podem editar a família',
          )
        }

        const updateData = request.body

        // Validações específicas
        if (
          updateData.paymentMethod === 'pix' &&
          !updateData.pixKey &&
          !family.pixKey
        ) {
          throw new BadRequestError(
            'Chave PIX é obrigatória quando o método de pagamento é PIX',
          )
        }

        if (
          updateData.paymentMethod === 'transfer' &&
          !updateData.bankDetails &&
          !family.bankDetails
        ) {
          throw new BadRequestError(
            'Dados bancários são obrigatórios quando o método de pagamento é transferência',
          )
        }

        // Atualizar a família
        const updatedFamily = await prisma.family.update({
          where: { id },
          data: updateData,
        })

        return reply.status(200).send({
          family: updatedFamily,
        })
      },
    )
}

export { updateFamily }
