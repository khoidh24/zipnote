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
import { Badge } from '@/components/ui/badge'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { getAllTags, addTag, deleteTag, updateTag } from '@/lib/tags-db'
import type { Tag } from '@/types/tag'
import { TAG_COLORS } from '@/types/tag'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Trash2, Plus, Pencil, X } from 'lucide-react'

const tagFormSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name is too long'),
  color: z.string()
})

type TagFormValues = z.infer<typeof tagFormSchema>

interface TagManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TagManagementDialog({ open, onOpenChange }: TagManagementDialogProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; tagId?: string; tagName?: string }>({
    open: false
  })

  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      name: '',
      color: TAG_COLORS[0].value
    }
  })

  const loadTags = async () => {
    try {
      const loadedTags = await getAllTags()
      setTags(loadedTags)
    } catch (error) {
      console.error('Failed to load tags:', error)
    }
  }

  useEffect(() => {
    if (open) {
      loadTags()
      setEditingTag(null)
      form.reset({
        name: '',
        color: TAG_COLORS[0].value
      })
    }
  }, [open, form])

  useEffect(() => {
    if (editingTag) {
      form.reset({
        name: editingTag.name,
        color: editingTag.color
      })
    } else {
      form.reset({
        name: '',
        color: TAG_COLORS[0].value
      })
    }
  }, [editingTag, form])

  const onSubmit = async (values: TagFormValues) => {
    try {
      if (editingTag) {
        await updateTag(editingTag.id, {
          name: values.name,
          color: values.color
        })
        setEditingTag(null)
      } else {
        await addTag({
          name: values.name,
          color: values.color
        })
      }
      form.reset({
        name: '',
        color: TAG_COLORS[0].value
      })
      await loadTags()
    } catch (error: any) {
      form.setError('name', { message: error.message || 'Failed to save tag' })
    }
  }

  const handleEditClick = (tag: Tag) => {
    setEditingTag(tag)
  }

  const handleCancelEdit = () => {
    setEditingTag(null)
  }

  const handleDeleteClick = (tag: Tag) => {
    setDeleteConfirm({ open: true, tagId: tag.id, tagName: tag.name })
  }

  const handleDeleteConfirm = async () => {
    if (deleteConfirm.tagId) {
      try {
        await deleteTag(deleteConfirm.tagId)
        if (editingTag?.id === deleteConfirm.tagId) {
          setEditingTag(null)
        }
        await loadTags()
        setDeleteConfirm({ open: false })
      } catch (error) {
        console.error('Failed to delete tag:', error)
      }
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
            <DialogDescription>Create and manage your tags for better organization.</DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            {/* Create/Edit Tag Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{editingTag ? 'Edit Tag' : 'New Tag'}</FormLabel>
                      <div className='flex gap-2'>
                        <FormControl>
                          <Input placeholder='Enter tag name...' {...field} />
                        </FormControl>
                        {editingTag ? (
                          <div className='flex gap-1'>
                            <Button type='submit' size='sm' disabled={form.formState.isSubmitting}>
                              Update
                            </Button>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              className='h-9 w-9'
                              onClick={handleCancelEdit}
                            >
                              <X className='h-4 w-4' />
                            </Button>
                          </div>
                        ) : (
                          <Button type='submit' size='sm' disabled={form.formState.isSubmitting}>
                            <Plus className='h-4 w-4' />
                          </Button>
                        )}
                      </div>
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
                        <div className='grid grid-cols-9 gap-1.5'>
                          {TAG_COLORS.map((color) => (
                            <button
                              key={color.value}
                              type='button'
                              onClick={() => field.onChange(color.value)}
                              className={`h-7 w-full rounded ${color.value} ring-1 ring-offset-1 transition-all ${
                                field.value === color.value
                                  ? 'ring-foreground scale-110'
                                  : 'ring-transparent hover:scale-105'
                              }`}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>

            {/* Existing Tags */}
            <div className='space-y-2'>
              <h4 className='text-sm font-medium'>Existing Tags ({tags.length})</h4>
              <div className='max-h-[250px] overflow-y-auto'>
                {tags.length === 0 ? (
                  <p className='text-sm text-muted-foreground text-center py-4'>No tags yet</p>
                ) : (
                  <div className='flex flex-wrap gap-2 py-2'>
                    {tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={editingTag?.id === tag.id ? 'default' : 'secondary'}
                        className='group relative pr-8 cursor-pointer hover:opacity-80 transition-all'
                        onClick={() => handleEditClick(tag)}
                      >
                        <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${tag.color}`} />
                        {tag.name}
                        {editingTag?.id === tag.id && (
                          <Pencil className='h-3 w-3 absolute right-8 top-1/2 -translate-y-1/2' />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteClick(tag)
                          }}
                          className='absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive p-1'
                        >
                          <Trash2 className='h-3 w-3' />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open })}
        title='Delete Tag'
        description={`Are you sure you want to delete "${deleteConfirm.tagName}"? It will be removed from all notes.`}
        onConfirm={handleDeleteConfirm}
        confirmText='Delete'
        variant='destructive'
      />
    </>
  )
}
