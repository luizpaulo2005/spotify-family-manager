import { api } from './client'

interface CreateFamilyRequest {
  description: string | null
  name: string
  maxMembers: number
  monthlyCost: number
  paymentMethod: 'pix' | 'transfer'
  pixKey: string | null
  bankDetails: {
    bankName: string
    accountNumber: string
    agencyNumber: string
    accountType: 'corrente' | 'poupança'
  } | null
  id: string
  createdAt: Date
  updatedAt: Date
  ownerId: string
}

const createFamily = async (data: CreateFamilyRequest) => {
  const result = await api.post<void>('family', {
    json: data,
  })

  return { result }
}

export { createFamily }
