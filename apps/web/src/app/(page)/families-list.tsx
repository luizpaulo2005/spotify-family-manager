'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  Loader2,
  Undo2,
} from 'lucide-react'
import { toast } from 'sonner'

import { EditFamilyDialog } from '@/components/edit-family-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { createPayment } from '@/http/create-payment'
import { getUserFamilies } from '@/http/get-families'
import { reversePayment } from '@/http/reverse-payment'
import { dayjs } from '@/lib/dayjs'

import { MembersDialog } from './members-dialog'

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-green-500'
    case 'pending':
      return 'bg-yellow-500'
    case 'overdue':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'paid':
      return <CheckCircle className="size-4" />
    case 'pending':
      return <Clock className="size-4" />
    case 'overdue':
      return <AlertCircle className="size-4" />
    default:
      return null
  }
}

const FamiliesList = () => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['families'],
    queryFn: getUserFamilies,
  })

  const paymentMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['families'] })
      toast.success('Pagamento realizado com sucesso!', {
        description: `Pagamento de ${variables.amount.toLocaleString('pt-br', {
          style: 'currency',
          currency: 'BRL',
        })} processado e registrado.`,
      })
    },
    onError: (error) => {
      console.error('Erro ao processar pagamento:', error)
      toast.error('Erro ao processar pagamento', {
        description: 'Tente novamente em alguns momentos.',
      })
    },
  })

  const reversePaymentMutation = useMutation({
    mutationFn: reversePayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] })
      toast.success('Pagamento estornado com sucesso!', {
        description: 'O valor foi estornado e você pode pagar novamente.',
      })
    },
    onError: (error) => {
      console.error('Erro ao estornar pagamento:', error)
      toast.error('Erro ao estornar pagamento', {
        description: 'Verifique se o pagamento pode ser estornado.',
      })
    },
  })

  const handlePayment = (familyId: string, amount: number) => {
    paymentMutation.mutate({
      familyId,
      amount,
    })
  }

  const handleReversePayment = (paymentId: string) => {
    reversePaymentMutation.mutate({
      paymentId,
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    )
  }

  if (!data || data.result.families.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
        <p className="text-center">Nenhuma família encontrada</p>
      </div>
    )
  }

  const { userId, families } = data.result

  return (
    <div className="space-y-2">
      {families.map((family) => {
        const currentMember = family.members.find(
          (member) => member.user.id === userId,
        )
        const userRole = currentMember?.role ?? 'member'
        const userShare = family.monthlyCost / family.members.length

        const today = dayjs()
        const dueDate = dayjs().date(family.dueDay)

        const hasPaidThisMonth = currentMember?.payments.some(
          (payment) =>
            dayjs(payment.createdAt).isSame(today, 'month') &&
            dayjs(payment.createdAt).isSame(today, 'year'),
        )

        // Verificar se existe um pagamento que pode ser estornado (últimos 7 dias)
        const recentPayment = currentMember?.payments.find(
          (payment) =>
            dayjs(payment.createdAt).isSame(today, 'month') &&
            dayjs(payment.createdAt).isSame(today, 'year') &&
            dayjs().diff(dayjs(payment.createdAt), 'day') <= 7,
        )

        const canReversePayment = recentPayment && hasPaidThisMonth

        let paymentStatus: 'paid' | 'pending' | 'overdue' = 'pending'

        if (hasPaidThisMonth) {
          paymentStatus = 'paid'
        } else if (today.isAfter(dueDate)) {
          paymentStatus = 'overdue'
        } else {
          paymentStatus = 'pending'
        }

        return (
          <Card key={family.id}>
            <CardHeader className="pb-3">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" />
                    <AvatarFallback>{family.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate text-base sm:text-lg">
                      {family.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {family.members.length}/{family.maxMembers} membros •
                      <Badge
                        variant={userRole === 'admin' ? 'default' : 'secondary'}
                        className="ml-2 text-xs"
                      >
                        {userRole === 'admin' ? 'Admin' : 'Membro'}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${getStatusColor(paymentStatus)}`}
                    />
                    {getStatusIcon(paymentStatus)}
                    <span className="text-sm font-medium">
                      {paymentStatus === 'paid'
                        ? 'Pago'
                        : paymentStatus === 'pending'
                          ? 'Pendente'
                          : 'Atrasado'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Vence em {dayjs().date(family.dueDay).format('DD/MM')}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-600">Total da Família</p>
                  <p className="text-lg font-bold text-green-600 sm:text-xl">
                    R$ {family.monthlyCost.toFixed(2)}
                  </p>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-600">Sua Parte</p>
                  <p className="text-lg font-bold sm:text-xl">
                    {(
                      family.monthlyCost / family.members.length
                    ).toLocaleString('pt-br', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-600">Ocupação</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Progress
                      value={(family.members.length / family.maxMembers) * 100}
                      className="flex-1"
                    />
                    <span className="text-sm whitespace-nowrap">
                      {family.members.length}/{family.maxMembers}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                {!hasPaidThisMonth && (
                  <Button
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => handlePayment(family.id, userShare)}
                    disabled={paymentMutation.isPending}
                  >
                    <CreditCard className="mr-2 size-4" />
                    {paymentMutation.isPending
                      ? 'Processando...'
                      : `Pagar ${userShare.toLocaleString('pt-br', {
                          style: 'currency',
                          currency: 'BRL',
                        })}`}
                  </Button>
                )}
                {canReversePayment && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => handleReversePayment(recentPayment!.id)}
                    disabled={reversePaymentMutation.isPending}
                  >
                    <Undo2 className="mr-2 size-4" />
                    {reversePaymentMutation.isPending
                      ? 'Estornando...'
                      : 'Estornar Pagamento'}
                  </Button>
                )}
                {userRole === 'admin' && (
                  <>
                    <EditFamilyDialog family={family} />
                    <MembersDialog
                      familyId={family.id}
                      currentMember={currentMember!}
                      members={family.members}
                      invites={family.invites}
                    />
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export { FamiliesList }
