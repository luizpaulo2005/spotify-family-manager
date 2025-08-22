'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { HTTPError } from 'ky'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authenticateWithPassword } from '@/http/authenticate-with-password'

const signInSchema = z.object({
  email: z.email({ error: 'Insira um e-mail válido.' }),
  password: z
    .string()
    .min(8, { message: 'A senha deve ter pelo menos 8 caracteres.' }),
})

type SignInFormProps = z.infer<typeof signInSchema>

const SignInForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignInFormProps>({
    resolver: zodResolver(signInSchema),
  })
  const router = useRouter()

  const handleLogin = async ({ email, password }: SignInFormProps) => {
    try {
      const result = await authenticateWithPassword({ email, password })

      console.log(result)

      toast.success('Login realizado com sucesso!')

      reset()
      router.replace('/')
    } catch (error) {
      if (error instanceof HTTPError) {
        const err = await error.response.json()

        return toast.error(`Erro ao realizar login. ${err.message}`)
      }
    }
  }

  return (
    <Card className="mx-auto w-full max-w-lg p-3">
      <h2 className="text-2xl font-semibold">Entrar</h2>
      <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" type="password" {...register('password')} />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <Button className="flex-1" variant="secondary" type="button" asChild>
            <Link href="/auth/sign-up">Criar conta</Link>
          </Button>
          <Button className="flex-1" type="submit">
            Entrar
          </Button>
        </div>
      </form>
    </Card>
  )
}

export { SignInForm }
