'use client'

import { CreditCard, Users } from 'lucide-react'

import { PaymentHistory } from '@/components/payment-history'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { FamiliesList } from './families-list'

const Page = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Spotify Family Manager</h1>
        <p className="text-muted-foreground text-lg">
          Gerencie suas famílias e pagamentos do Spotify
        </p>
      </div>

      <Tabs defaultValue="families" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="families" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Minhas Famílias
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Meus Pagamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="families" className="mt-6">
          <FamiliesList />
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <PaymentHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Page
