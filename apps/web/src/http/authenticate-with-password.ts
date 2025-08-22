import { api } from './client'

interface AuthenticateWithPasswordRequest {
  email: string
  password: string
}

const authenticateWithPassword = async ({
  email,
  password,
}: AuthenticateWithPasswordRequest) => {
  const result = await api.post('auth/password', {
    json: { email, password },
  })

  return result
}

export { authenticateWithPassword }
