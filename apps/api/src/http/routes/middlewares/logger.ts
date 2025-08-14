import type { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

const logger = fastifyPlugin((app: FastifyInstance) => {
  app.addHook('onRequest', async (request) => {
    request.loggerStartAt = process.hrtime.bigint()
  })

  app.addHook('onResponse', async (request, reply) => {
    const start: bigint | undefined = request.loggerStartAt
    const elapsedMs = start
      ? Number(process.hrtime.bigint() - start) / 1_000_000
      : 0

    const lenHeader = reply.getHeader('content-length')
    const contentLength = Array.isArray(lenHeader)
      ? lenHeader.join(',')
      : (lenHeader ?? '-')

    const line = `${request.method} ${request.url} ${reply.statusCode} ${elapsedMs.toFixed(
      3,
    )} ms - ${contentLength}`

    console.log(line)
  })
})

export { logger }
