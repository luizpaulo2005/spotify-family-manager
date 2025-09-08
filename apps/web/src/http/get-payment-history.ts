import { api } from './client'

interface GetPaymentHistoryRequest {
  familyId?: string
  limit?: number
  offset?: number
}

interface PaymentHistoryItem {
  id: string
  amount: number
  status: 'pending' | 'paid' | 'reversed'
  createdAt: Date
  family: {
    id: string
    name: string
  }
}

interface GetPaymentHistoryResponse {
  payments: PaymentHistoryItem[]
  total: number
}

const getPaymentHistory = async ({
  familyId,
  limit = 50,
  offset = 0,
}: GetPaymentHistoryRequest = {}) => {
  const searchParams = new URLSearchParams()

  if (familyId) searchParams.append('familyId', familyId)
  searchParams.append('limit', limit.toString())
  searchParams.append('offset', offset.toString())

  const result = await api
    .get(`payments/history?${searchParams.toString()}`)
    .json<GetPaymentHistoryResponse>()

  return result
}

export { getPaymentHistory }
export type { PaymentHistoryItem }
