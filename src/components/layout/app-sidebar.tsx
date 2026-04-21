import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar'
import { AppTitle } from './app-title'
import { NavGroup } from './nav-group'
// import { NavUser } from './nav-user'

import {
  Construction,
  LayoutDashboard,
  Monitor,
  Bug,
  ListTodo,
  FileX,
  HelpCircle,
  Lock,
  Bell,
  Package,
  Palette,
  ServerOff,
  Settings,
  Wrench,
  UserCog,
  UserX,
  Users,
  Component,
  ShieldCheck,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  CodeXml
} from 'lucide-react'
import { type SidebarData } from './types'

export const iconMap = {
  ShieldCheck,
  Bug,
} as const

export const sidebarDatas: SidebarData = {
  navGroups: [
    {
      title: 'Danh mục sản phẩm',
      items: [
        {
          title: 'Auth',
          icon: 'ShieldCheck',
          items: [
            {
              title: 'Sign In',
              url: '/sign-in'
            }
          ]
        },
        {
          title: 'Errors',
          icon: 'Bug',
          items: [
            {
              title: 'Unauthorized',
              url: '/errors/unauthorized',
            }
          ]
        }
      ]
    }
  ]
}

export function AppSidebar({ sidebarData }: { sidebarData: SidebarData }) {
  return (
    <Sidebar collapsible='offcanvas' variant='floating'>
      {/* <SidebarHeader>
        <AppTitle />
      </SidebarHeader> */}
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>{/* <NavUser user={sidebarData.user} /> */}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
