'use client'
import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  Loader2,
  Users,
} from 'lucide-react'

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
import { getUserFamilies } from '@/http/get-families'
import { dayjs } from '@/lib/dayjs'

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
  const { data, isLoading } = useQuery({
    queryKey: ['families'],
    queryFn: getUserFamilies,
  })

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
                    // className={`h-2 w-2 rounded-full ${getStatusColor(family.paymentStatus)}`}
                    />
                    {/* {getStatusIcon(family.paymentStatus)} */}
                    <span className="text-sm font-medium">
                      {/* {family.paymentStatus === 'paid'
                      ? 'Pago'
                      : family.paymentStatus === 'pending'
                        ? 'Pendente'
                        : 'Atrasado'} */}
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
                    {/* R$ {family.userShare.toFixed(2)} */}
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
                {/* {family.paymentStatus !== 'paid' && (
                <Button
                  onClick={() => setPaymentOpen(true)}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <CreditCard className="mr-2 size-4" />
                  Pagar R$ {family.userShare.toFixed(2)}
                </Button>
              )}
              {family.userRole === 'admin' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent sm:w-auto"
                >
                  <Users className="mr-2 size-4" />
                  Gerenciar Membros
                </Button>
              )} */}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export { FamiliesList }
