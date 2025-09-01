import { api } from './client'

interface CreateFamilyRequest {
  description: string | null
  name: string
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
}

const createFamily = async (data: CreateFamilyRequest) => {
  const result = await api.post<void>('family', {
    json: data,
  })

  return { result }
}

export { createFamily }
