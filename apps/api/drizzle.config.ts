import { env } from '@spotify-family-manager/env'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  schema: 'src/db/schema/*',
  out: 'src/db/migrations',
  casing: 'snake_case',
})
