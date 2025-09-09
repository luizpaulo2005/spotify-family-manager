'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'

import { authenticateWithPassword } from '@/http/authenticate-with-password'

const signInSchema = z.object({
  email: z.email({ error: 'Insira um e-mail válido.' }),
  password: z
    .string()
    .min(8, { message: 'A senha deve ter pelo menos 8 caracteres.' }),
})

type SignInProps = z.infer<typeof signInSchema>

const authenticateWithPasswordAction = async (data: SignInProps) => {
  try {
    const { token } = await authenticateWithPassword(data)

    const cookieStore = await cookies()

    cookieStore.set('token', token, {
      //   httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return true
  } catch (error) {
    console.error('Error during authentication:', error)
    return false
  }
}

export { authenticateWithPasswordAction }
