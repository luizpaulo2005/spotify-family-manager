import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '../../../lib/prisma.ts'
import { bankDetailsSchema } from '../../../schemas/bank-details.ts'
import { auth } from '../middlewares/auth.ts'

const getFamilies = (app: FastifyInstance) => {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/family',
      {
        schema: {
          tags: ['family'],
          summary: 'Get user families',
          security: [{ bearerAuth: [] }],
          response: {
            200: z.object({
              userId: z.uuid(),
              families: z.array(
                z.object({
                  id: z.uuid(),
                  name: z.string(),
                  description: z.string().nullable(),
                  maxMembers: z.int(),
                  monthlyCost: z.number().positive(),
                  dueDay: z.int(),
                  paymentMethod: z.enum(['transfer', 'pix']),
                  pixKey: z.string().nullable(),
                  bankDetails: z
                    .unknown()
                    .transform((val) => bankDetailsSchema.parse(val))
                    .nullable(),
                  createdAt: z.date(),
                  updatedAt: z.date(),
                  members: z.array(
                    z.object({
                      id: z.uuid(),
                      role: z.string(),
                      joinedAt: z.date(),
                      user: z.object({
                        id: z.uuid(),
                        email: z.email(),
                        name: z.string(),
                        avatarUrl: z.url().nullable(),
                      }),
                      payments: z.array(
                        z.object({
                          id: z.uuid(),
                          amount: z.number().positive(),
                          memberId: z.uuid(),
                          createdAt: z.date(),
                        }),
                      ),
                    }),
                  ),
                  invites: z.array(
                    z.object({
                      id: z.uuid(),
                      email: z.email(),
                      createdAt: z.date(),
                      expiresAt: z.date(),
                    }),
                  ),
                }),
              ),
            }),
          },
        },
      },
      async (request) => {
        const userId = await request.getCurrentUserId()

        const families = await prisma.family.findMany({
          where: {
            members: {
              some: {
                userId,
              },
            },
          },
          include: {
            members: {
              select: {
                id: true,
                role: true,
                joinedAt: true,
                user: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                    avatarUrl: true,
                  },
                },
                payments: {
                  where: {
                    status: {
                      not: 'reversed', // Não incluir pagamentos estornados
                    },
                  },
                  select: {
                    id: true,
                    memberId: true,
                    amount: true,
                    createdAt: true,
                  },
                },
              },
            },
            invites: {
              select: {
                id: true,
                email: true,
                createdAt: true,
                expiresAt: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        })

        return { userId, families }
      },
    )
}

export { getFamilies }
