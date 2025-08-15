import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { FlatCompat } from '@eslint/eslintrc'
import { globalIgnores } from 'eslint/config'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

export default [
  globalIgnores(['dist']),
  ...compat.extends('@spotify-family-manager/eslint-config/react'),
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  // Regras de Fast Refresh para Vite/React
  reactRefresh.configs.vite,
]
