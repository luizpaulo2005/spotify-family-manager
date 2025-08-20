import Link from 'next/link'

import { Button } from '@/components/ui/button'

const Page = () => {
  return (
    <div className="flex min-h-screen min-w-screen items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <p>Página não encontrada</p>
        <Button variant="link" asChild>
          <Link href="/">Voltar para a página inicial.</Link>
        </Button>
      </div>
    </div>
  )
}

export default Page
