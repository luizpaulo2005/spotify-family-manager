import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  getPaymentHistory,
  type PaymentHistoryItem,
} from '@/http/get-payment-history'
import { dayjs } from '@/lib/dayjs'

interface PaymentHistoryProps {
  familyId?: string
}

export function PaymentHistory({ familyId }: PaymentHistoryProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 10

  const {
    data: paymentHistory,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['payment-history', familyId, currentPage],
    queryFn: () =>
      getPaymentHistory({
        familyId,
        limit: pageSize,
        offset: currentPage * pageSize,
      }),
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Carregando...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-destructive">
              Erro ao carregar histórico de pagamentos
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const payments = paymentHistory?.payments || []
  const total = paymentHistory?.total || 0
  const totalPages = Math.ceil(total / pageSize)

  const getStatusColor = (status: PaymentHistoryItem['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'reversed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getStatusText = (status: PaymentHistoryItem['status']) => {
    switch (status) {
      case 'paid':
        return 'Pago'
      case 'pending':
        return 'Pendente'
      case 'reversed':
        return 'Estornado'
      default:
        return status
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Pagamentos</CardTitle>
        {total > 0 && (
          <p className="text-muted-foreground text-sm">
            {total}{' '}
            {total === 1 ? 'pagamento encontrado' : 'pagamentos encontrados'}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-muted-foreground">
                Nenhum pagamento encontrado
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="font-medium">{payment.family.name}</h3>
                    <Badge className={getStatusColor(payment.status)}>
                      {getStatusText(payment.status)}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {dayjs(payment.createdAt).format('DD/MM/YYYY - HH:mm')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-medium">
                    R$ {payment.amount.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Anterior
                </Button>

                <span className="text-muted-foreground text-sm">
                  Página {currentPage + 1} de {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                  }
                  disabled={currentPage >= totalPages - 1}
                >
                  Próxima
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
