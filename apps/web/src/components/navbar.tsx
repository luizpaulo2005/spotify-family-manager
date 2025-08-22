import { Plus } from 'lucide-react'

import { InvitesButton } from './invites-button'
import { UserButton } from './profile-button'
import { ToggleTheme } from './toggle-theme'
import { Button } from './ui/button'

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between py-4">
      <h1 className="text-2xl font-bold">Spotify Family Manager</h1>
      <div className="flex items-center gap-2">
        <ToggleTheme />
        <InvitesButton />
        <Button size="sm" variant="secondary">
          <Plus />
          Nova família
        </Button>
        <UserButton />
      </div>
    </nav>
  )
}

export { Navbar }
