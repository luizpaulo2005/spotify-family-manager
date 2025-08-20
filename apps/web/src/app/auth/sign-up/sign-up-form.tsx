import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const SignUpForm = () => {
  return (
    <Card className="mx-auto w-full max-w-lg p-3">
      <h2 className="text-2xl font-semibold">Criar conta</h2>
      <div className="space-y-2">
        <Label>Nome</Label>
        <Input />
      </div>
      <div className="space-y-2">
        <Label>E-mail</Label>
        <Input />
      </div>
      <div className="space-y-2">
        <Label>Senha</Label>
        <Input type="password" />
      </div>
      <div className="space-y-2">
        <Label>Confirme sua senha</Label>
        <Input type="password" />
      </div>
      <div className="flex items-center justify-between gap-2">
        <Button className="flex-1" variant="secondary" asChild>
          <Link href="/auth/sign-in">Fazer login</Link>
        </Button>
        <Button className="flex-1">Criar conta</Button>
      </div>
    </Card>
  )
}

export { SignUpForm }
