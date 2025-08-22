import { api } from './client'

interface GetProfileResponse {
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

const getProfile = async () => {
  const result = await api.get('profile').json<GetProfileResponse>()

  return { result }
}

export { getProfile }
