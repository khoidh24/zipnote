'use client'

import { Sidebar, SidebarContent } from '@/components/ui/sidebar'
import { NavFooter } from '@/components/sidebar/nav-footer'
import { NavHeader } from '@/components/sidebar/nav-header'
import { NavMain } from '@/components/sidebar/nav-main'
import { menuItems, userData } from '@/config/menu'
import type { SidebarData } from './types'

const data: SidebarData = {
  user: userData,
  navMain: menuItems
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant='inset' collapsible='icon' {...props}>
      <NavHeader data={data} />
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavCollapsible
          favorites={data.navCollapsible.favorites}
          teams={data.navCollapsible.teams}
          topics={data.navCollapsible.topics}
        /> */}
      </SidebarContent>
      <NavFooter user={data.user} />
    </Sidebar>
  )
}
