import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../../../lib/prisma.ts'
import { BadRequestError } from '../_errors/bad-request-error.ts'
import { UnauthorizedError } from '../_errors/unauthorized-error.ts'
import { auth } from '../middlewares/auth.ts'

const reversePayment = (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/payments/:paymentId',
      {
        schema: {
          tags: ['payments'],
          summary: 'Reverse a payment',
          security: [{ bearerAuth: [] }],
          params: z.object({
            paymentId: z.string().uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { paymentId } = request.params

        // Buscar o pagamento e verificar se pertence ao usuário
        const payment = await prisma.payment.findUnique({
          where: { id: paymentId },
          include: {
            member: {
              include: {
                family: true,
              },
            },
          },
        })

        if (!payment) {
          throw new BadRequestError('Payment not found')
        }

        // Verificar se o pagamento pertence ao usuário
        if (payment.member.userId !== userId) {
          throw new UnauthorizedError(
            'User is not authorized to reverse this payment',
          )
        }

        // Verificar se o pagamento pode ser estornado (dentro do prazo)
        const paymentDate = new Date(payment.createdAt)
        const currentDate = new Date()
        const daysDifference = Math.floor(
          (currentDate.getTime() - paymentDate.getTime()) /
            (1000 * 60 * 60 * 24),
        )

        // Permitir estorno apenas nos primeiros 7 dias
        if (daysDifference > 7) {
          throw new BadRequestError(
            'Payment can only be reversed within 7 days of creation',
          )
        }

        // Verificar se o pagamento ainda não foi estornado
        if (payment.status === 'reversed') {
          throw new BadRequestError('Payment has already been reversed')
        }

        // Estornar o pagamento (marcar como estornado ao invés de deletar)
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: 'reversed',
          },
        })

        return reply.status(204).send()
      },
    )
}

export { reversePayment }
