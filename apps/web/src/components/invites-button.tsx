'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, Check, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

import { acceptInvite } from '@/http/accept-invite'
import { getInvites } from '@/http/get-invites'
import { rejectInvite } from '@/http/reject-invite'

import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

const InvitesButton = () => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['invites'],
    queryFn: getInvites,
  })

  const acceptInviteMutation = useMutation({
    mutationFn: acceptInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites'] })
      queryClient.invalidateQueries({ queryKey: ['families'] })
      toast.success('Convite aceito com sucesso!', {
        description: 'Você agora é membro da família.',
      })
    },
    onError: () => {
      toast.error('Erro ao aceitar convite', {
        description: 'Tente novamente em alguns momentos.',
      })
    },
  })

  const rejectInviteMutation = useMutation({
    mutationFn: rejectInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites'] })
      toast.success('Convite recusado', {
        description: 'O convite foi removido da sua lista.',
      })
    },
    onError: () => {
      toast.error('Erro ao recusar convite', {
        description: 'Tente novamente em alguns momentos.',
      })
    },
  })

  const handleAcceptInvite = (inviteId: string) => {
    acceptInviteMutation.mutate({ inviteId })
  }

  const handleRejectInvite = (inviteId: string) => {
    rejectInviteMutation.mutate({ inviteId })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="secondary"
          disabled={isLoading || !data || data.result.invites.length === 0}
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <Bell />}
          <p className="hidden md:block">Convites</p> (
          {data?.result.invites.length || 0})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {data?.result.invites.length === 0 ? (
          <DropdownMenuLabel className="text-center">
            Nenhum convite pendente
          </DropdownMenuLabel>
        ) : (
          <>
            <DropdownMenuLabel>Convites pendentes</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {data?.result.invites.map((invite) => (
                <div key={invite.id} className="p-2">
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">
                        {invite.family.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Convite de {invite.family.owner.name}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1"
                        onClick={() => handleAcceptInvite(invite.id)}
                        disabled={
                          acceptInviteMutation.isPending ||
                          rejectInviteMutation.isPending
                        }
                      >
                        {acceptInviteMutation.isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Check className="size-4" />
                        )}
                        Aceitar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleRejectInvite(invite.id)}
                        disabled={
                          acceptInviteMutation.isPending ||
                          rejectInviteMutation.isPending
                        }
                      >
                        {rejectInviteMutation.isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <X className="size-4" />
                        )}
                        Recusar
                      </Button>
                    </div>
                  </div>
                  {invite.id !==
                    data.result.invites[data.result.invites.length - 1].id && (
                    <DropdownMenuSeparator className="mt-2" />
                  )}
                </div>
              ))}
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { InvitesButton }
