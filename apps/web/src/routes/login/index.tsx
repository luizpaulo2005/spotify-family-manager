import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const Route = createFileRoute('/login/')({
  component: Page,
})

const loginSchema = z.object({
  email: z.email({ error: 'E-mail inválido' }),
  password: z
    .string()
    .min(8, { error: 'Senha deve ter pelo menos 8 caracteres' })
    .max(64, { error: 'Senha deve ter no máximo 64 caracteres' }),
})

type LoginForm = z.infer<typeof loginSchema>

function Page() {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const handleLogin = (data: LoginForm) => {
    console.log(data)
  }

  return (
    <Card className="mx-auto w-full max-w-xl self-center p-4">
      <h2 className="text-3xl font-bold">Login</h2>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" {...register('email')} />
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
        <div className="flex items-center gap-2 mt-4">
          <Button className="flex-1" variant="secondary">
            Registrar
          </Button>
          <Button className="flex-1" onClick={handleSubmit(handleLogin)}>
            Entrar
          </Button>
        </div>
      </div>
    </Card>
  )
}
