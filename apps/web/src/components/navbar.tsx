import { CreateFamily } from './create-family'
import { InvitesButton } from './invites-button'
import { UserButton } from './profile-button'
import { ToggleTheme } from './toggle-theme'

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between py-4">
      <h1 className="hidden text-2xl font-bold md:block">
        Spotify Family Manager
      </h1>
      <div className="flex items-center justify-between gap-2 md:justify-end">
        <ToggleTheme />
        <InvitesButton />
        <CreateFamily />
        <UserButton />
      </div>
    </nav>
  )
}

export { Navbar }
