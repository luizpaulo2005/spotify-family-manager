import { api } from './client'

interface GetUserFamiliesResponse {
  families: Array<{
    id: string
    name: string
    description: string | null
    maxMembers: number
    paymentMethod: 'pix' | 'transfer'
    pixKey: string | null
    bankDetails: {
      bankName: string
      accountNumber: string
      agencyNumber: string
      accountType: 'corrente' | 'poupança'
    } | null
    createdAt: Date
    updatedAt: Date
    members: Array<{
      id: string
      role: 'member' | 'admin'
      joinedAt: Date
      user: {
        id: string
        email: string
        name: string
        avatarUrl: string | null
      }
    }>
  }>
}

const getUserFamilies = async () => {
  const result = await api.get('family').json<GetUserFamiliesResponse>()

  return { result }
}

export { getUserFamilies }
