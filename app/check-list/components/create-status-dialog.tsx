'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { addStatus, getAllStatuses } from '@/lib/db'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const statusFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  color: z.string()
})

type StatusFormValues = z.infer<typeof statusFormSchema>

interface CreateStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusCreated: () => void
}

const COLORS = [
  { name: 'Slate', value: 'bg-slate-500' },
  { name: 'Gray', value: 'bg-gray-500' },
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Orange', value: 'bg-orange-500' },
  { name: 'Amber', value: 'bg-amber-500' },
  { name: 'Yellow', value: 'bg-yellow-500' },
  { name: 'Lime', value: 'bg-lime-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Emerald', value: 'bg-emerald-500' },
  { name: 'Teal', value: 'bg-teal-500' },
  { name: 'Cyan', value: 'bg-cyan-500' },
  { name: 'Sky', value: 'bg-sky-500' },
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Indigo', value: 'bg-indigo-500' },
  { name: 'Violet', value: 'bg-violet-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Fuchsia', value: 'bg-fuchsia-500' },
  { name: 'Pink', value: 'bg-pink-500' },
  { name: 'Rose', value: 'bg-rose-500' }
]

export function CreateStatusDialog({ open, onOpenChange, onStatusCreated }: CreateStatusDialogProps) {
  const form = useForm<StatusFormValues>({
    resolver: zodResolver(statusFormSchema),
    defaultValues: {
      title: '',
      color: COLORS[0].value
    }
  })

  const onSubmit = async (values: StatusFormValues) => {
    try {
      const statuses = await getAllStatuses()
      await addStatus({
        title: values.title,
        color: values.color,
        order: statuses.length
      })
      form.reset()
      onStatusCreated()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to create status:', error)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) form.reset()
      }}
    >
      <DialogContent className='sm:max-w-[425px]'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Create New Status</DialogTitle>
              <DialogDescription>Add a new status column to your board.</DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter status name...' {...field} autoFocus />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='color'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <div className='grid grid-cols-10 gap-2'>
                        {COLORS.map((color) => (
                          <button
                            key={color.value}
                            type='button'
                            onClick={() => field.onChange(color.value)}
                            className={`h-8 w-8 rounded-md ${color.value} ring-2 ring-offset-2 transition-all ${
                              field.value === color.value
                                ? 'ring-foreground scale-110'
                                : 'ring-transparent hover:scale-105'
                            }`}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Creating...' : 'Create Status'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
