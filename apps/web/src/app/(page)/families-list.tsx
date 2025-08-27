'use client'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

import { getUserFamilies } from '@/http/get-families'

const FamiliesList = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['families'],
    queryFn: getUserFamilies,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    )
  }

  if (!data || data.result.families.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
        <p className="text-center">Nenhuma família encontrada</p>
      </div>
    )
  }

  const { families } = data.result

  return (
    <div>
      {families.map((family) => (
        <div key={family.id}>{family.name}</div>
      ))}
    </div>
  )
}

export { FamiliesList }
