'use client'

import { AppProgressProvider } from '@bprogress/next'

interface ProgressProviderProps {
  children: React.ReactNode
}

const ProgressProvider = ({ children }: ProgressProviderProps) => {
  return (
    <AppProgressProvider
      height="4px"
      color="var(--primary)"
      options={{ showSpinner: false }}
      shallowRouting
    >
      {children}
    </AppProgressProvider>
  )
}

export { ProgressProvider }
