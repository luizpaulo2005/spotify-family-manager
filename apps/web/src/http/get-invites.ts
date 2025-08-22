import { api } from './client'

interface GetInvitesResponse {
  invites: Array<{
    id: string
    email: string
    code: string
    expiresAt: Date
    createdAt: Date
    family: {
      id: string
      name: string
      owner: {
        id: string
        name: string
        avatarUrl: string | null
      }
    }
  }>
}

const getInvites = async () => {
  const result = await api.get('invites').json<GetInvitesResponse>()

  return { result }
}

export { getInvites }
