import { Card, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function StatusColumnSkeleton() {
  return (
    <div className='flex flex-col h-full min-w-[280px] max-w-[320px] shrink-0'>
      {/* Header Skeleton */}
      <div className='flex items-center justify-between gap-2 mb-3 px-3 py-2 bg-muted/50 rounded-lg'>
        <div className='flex items-center gap-2 flex-1'>
          <Skeleton className='h-4 w-4' />
          <Skeleton className='w-3 h-3 rounded-full' />
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-4 w-8' />
        </div>
        <div className='flex items-center gap-1'>
          <Skeleton className='h-7 w-7 rounded-md' />
          <Skeleton className='h-7 w-7 rounded-md' />
        </div>
      </div>

      {/* Tasks Skeleton */}
      <div className='flex-1 rounded-lg border-2 border-dashed border-transparent bg-muted/20 p-2 space-y-2'>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className='p-3'>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-3 w-3/4' />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function BoardSkeleton() {
  return (
    <div className='flex gap-4 h-full pb-4'>
      {[1, 2, 3, 4].map((i) => (
        <StatusColumnSkeleton key={i} />
      ))}
    </div>
  )
}
