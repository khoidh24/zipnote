import { LayoutDashboard, ListChecks, Logs, Notebook } from 'lucide-react'
import type { ElementType } from 'react'

export const routeLabels: Record<string, string> = {
  '': 'Insights',
  tasks: 'Tasks',
  meetings: 'Meetings',
  notes: 'Notes',
  calendar: 'Calendar',
  completed: 'Completed',
  notifications: 'Notifications'
}

export interface MenuItem {
  id: string
  title: string
  url: string
  icon: ElementType
}

export const menuItems: MenuItem[] = [
  {
    id: 'overview',
    title: 'Overview',
    url: '/',
    icon: LayoutDashboard
  },
  {
    id: 'notes',
    title: 'Notes',
    url: '/notes',
    icon: Notebook
  },
  {
    id: 'tasks',
    title: 'Tasks',
    url: '/tasks',
    icon: Logs
  },
  {
    id: 'check-list',
    title: 'Check List',
    url: '/check-list',
    icon: ListChecks
  }
]

export const userData = {
  name: 'ephraim',
  email: 'ephraim@blocks.so',
  avatar: '/avatar-01.png'
}
