'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, MoreVertical, Plus, Trash2 } from 'lucide-react'
import type { Status, Task } from '@/types/board'
import { Button } from '@/components/ui/button'
import { TaskCard } from './task-card'
import { cn } from '@/lib/utils'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface StatusColumnProps {
  status: Status
  tasks: Task[]
  onCreateTask: (statusId: string) => void
  onDeleteTask: (taskId: string) => void
  onDeleteStatus: (statusId: string) => void
}

export function StatusColumn({ status, tasks, onCreateTask, onDeleteTask, onDeleteStatus }: StatusColumnProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: status.id,
    data: {
      type: 'Status',
      status
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1
  }

  const taskIds = tasks.map((task) => task.id)

  return (
    <div ref={setNodeRef} style={style} className='flex flex-col h-full min-w-[280px] max-w-[320px] shrink-0'>
      {/* Header */}
      <div className='flex items-center justify-between gap-2 mb-3 px-3 py-2 bg-muted/50 rounded-lg'>
        <div className='flex items-center gap-2 flex-1 min-w-0'>
          <button className='cursor-grab touch-none' {...attributes} {...listeners}>
            <GripVertical className='h-4 w-4 text-muted-foreground' />
          </button>
          <div className={cn('w-3 h-3 rounded-full shrink-0', status.color)} />
          <h3 className='font-semibold text-sm truncate'>{status.title}</h3>
          <span className='text-xs text-muted-foreground shrink-0'>({tasks.length})</span>
        </div>
        <div className='flex items-center gap-1'>
          <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => onCreateTask(status.id)}>
            <Plus className='h-4 w-4' />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon' className='h-7 w-7'>
                <MoreVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem
                className='text-destructive focus:text-destructive'
                onClick={() => onDeleteStatus(status.id)}
              >
                <Trash2 className='h-4 w-4 mr-2' />
                Delete Status
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tasks */}
      <div
        className={cn(
          'flex-1 rounded-lg border-2 border-dashed p-2 space-y-2 overflow-y-auto scrollbar-none transition-colors',
          'border-transparent bg-muted/20'
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className='flex items-center justify-center h-full min-h-[200px] text-sm text-muted-foreground'>
              No tasks yet
            </div>
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} onDelete={onDeleteTask} />)
          )}
        </SortableContext>
      </div>
    </div>
  )
}
