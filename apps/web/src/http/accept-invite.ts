import { api } from './client'

interface AcceptInviteRequest {
  inviteId: string
}

const acceptInvite = async ({ inviteId }: AcceptInviteRequest) => {
  await api.patch(`invites/${inviteId}/accept`)
}

export { acceptInvite }
