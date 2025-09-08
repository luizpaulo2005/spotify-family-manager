import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../../../lib/prisma.ts'
import { BadRequestError } from '../_errors/bad-request-error.ts'
import { UnauthorizedError } from '../_errors/unauthorized-error.ts'
import { auth } from '../middlewares/auth.ts'

const createPayment = (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/payments',
      {
        schema: {
          tags: ['payments'],
          summary: 'Create a payment',
          security: [{ bearerAuth: [] }],
          body: z.object({
            familyId: z.string().uuid(),
            amount: z.number().positive(),
          }),
          response: {
            201: z.object({
              paymentId: z.string().uuid(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { familyId, amount } = request.body

        // Verificar se o usuário é membro da família
        const member = await prisma.familyMember.findUnique({
          where: { familyId_userId: { familyId, userId } },
          include: {
            family: true,
          },
        })

        if (!member) {
          throw new UnauthorizedError('User is not a member of this family')
        }

        // Verificar se o valor está correto (valor da família dividido pelo número de membros)
        const membersCount = await prisma.familyMember.count({
          where: { familyId },
        })

        const expectedAmount = member.family.monthlyCost / membersCount

        if (Math.abs(amount - expectedAmount) > 0.01) {
          throw new BadRequestError(
            `Invalid amount. Expected: ${expectedAmount.toFixed(2)}`,
          )
        }

        // Verificar se já existe um pagamento para este mês
        const currentDate = new Date()
        const startOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1,
        )
        const endOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0,
        )

        const existingPayment = await prisma.payment.findFirst({
          where: {
            memberId: member.id,
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
            status: {
              not: 'reversed', // Não considerar pagamentos estornados
            },
          },
        })

        if (existingPayment) {
          throw new BadRequestError('Payment for this month already exists')
        }

        // Criar o pagamento
        const payment = await prisma.payment.create({
          data: {
            memberId: member.id,
            amount,
            status: 'paid',
          },
        })

        return reply.status(201).send({ paymentId: payment.id })
      },
    )
}

export { createPayment }
