import { hash } from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '../../../lib/prisma.ts'
import { BadRequestError } from '../_errors/bad-request-error.ts'

const createAccount = (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/create-account',
    {
      schema: {
        tags: ['auth'],
        summary: 'Create a new user account',
        body: z.object({
          name: z.string().nonempty(),
          email: z.email(),
          password: z.string().min(8),
        }),
        response: {
          201: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body

      const userExists = await prisma.user.findUnique({
        where: { email },
      })

      if (userExists) {
        throw new BadRequestError('Email já cadastrado.')
      }

      const hashedPassword = await hash(password, 8)

      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      })

      return reply.status(201).send()
    },
  )
}

export { createAccount }
