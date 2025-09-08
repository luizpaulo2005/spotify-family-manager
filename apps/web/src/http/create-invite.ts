import { api } from './client'

interface CreateInviteRequest {
  email: string
  familyId: string
}

const createInvite = async ({ email, familyId }: CreateInviteRequest) => {
  await api.post('invites', {
    json: {
      email,
      familyId,
    },
  })
}

export { createInvite }
