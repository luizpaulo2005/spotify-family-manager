import { DialogDescription } from '@radix-ui/react-dialog'
import { Ellipsis, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { dayjs } from '@/lib/dayjs'

import { MemberOptions } from './member-options'

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
  invites: Array<{
    id: string
    email: string
    createdAt: Date
    expiresAt: Date
  }>
}

const MembersDialog = ({
  currentMember,
  members,
  invites,
}: FamilyMembersProps) => {
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
        <Tabs defaultValue="members">
          <TabsList className="w-full">
            <TabsTrigger value="members">Membros</TabsTrigger>
            <TabsTrigger value="invites">
              Convites ({invites.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="members" className="space-y-2">
            {members.map((member) => {
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between border-b py-2"
                >
                  <div className="flex flex-col">
                    <h3 className="text-md">
                      {member.user.name} (
                      {member.role === 'admin' ? 'Administrador' : 'Membro'})
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      {member.user.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-muted-foreground text-xs">
                      Entrou {dayjs().to(member.joinedAt)}
                    </p>
                    <MemberOptions
                      currentMember={currentMember}
                      member={member}
                    />
                  </div>
                </div>
              )
            })}
          </TabsContent>
          <TabsContent value="invites" className="space-y-2">
            {invites.length === 0 && (
              <p className="text-muted-foreground text-center text-sm">
                Nenhum convite pendente
              </p>
            )}
            {invites.map((invite) => {
              return (
                <div
                  key={invite.id}
                  className="flex items-center justify-between border-b py-2"
                >
                  <div className="flex flex-col">
                    <h3 className="text-xl">{invite.email}</h3>
                    <p className="text-muted-foreground text-sm">
                      Criado {dayjs().to(invite.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-muted-foreground text-sm">
                      Expira {dayjs().to(invite.expiresAt)}
                    </p>
                    <Button size="icon" variant="secondary">
                      <Ellipsis />
                    </Button>
                  </div>
                </div>
              )
            })}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export { MembersDialog }
