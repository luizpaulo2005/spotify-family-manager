import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import scalarFastifyApiReference from '@scalar/fastify-api-reference'
import { env } from '@spotify-family-manager/env'
import fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { errorHandler } from './error-handler.ts'
import { authenticateWithGoogle } from './routes/auth/authenticate-with-google.ts'
import { authenticateWithPassword } from './routes/auth/authenticate-with-password.ts'
import { createAccount } from './routes/auth/create-account.ts'
import { getProfile } from './routes/auth/get-profile.ts'
import { createFamily } from './routes/family/create-family.ts'
import { getFamilies } from './routes/family/get-families.ts'
import { removeMember } from './routes/family/remove-member.ts'
import { transferOwnership } from './routes/family/transfer-ownership.ts'
import { updateFamily } from './routes/family/update-family.ts'
import { checkHealth } from './routes/health.ts'
import { createInvite } from './routes/invites/create-invite.ts'
import { getInvites } from './routes/invites/get-invites.ts'
import { rejectInvite } from './routes/invites/reject-invite.ts'
import { logger } from './routes/middlewares/logger.ts'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifyCors, { origin: '*' })
app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})
app.register(fastifyCookie, {
  secret: env.COOKIE_SECRET,
  parseOptions: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days,
    path: '/',
    sameSite: 'strict',
  },
})

if (process.env.NODE_ENV === 'development') {
  app.register(logger)

  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Spotify Family Manager API',
        description: 'API documentation for the Spotify Family Manager',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    transform: jsonSchemaTransform,
  })

  app.register(scalarFastifyApiReference, {
    routePrefix: '/docs',
  })
}

app.setErrorHandler(errorHandler)

app.register(checkHealth)

app.register(authenticateWithPassword)
app.register(authenticateWithGoogle)
app.register(createAccount)
app.register(getProfile)

app.register(createFamily)
app.register(getFamilies)
app.register(updateFamily)
app.register(removeMember)
app.register(transferOwnership)

app.register(getInvites)
app.register(createInvite)
app.register(rejectInvite)

app.listen({ port: env.SERVER_PORT, host: env.HOST }).then(() => {
  console.log(`Server is running on http://${env.HOST}:${env.SERVER_PORT}`)
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `API reference available at http://${env.HOST}:${env.SERVER_PORT}/api-reference`,
    )
  }
})
