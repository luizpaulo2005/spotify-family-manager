'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { updateFamily } from '@/http/update-family'

const updateFamilySchema = z
  .object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    description: z.string().optional(),
    maxMembers: z.number().min(2).max(6),
    monthlyCost: z.number().min(0.01, 'Custo deve ser maior que zero'),
    dueDay: z.number().min(1).max(31),
    paymentMethod: z.enum(['pix', 'transfer']),
    pixKey: z.string().optional(),
    bankName: z.string().optional(),
    accountNumber: z.string().optional(),
    agencyNumber: z.string().optional(),
    accountType: z.enum(['corrente', 'poupança']).optional(),
  })
  .refine(
    (data) => {
      if (data.paymentMethod === 'pix') {
        return !!data.pixKey && data.pixKey.length > 0
      }
      return true
    },
    {
      message: 'Chave PIX é obrigatória quando o método é PIX',
      path: ['pixKey'],
    },
  )
  .refine(
    (data) => {
      if (data.paymentMethod === 'transfer') {
        return !!(
          data.bankName &&
          data.accountNumber &&
          data.agencyNumber &&
          data.accountType
        )
      }
      return true
    },
    {
      message:
        'Dados bancários são obrigatórios quando o método é transferência',
      path: ['bankName'],
    },
  )

type UpdateFamilyData = z.infer<typeof updateFamilySchema>

interface EditFamilyDialogProps {
  family: {
    id: string
    name: string
    description: string | null
    maxMembers: number
    monthlyCost: number
    dueDay: number
    paymentMethod: 'pix' | 'transfer'
    pixKey: string | null
    bankDetails: {
      bankName: string
      accountNumber: string
      agencyNumber: string
      accountType: 'corrente' | 'poupança'
    } | null
  }
}

export function EditFamilyDialog({ family }: EditFamilyDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateFamilyData>({
    resolver: zodResolver(updateFamilySchema),
    defaultValues: {
      name: family.name,
      description: family.description || '',
      maxMembers: family.maxMembers,
      monthlyCost: family.monthlyCost,
      dueDay: family.dueDay,
      paymentMethod: family.paymentMethod,
      pixKey: family.pixKey || '',
      bankName: family.bankDetails?.bankName || '',
      accountNumber: family.bankDetails?.accountNumber || '',
      agencyNumber: family.bankDetails?.agencyNumber || '',
      accountType: family.bankDetails?.accountType || 'corrente',
    },
  })

  const paymentMethod = watch('paymentMethod')

  const updateFamilyMutation = useMutation({
    mutationFn: updateFamily,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] })
      setOpen(false)
      toast.success('Família atualizada com sucesso!')
    },
    onError: (error) => {
      console.error('Erro ao atualizar família:', error)
      toast.error('Erro ao atualizar família', {
        description: 'Tente novamente em alguns momentos.',
      })
    },
  })

  const onSubmit = (data: UpdateFamilyData) => {
    const { bankName, accountNumber, agencyNumber, accountType, ...rest } = data

    updateFamilyMutation.mutate({
      familyId: family.id,
      ...rest,
      bankDetails:
        paymentMethod === 'transfer'
          ? {
              bankName: bankName!,
              accountNumber: accountNumber!,
              agencyNumber: agencyNumber!,
              accountType: accountType!,
            }
          : undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Família</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Família</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Nome da família"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxMembers">Máximo de Membros</Label>
              <Input
                id="maxMembers"
                type="number"
                min="2"
                max="6"
                {...register('maxMembers', { valueAsNumber: true })}
              />
              {errors.maxMembers && (
                <p className="text-sm text-red-500">
                  {errors.maxMembers.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descrição da família"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyCost">Custo Mensal (R$)</Label>
              <Input
                id="monthlyCost"
                type="number"
                step="0.01"
                min="0.01"
                {...register('monthlyCost', { valueAsNumber: true })}
              />
              {errors.monthlyCost && (
                <p className="text-sm text-red-500">
                  {errors.monthlyCost.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDay">Dia do Vencimento</Label>
              <Input
                id="dueDay"
                type="number"
                min="1"
                max="31"
                {...register('dueDay', { valueAsNumber: true })}
              />
              {errors.dueDay && (
                <p className="text-sm text-red-500">{errors.dueDay.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Método de Pagamento</Label>
            <Select
              value={paymentMethod}
              onValueChange={(value: 'pix' | 'transfer') =>
                setValue('paymentMethod', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="transfer">Transferência Bancária</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentMethod === 'pix' && (
            <div className="space-y-2">
              <Label htmlFor="pixKey">Chave PIX</Label>
              <Input
                id="pixKey"
                {...register('pixKey')}
                placeholder="Digite sua chave PIX"
              />
              {errors.pixKey && (
                <p className="text-sm text-red-500">{errors.pixKey.message}</p>
              )}
            </div>
          )}

          {paymentMethod === 'transfer' && (
            <div className="space-y-4 rounded-lg border p-4">
              <h4 className="font-medium">Dados Bancários</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Nome do Banco</Label>
                  <Input
                    id="bankName"
                    {...register('bankName')}
                    placeholder="Ex: Banco do Brasil"
                  />
                  {errors.bankName && (
                    <p className="text-sm text-red-500">
                      {errors.bankName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountType">Tipo de Conta</Label>
                  <Select
                    value={watch('accountType')}
                    onValueChange={(value: 'corrente' | 'poupança') =>
                      setValue('accountType', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corrente">Conta Corrente</SelectItem>
                      <SelectItem value="poupança">Conta Poupança</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agencyNumber">Agência</Label>
                  <Input
                    id="agencyNumber"
                    {...register('agencyNumber')}
                    placeholder="0000"
                  />
                  {errors.agencyNumber && (
                    <p className="text-sm text-red-500">
                      {errors.agencyNumber.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Número da Conta</Label>
                  <Input
                    id="accountNumber"
                    {...register('accountNumber')}
                    placeholder="00000-0"
                  />
                  {errors.accountNumber && (
                    <p className="text-sm text-red-500">
                      {errors.accountNumber.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={updateFamilyMutation.isPending}>
              {updateFamilyMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
