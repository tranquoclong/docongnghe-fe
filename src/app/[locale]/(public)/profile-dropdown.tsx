'use client'

import { useAppStore } from '@/components/app-provider'
import { Link } from '@/i18n/routing'
import { ProfileDropdown } from '@/components/profile-dropdown'

export default function ProfileLoginDropdown() {
  const role = useAppStore((state) => state.role)
  return (
    <>
      {role ? (
        <ProfileDropdown role={role} />
      ) : (
        <Link href='/login' className='text-muted-foreground transition-colors hover:text-foreground'>
          Login
        </Link>
      )}
    </>
  )
}
