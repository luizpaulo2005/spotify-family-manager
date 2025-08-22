import type { FastifyInstance } from 'fastify'
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod'
import { z, ZodError } from 'zod'

import { BadRequestError } from '../http/routes/_errors/bad-request-error.ts'
import { UnauthorizedError } from '../http/routes/_errors/unauthorized-error.ts'

type FastifyErrorHandler = FastifyInstance['errorHandler']

const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (process.env.NODE_ENV !== 'development') {
    console.error(error)

    return reply.status(500).send({ message: 'Erro interno do servidor.' })
  }

  if (error instanceof BadRequestError) {
    return reply.status(400).send({
      message: error.message,
    })
  }

  if (error instanceof UnauthorizedError) {
    return reply.status(401).send({
      message: error.message,
    })
  }

  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: 'Erro de validação.',
      errors: error.validation.map((validation) => {
        return {
          path: validation.params.issue.path[0],
          message: validation.params.issue.message,
          expected: validation.params.issue.expected,
          received: validation.params.issue.received,
        }
      }),
    })
  }

  if (error instanceof ZodError) {
    reply.status(400).send({
      message: 'Erro de validação.',
      errors: z.treeifyError(error),
    })
  }

  console.error(error)

  return reply.status(500).send({ message: 'Erro interno do servidor.' })
}

export { errorHandler }
