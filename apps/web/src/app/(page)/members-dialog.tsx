import { DialogDescription } from '@radix-ui/react-dialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CreditCard, Ellipsis, Plus, Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createInvite } from '@/http/create-invite'
import { dayjs } from '@/lib/dayjs'

import { MemberOptions } from './member-options'

interface FamilyMembersProps {
  familyId: string
  currentMember: {
    id: string
    role: 'member' | 'admin'
    joinedAt: Date
    user: {
      id: string
      email: string
      name: string
      avatarUrl: string | null
    }
    payments: {
      id: string
      amount: number
      memberId: string
      createdAt: Date
    }[]
  }
  members: Array<{
    id: string
    role: 'member' | 'admin'
    joinedAt: Date
    user: {
      id: string
      email: string
      name: string
      avatarUrl: string | null
    }
    payments: {
      id: string
      amount: number
      memberId: string
      createdAt: Date
    }[]
  }>
  invites: Array<{
    id: string
    email: string
    createdAt: Date
    expiresAt: Date
  }>
}

const MembersDialog = ({
  familyId,
  currentMember,
  members,
  invites,
}: FamilyMembersProps) => {
  const [email, setEmail] = useState('')
  const queryClient = useQueryClient()

  const createInviteMutation = useMutation({
    mutationFn: createInvite,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['families'] })
      setEmail('')
      toast.success('Convite criado com sucesso!', {
        description: `Convite enviado para ${variables.email}`,
      })
    },
    onError: (error) => {
      console.error('Erro ao criar convite:', error)
      toast.error('Erro ao criar convite', {
        description: 'Tente novamente em alguns momentos.',
      })
    },
  })

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    createInviteMutation.mutate({
      email: email.trim(),
      familyId,
    })
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full bg-transparent sm:w-auto"
        >
          <Users className="mr-2 size-4" />
          Gerenciar Membros
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerenciar Membros</DialogTitle>
          <DialogDescription>
            Aqui você pode gerenciar os membros da sua família.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="members">
          <TabsList className="w-full">
            <TabsTrigger value="members">Membros</TabsTrigger>
            <TabsTrigger value="invites">
              Convites ({invites.length})
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="mr-1 h-4 w-4" />
              Pagamentos
            </TabsTrigger>
          </TabsList>
          <TabsContent value="members" className="space-y-2">
            {members.map((member) => {
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between border-b py-2"
                >
                  <div className="flex flex-col">
                    <h3 className="text-md">
                      {member.user.name} (
                      {member.role === 'admin' ? 'Administrador' : 'Membro'})
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      {member.user.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-muted-foreground text-xs">
                      Entrou {dayjs().to(member.joinedAt)}
                    </p>
                    <MemberOptions
                      currentMember={currentMember}
                      member={member}
                    />
                  </div>
                </div>
              )
            })}
          </TabsContent>
          <TabsContent value="invites" className="space-y-4">
            {/* Formulário para criar novo convite */}
            <div className="border-b pb-4">
              <h4 className="mb-2 text-sm font-medium">Criar novo convite</h4>
              <form onSubmit={handleCreateInvite} className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="email" className="sr-only">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Digite o email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={createInviteMutation.isPending}
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!email.trim() || createInviteMutation.isPending}
                >
                  <Plus className="mr-2 size-4" />
                  {createInviteMutation.isPending ? 'Enviando...' : 'Convidar'}
                </Button>
              </form>
            </div>

            {/* Lista de convites pendentes */}
            {invites.length === 0 && (
              <p className="text-muted-foreground text-center text-sm">
                Nenhum convite pendente
              </p>
            )}
            {invites.map((invite) => {
              return (
                <div
                  key={invite.id}
                  className="flex items-center justify-between border-b py-2"
                >
                  <div className="flex flex-col">
                    <h3 className="text-xl">{invite.email}</h3>
                    <p className="text-muted-foreground text-sm">
                      Criado {dayjs().to(invite.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-muted-foreground text-sm">
                      Expira {dayjs().to(invite.expiresAt)}
                    </p>
                    <Button size="icon" variant="secondary">
                      <Ellipsis />
                    </Button>
                  </div>
                </div>
              )
            })}
          </TabsContent>
          <TabsContent value="payments" className="space-y-4">
            {(() => {
              // Agregar todos os pagamentos de todos os membros
              const allPayments = members.flatMap((member) =>
                member.payments.map((payment) => ({
                  ...payment,
                  memberName: member.user.name,
                  memberEmail: member.user.email,
                })),
              )

              // Ordenar por data (mais recente primeiro)
              const sortedPayments = allPayments.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )

              if (sortedPayments.length === 0) {
                return (
                  <div className="py-8 text-center">
                    <CreditCard className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                    <p className="text-muted-foreground">
                      Nenhum pagamento realizado ainda
                    </p>
                  </div>
                )
              }

              return (
                <div className="space-y-3">
                  <h4 className="mb-3 text-sm font-medium">
                    Histórico de Pagamentos ({sortedPayments.length})
                  </h4>

                  {sortedPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h5 className="font-medium">{payment.memberName}</h5>
                          <Badge variant="secondary" className="text-xs">
                            Pago
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {payment.memberEmail}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {dayjs(payment.createdAt).format(
                            'DD/MM/YYYY - HH:mm',
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          R$ {payment.amount.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export { MembersDialog }
