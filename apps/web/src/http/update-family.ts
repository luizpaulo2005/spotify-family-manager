import { api } from './client'

interface UpdateFamilyRequest {
  familyId: string
  name?: string
  description?: string
  maxMembers?: number
  monthlyCost?: number
  dueDay?: number
  paymentMethod?: 'pix' | 'transfer'
  pixKey?: string
  bankDetails?: {
    bankName: string
    accountNumber: string
    agencyNumber: string
    accountType: 'corrente' | 'poupança'
  }
}

interface UpdateFamilyResponse {
  family: {
    id: string
    name: string
    description: string | null
    maxMembers: number
    monthlyCost: number
    dueDay: number
    paymentMethod: 'pix' | 'transfer'
    pixKey: string | null
    bankDetails: {
      bankName: string
      accountNumber: string
      agencyNumber: string
      accountType: 'corrente' | 'poupança'
    } | null
    updatedAt: Date
  }
}

const updateFamily = async ({ familyId, ...data }: UpdateFamilyRequest) => {
  const result = await api
    .put(`family/${familyId}`, {
      json: data,
    })
    .json<UpdateFamilyResponse>()

  return result
}

export { updateFamily }
