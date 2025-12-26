export interface Task {
  id: string
  title: string
  description?: string
  statusId: string
  order: number
  createdAt: Date
  updatedAt: Date
  linkedNoteIds: string[]
  estimatedTime?: number
  actualTime?: number
  logWork: WorkLog[]
}

export interface WorkLog {
  id: string
  timeSpent: number
  comment?: string
  createdAt: Date
}

export interface Status {
  id: string
  title: string
  color: string
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface Board {
  statuses: Status[]
  tasks: Task[]
}
