'use client'
import { useQuery } from '@tanstack/react-query'
import { Loader2, LogOut } from 'lucide-react'

import { getProfile } from '@/http/get-profile'

import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

const UserButton = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  })

  if (isLoading) {
    return (
      <Button size="sm" variant="secondary" disabled>
        <Loader2 className="animate-spin" />
      </Button>
    )
  }

  if (!data) {
    return null
  }

  const { user } = data.result

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="secondary">
          {user.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <form action="/api/auth/sign-out" method="GET">
          <DropdownMenuItem asChild>
            <button className="w-full" type="submit">
              <LogOut />
              Sair
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { UserButton }
