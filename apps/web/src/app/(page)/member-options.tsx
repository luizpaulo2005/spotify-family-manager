import { Ellipsis } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface MemberOptionsProps {
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
  member: {
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
}

const MemberOptions = ({ currentMember, member }: MemberOptionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="secondary">
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {currentMember.role === 'admin' && currentMember.id !== member.id && (
          <DropdownMenuItem>Promover a admin</DropdownMenuItem>
        )}
        {currentMember.role === 'admin' && currentMember.id !== member.id && (
          <DropdownMenuItem>Remover do plano</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { MemberOptions }
