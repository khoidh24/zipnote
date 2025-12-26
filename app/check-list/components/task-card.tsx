'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MoreVertical, Trash2 } from 'lucide-react'
import type { Task } from '@/types/board'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface TaskCardProps {
  task: Task
  onDelete: (taskId: string) => void
}

export function TaskCard({ task, onDelete }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform duration-200 ease-in-out',
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className='cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow'>
        <CardHeader className='p-3'>
          <div className='flex items-start justify-between gap-2'>
            <div className='flex-1 min-w-0'>
              <CardTitle className='text-sm font-medium leading-tight'>{task.title}</CardTitle>
              {task.description && (
                <CardDescription className='text-xs mt-1.5 line-clamp-3'>{task.description}</CardDescription>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-6 w-6 shrink-0'
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <MoreVertical className='h-3.5 w-3.5' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem
                  className='text-destructive focus:text-destructive'
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(task.id)
                  }}
                >
                  <Trash2 className='h-4 w-4 mr-2' />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}
