'use client'

import { Link, usePathname } from '@/i18n/routing'
import { cn } from '@/lib/utils'
// import { ScrollArea } from '@/components/ui/scroll-area'
import { UserPen, UserKey, AtSign, Settings } from 'lucide-react'

const Array = [
  {
    href: '/client/setting/profile',
    name: 'Profile',
    icon: <UserPen />
  },
  {
    href: '/client/setting/change-password',
    name: 'Change Password',
    icon: <UserKey />
  },
  {
    href: '/client/setting/email',
    name: 'Email',
    icon: <AtSign />
  },
  {
    href: '/client/setting/account',
    name: 'Account',
    icon: <Settings />
  }
]
export default function SettingNav() {
  const pathname = usePathname()
  return (
    <div className='z-0 h-[calc(100vh_-_66px)] mr-4 sticky top-10 pt-7 pb-4 hidden xl:block'>
      <h2 className='mb-2 px-4 text-lg font-semibold'>Settings</h2>
      <div className='w-[200px] flex flex-col h-full'>
        <div className='relative h-full overflow-hidden'>
          <nav className='h-full overflow-auto space-y-1 border-r-2 border-dark-600/80 min-h-[700px]'>
            {Array.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  item.href === pathname && 'bg-accent text-accent-foreground',
                  'hover:bg-accent hover:text-accent-foreground transition-colors tracking-wide flex items-center gap-2 font-normal text-sm px-4 pl-3 mb-1 mr-3 py-2.5 rounded-lg tab--elements'
                )}
              >
                <div className='flex items-center gap-2 '>
                  {item.icon}
                  {item.name}
                </div>
              </Link>
            ))}
          </nav>
        </div>
        <div className='flex-shrink-0 h-[240px] pt-2 pb-2 mb-2' />
      </div>
    </div>
  )
}
