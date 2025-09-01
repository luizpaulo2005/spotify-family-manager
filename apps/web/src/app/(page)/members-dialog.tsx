import { DialogDescription } from '@radix-ui/react-dialog'
import { Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface FamilyMembersProps {
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
}

const MembersDialog = ({ currentMember, members }: FamilyMembersProps) => {
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
      </DialogContent>
    </Dialog>
  )
}

export { MembersDialog }
