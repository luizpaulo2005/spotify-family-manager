'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createFamily } from '@/http/create-family'

import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Slider } from './ui/slider'

const createFamilySchema = z.discriminatedUnion('paymentMethod', [
  z.object({
    paymentMethod: z.literal('pix', {
      error: 'Método de pagamento é obrigatório',
    }),
    name: z.string().nonempty({ message: 'Nome da família é obrigatório' }),
    description: z.string().nullable(),
    maxMembers: z.number().int().positive().min(2).max(10),
    monthlyCost: z.number().positive(),
    dueDay: z.coerce
      .number({ error: 'Dia de vencimento é obrigatório' })
      .min(1, { error: 'Dia de vencimento deve ser pelo menos 1' })
      .max(31, { error: 'Dia de vencimento deve ser no máximo 31' }),
    pixKey: z
      .string({ error: 'Chave Pix é obrigatória' })
      .nonempty({ error: 'Chave Pix é obrigatória' }),
    bankDetails: z.never().optional(),
  }),

  z.object({
    paymentMethod: z.literal('transfer', {
      error: 'Método de pagamento é obrigatório',
    }),
    name: z.string().nonempty({ message: 'Nome da família é obrigatório' }),
    description: z.string().nullable(),
    maxMembers: z.number().int().positive().min(2).max(10),
    monthlyCost: z.number().positive(),
    dueDay: z.coerce
      .number({ error: 'Dia de vencimento é obrigatório' })
      .min(1, { error: 'Dia de vencimento deve ser pelo menos 1' })
      .max(31, { error: 'Dia de vencimento deve ser no máximo 31' }),
    pixKey: z.undefined(),
    bankDetails: z.object({
      bankName: z.string().nonempty({ message: 'Banco é obrigatório' }),
      accountNumber: z
        .string()
        .nonempty({ message: 'Número da conta é obrigatório' }),
      agencyNumber: z.string().nonempty({ message: 'Agência é obrigatória' }),
      accountType: z.enum(['corrente', 'poupança'], {
        error: 'Tipo de conta é obrigatório',
      }),
    }),
  }),
])

type CreateFamilyInput = z.infer<typeof createFamilySchema>

const CreateFamily = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof createFamilySchema>>({
    // @ts-expect-error zod type conflict
    resolver: zodResolver(createFamilySchema),
  })

  const queryClient = useQueryClient()

  const handleCreateFamily = async (data: CreateFamilyInput) => {
    setIsLoading(true)

    try {
      // @ts-expect-error zod type conflict
      await createFamily(data)
      toast.success('Família criada com sucesso!', {
        description: `"${data.name}" foi criada e você é o administrador.`,
      })
      queryClient.invalidateQueries({ queryKey: ['families'] })
      setIsOpen(false)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao criar família', {
        description: 'Verifique os dados e tente novamente.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const paymentMethod = watch('paymentMethod')

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          <Plus />
          Nova família
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar nova família</DialogTitle>
          <DialogDescription>
            Crie uma nova família para gerenciar os membros.
          </DialogDescription>
        </DialogHeader>
        {/* @ts-expect-error zod type conflict */}
        <form onSubmit={handleSubmit(handleCreateFamily)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da família</Label>
            <Input id="name" {...register('name')} disabled={isLoading} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Input
              id="description"
              {...register('description')}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxMembers">Número de membros</Label>
            <Controller
              control={control}
              name="maxMembers"
              defaultValue={6}
              render={({ field }) => (
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Slider
                      id="maxMembers"
                      min={2}
                      max={10}
                      value={[field.value ?? 6]}
                      onValueChange={(vals: number[]) =>
                        field.onChange(vals[0])
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <div className="w-12 text-right">
                    <span className="text-sm font-medium">
                      {field.value ?? 6}
                    </span>
                  </div>
                </div>
              )}
            />
            {errors.maxMembers && (
              <p className="text-sm text-red-500">
                {errors.maxMembers.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Data de Vencimento</Label>
            <Controller
              control={control}
              name="dueDay"
              render={({ field }) => (
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value ? String(field.value) : undefined}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o dia de vencimento" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => (
                      <SelectItem key={i} value={String(i + 1)}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthlyCost">Custo mensal</Label>
            <Input
              id="monthlyCost"
              type="number"
              step={0.01}
              {...register('monthlyCost', { valueAsNumber: true })}
              disabled={isLoading}
            />
            {errors.monthlyCost && (
              <p className="text-sm text-red-500">
                {errors.monthlyCost.message}
              </p>
            )}
          </div>
          <Controller
            control={control}
            name="paymentMethod"
            render={({ field }) => (
              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transfer">
                      Transferência Bancária
                    </SelectItem>
                    <SelectItem value="pix">Pix</SelectItem>
                  </SelectContent>
                </Select>
                {errors.paymentMethod && (
                  <p className="text-sm text-red-500">
                    {errors.paymentMethod.message}
                  </p>
                )}
              </div>
            )}
          />
          {paymentMethod === 'pix' && (
            <Controller
              control={control}
              name="pixKey"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="pixKey">Chave Pix</Label>
                  <Input id="pixKey" {...field} disabled={isLoading} />
                  {errors.pixKey && (
                    <p className="text-sm text-red-500">
                      {errors.pixKey.message}
                    </p>
                  )}
                </div>
              )}
            />
          )}
          {paymentMethod === 'transfer' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Banco</Label>
                <Input
                  id="bankName"
                  {...register('bankDetails.bankName')}
                  disabled={isLoading}
                />
                {errors.bankDetails && 'bankName' in errors.bankDetails && (
                  <p className="text-sm text-red-500">
                    {errors.bankDetails.bankName?.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Número da Conta</Label>
                <Input
                  id="accountNumber"
                  {...register('bankDetails.accountNumber')}
                  disabled={isLoading}
                />
                {errors.bankDetails &&
                  'accountNumber' in errors.bankDetails && (
                    <p className="text-sm text-red-500">
                      {errors.bankDetails.accountNumber?.message}
                    </p>
                  )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="agencyNumber">Agência</Label>
                <Input
                  id="agencyNumber"
                  {...register('bankDetails.agencyNumber')}
                  disabled={isLoading}
                />
                {errors.bankDetails && 'agencyNumber' in errors.bankDetails && (
                  <p className="text-sm text-red-500">
                    {errors.bankDetails.agencyNumber?.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountType">Tipo de Conta</Label>
                <Controller
                  control={control}
                  name="bankDetails.accountType"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="accountType" className="w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="corrente">Corrente</SelectItem>
                        <SelectItem value="poupança">Poupança</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.bankDetails && 'accountType' in errors.bankDetails && (
                  <p className="text-sm text-red-500">
                    {errors.bankDetails.accountType?.message}
                  </p>
                )}
              </div>
            </div>
          )}

          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="animate-spin" />}
            Criar família
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { CreateFamily }
