import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { ReactNode } from 'react'
import { Separator } from '@/components/ui/separator'
import { DynamicBreadcrumb } from '@/components/sidebar/dynamic-breadcrumb'

export default function FloatingSidebar({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className='h-[calc(100vh-1rem)] overflow-hidden'>
        <header className='flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
          <div className='flex items-center gap-2 px-4'>
            <SidebarTrigger className='-ml-1 sm:hidden' />
            <Separator orientation='vertical' className='mr-2 h-4' />
            <DynamicBreadcrumb />
          </div>
        </header>
        <div className='h-[calc(100vh-4rem)] overflow-y-auto scrollbar-none'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
