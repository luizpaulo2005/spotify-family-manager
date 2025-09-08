import { api } from './client'

interface RejectInviteRequest {
  inviteId: string
}

const rejectInvite = async ({ inviteId }: RejectInviteRequest) => {
  await api.patch(`invites/${inviteId}/reject`)
}

export { rejectInvite }
