import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

const checkHealth = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/health',
    {
      schema: {
        tags: ['health'],
        summary: 'Health check endpoint',
        response: {
          200: z.literal('OK'),
        },
      },
    },
    () => {
      return 'OK' as const
    },
  )
}

export { checkHealth }
