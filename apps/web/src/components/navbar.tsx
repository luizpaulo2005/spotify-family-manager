import { CreateFamily } from './create-family'
import { InvitesButton } from './invites-button'
import { UserButton } from './profile-button'
import { ToggleTheme } from './toggle-theme'

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between py-4">
      <h1 className="text-2xl font-bold">Spotify Family Manager</h1>
      <div className="flex items-center gap-2">
        <ToggleTheme />
        <InvitesButton />
        <CreateFamily />
        <UserButton />
      </div>
    </nav>
  )
}

export { Navbar }
