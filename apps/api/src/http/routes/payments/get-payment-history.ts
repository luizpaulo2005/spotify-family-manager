import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../../../lib/prisma.ts'
import { UnauthorizedError } from '../_errors/unauthorized-error.ts'
import { auth } from '../middlewares/auth.ts'

const getPaymentHistory = (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/payments/history',
      {
        schema: {
          tags: ['payments'],
          summary: 'Get payment history for user',
          security: [{ bearerAuth: [] }],
          querystring: z.object({
            familyId: z.string().uuid().optional(),
            limit: z.string().transform(Number).optional(),
            offset: z.string().transform(Number).optional(),
          }),
          response: {
            200: z.object({
              payments: z.array(
                z.object({
                  id: z.uuid(),
                  amount: z.number().positive(),
                  status: z.enum(['pending', 'paid', 'reversed']),
                  createdAt: z.date(),
                  family: z.object({
                    id: z.uuid(),
                    name: z.string(),
                  }),
                }),
              ),
              total: z.number(),
            }),
          },
        },
      },
      async (request) => {
        const userId = await request.getCurrentUserId()
        const { familyId, limit = 50, offset = 0 } = request.query

        // Verificar se o usuário existe
        const user = await prisma.user.findUnique({
          where: { id: userId },
        })

        if (!user) {
          throw new UnauthorizedError('User not found')
        }

        // Construir filtros
        const where = {
          member: {
            userId,
            ...(familyId && { familyId }),
          },
        }

        // Buscar pagamentos
        const [payments, total] = await Promise.all([
          prisma.payment.findMany({
            where,
            include: {
              member: {
                include: {
                  family: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: limit,
            skip: offset,
          }),
          prisma.payment.count({ where }),
        ])

        // Formatar resposta
        const formattedPayments = payments.map((payment) => ({
          id: payment.id,
          amount: payment.amount,
          status: payment.status as 'pending' | 'paid' | 'reversed',
          createdAt: payment.createdAt,
          family: {
            id: payment.member.family.id,
            name: payment.member.family.name,
          },
        }))

        return {
          payments: formattedPayments,
          total,
        }
      },
    )
}

export { getPaymentHistory }
