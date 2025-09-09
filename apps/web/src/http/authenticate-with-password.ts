import { api } from './client'

interface AuthenticateWithPasswordRequest {
  email: string
  password: string
}

interface AuthenticateWithPasswordResponse {
  token: string
}

const authenticateWithPassword = async ({
  email,
  password,
}: AuthenticateWithPasswordRequest) => {
  const result = await api
    .post('auth/password', {
      json: { email, password },
    })
    .json<AuthenticateWithPasswordResponse>()

  return result
}

export { authenticateWithPassword }
