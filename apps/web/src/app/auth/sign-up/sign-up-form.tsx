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
import { createAccount } from '@/http/create-account'

const signUpSchema = z
  .object({
    name: z.string().nonempty({ message: 'O nome é obrigatório.' }),
    email: z.email({ message: 'Insira um e-mail válido.' }),
    password: z
      .string()
      .min(8, { message: 'A senha deve ter pelo menos 8 caracteres.' }),
    confirmPassword: z
      .string()
      .min(8, { message: 'A confirmação de senha é obrigatória.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })

type SignUpFormProps = z.infer<typeof signUpSchema>

const SignUpForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignUpFormProps>({
    resolver: zodResolver(signUpSchema),
  })
  const router = useRouter()

  const handleCreateAccount = async ({
    name,
    email,
    password,
  }: SignUpFormProps) => {
    try {
      await createAccount({ name, email, password })

      toast.success('Conta criada com sucesso!')

      reset()
      router.replace('/auth/sign-in')
    } catch (error) {
      if (error instanceof HTTPError) {
        const err = await error.response.json()

        return toast.error(`Erro ao criar conta. ${err.message}`)
      }

      toast.error('Erro inesperado ao criar conta.')
    }
  }

  return (
    <Card className="mx-auto w-full max-w-lg p-3">
      <h2 className="text-2xl font-semibold">Criar conta</h2>
      <form onSubmit={handleSubmit(handleCreateAccount)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" {...register('name')} />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>
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
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirme sua senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <Button className="flex-1" variant="secondary" type="button" asChild>
            <Link href="/auth/sign-in">Fazer login</Link>
          </Button>
          <Button className="flex-1" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Criando...' : 'Criar conta'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export { SignUpForm }
