'use client'
import { useQuery } from '@tanstack/react-query'
import { Bell, Loader2 } from 'lucide-react'

import { getInvites } from '@/http/get-invites'

import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

const InvitesButton = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['invites'],
    queryFn: getInvites,
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="secondary"
          disabled={isLoading || !data || data.result.invites.length === 0}
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <Bell />}
          Convites ({data?.result.invites.length || 0})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end"></DropdownMenuContent>
    </DropdownMenu>
  )
}

export { InvitesButton }
