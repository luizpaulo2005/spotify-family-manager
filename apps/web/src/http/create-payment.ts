import { api } from './client'

interface CreatePaymentRequest {
  familyId: string
  amount: number
}

interface CreatePaymentResponse {
  paymentId: string
}

const createPayment = async ({ familyId, amount }: CreatePaymentRequest) => {
  const result = await api
    .post('payments', {
      json: {
        familyId,
        amount,
      },
    })
    .json<CreatePaymentResponse>()

  return result
}

export { createPayment }
