import { z } from 'zod'

const bankDetailsSchema = z.object({
  bankName: z.string().nonempty(),
  accountNumber: z.string().nonempty(),
  agencyNumber: z.string().nonempty(),
  accountType: z.enum(['corrente', 'poupança']),
})

export { bankDetailsSchema }
