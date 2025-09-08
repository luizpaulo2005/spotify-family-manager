import { api } from './client'

interface CreateAccountRequest {
  name: string
  email: string
  password: string
}

const createAccount = async ({
  name,
  email,
  password,
}: CreateAccountRequest) => {
  const result = await api.post('create-account', {
    json: { name, email, password },
  })

  return result
}

export { createAccount }
