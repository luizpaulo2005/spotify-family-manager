import { api } from './client'

interface ReversePaymentRequest {
  paymentId: string
}

const reversePayment = async ({ paymentId }: ReversePaymentRequest) => {
  await api.delete(`payments/${paymentId}`)
}

export { reversePayment }
