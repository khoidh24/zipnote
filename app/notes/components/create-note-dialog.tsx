'use client'

import { useDropzone } from 'react-dropzone'
import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { addNote, updateNote, deleteNote } from '@/lib/notes-db'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { getAllTags, addTag } from '@/lib/tags-db'
import { TagManagementDialog } from './tag-management-dialog'
import { useState, useEffect, useRef } from 'react'
import type { Note } from '@/types/note'
import type { Tag } from '@/types/tag'
import { X, Settings2, Plus, Check, Upload, Trash2, MoreVertical } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { TAG_COLORS } from '@/types/tag'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const noteFormSchema = z.object({
  title: z.string().max(200, 'Title is too long').optional(),
  description: z.string().max(2000, 'Description is too long').optional(),
  tagIds: z.array(z.string()),
  bgCover: z.string()
})

type NoteFormValues = z.infer<typeof noteFormSchema>

interface CreateNoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNoteCreated: () => void
  editNote?: Note | null
}

const BG_COLORS = [
  { name: 'Default', value: 'default' },
  { name: 'Blue', value: 'blue' },
  { name: 'Green', value: 'green' },
  { name: 'Purple', value: 'purple' },
  { name: 'Orange', value: 'orange' },
  { name: 'Pink', value: 'pink' }
]

export function CreateNoteDialog({ open, onOpenChange, onNoteCreated, editNote }: CreateNoteDialogProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [tagManagementOpen, setTagManagementOpen] = useState(false)
  const [tagSearch, setTagSearch] = useState('')
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const noteIdRef = useRef<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const prevOpenRef = useRef(open)

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: '',
      description: '',
      tagIds: [],
      bgCover: 'default'
    }
  })

  // Load Tags
  const loadTags = async () => {
    try {
      const tags = await getAllTags()
      setAvailableTags(tags)
    } catch (error) {
      console.error('Failed to load tags:', error)
    }
  }

  // Initial State Setup
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      loadTags()
      setTagSearch('')

      if (editNote) {
        noteIdRef.current = editNote.id
        form.reset({
          title: editNote.title,
          description: editNote.description,
          tagIds: editNote.tagIds || [],
          bgCover: editNote.bgCover || 'default'
        })
        setCoverImage(editNote.coverImage || null)
      } else {
        noteIdRef.current = null
        form.reset({
          title: '',
          description: '',
          tagIds: [],
          bgCover: 'default'
        })
        setCoverImage(null)
      }
    }
    prevOpenRef.current = open
  }, [open, editNote, form])

  // Save Logic
  const saveNote = async (values: NoteFormValues, imageOverride?: string | null) => {
    setIsSaving(true)
    const finalImage = imageOverride !== undefined ? imageOverride : coverImage || undefined
    const title = values.title || 'Untitled Note'

    const noteData = {
      title,
      description: values.description || '',
      tagIds: values.tagIds,
      bgCover: values.bgCover,
      coverImage: finalImage || undefined
    }

    try {
      if (noteIdRef.current) {
        await updateNote(noteIdRef.current, noteData)
      } else {
        const newNote = await addNote({ ...noteData, linkedTaskIds: [] })
        noteIdRef.current = newNote.id
      }
    } catch (error) {
      console.error('Failed to auto-save note:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle Close
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onNoteCreated()
    }
    onOpenChange(isOpen)
  }

  const handleBlur = () => {
    setTimeout(() => saveNote(form.getValues()), 100)
  }

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'bgCover' || name === 'tagIds') {
        saveNote(form.getValues() as NoteFormValues)
      }
    })
    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch])

  const handleDelete = async () => {
    if (noteIdRef.current) {
      try {
        await deleteNote(noteIdRef.current)
        onNoteCreated()
        onOpenChange(false)
      } catch (error) {
        console.error('Failed to delete note:', error)
      }
    }
  }

  // Tag & Dropzone logic
  const toggleTag = (tagId: string) => {
    const currentTags = form.getValues('tagIds')
    if (currentTags.includes(tagId)) {
      form.setValue(
        'tagIds',
        currentTags.filter((id) => id !== tagId)
      )
    } else {
      form.setValue('tagIds', [...currentTags, tagId])
    }
  }

  const handleCreateTag = async () => {
    if (!tagSearch.trim()) return
    try {
      const newTag = await addTag({
        name: tagSearch.trim(),
        color: TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)].value
      })
      await loadTags()
      toggleTag(newTag.id)
      setTagSearch('')
    } catch (error: any) {
      console.error('Failed to create tag:', error)
    }
  }

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        return alert('Max 8MB')
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setCoverImage(result)
        saveNote(form.getValues(), result)
      }
      reader.readAsDataURL(file)
    }
  }
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, maxFiles: 1 })

  const selectedTags = availableTags.filter((tag) => form.watch('tagIds').includes(tag.id))
  const filteredTags = availableTags.filter((tag) => tag.name.toLowerCase().includes(tagSearch.toLowerCase()))
  const exactMatch = availableTags.find((tag) => tag.name.toLowerCase() === tagSearch.toLowerCase())

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className='sm:max-w-[550px] max-h-[90vh] overflow-y-auto [&>button]:hidden'
          onEscapeKeyDown={(e) => {
            if (tagSearch) {
              e.preventDefault()
              setTagSearch('')
            }
          }}
        >
          <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className='flex items-start justify-between mb-4'>
                <div>
                  <div className='flex items-center gap-2'>
                    <DialogTitle className='text-xl font-bold'>
                      {noteIdRef.current || editNote ? '' : 'Create New Note'}
                    </DialogTitle>
                    {isSaving && <span className='text-xs text-muted-foreground animate-pulse'>Saving...</span>}
                  </div>
                  <DialogDescription className='mt-1'>Changes are saved automatically.</DialogDescription>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='icon' className='h-8 w-8'>
                      <MoreVertical className='h-5 w-5' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem
                      className='text-destructive focus:text-destructive cursor-pointer'
                      onClick={() => setDeleteConfirmOpen(true)}
                      disabled={!noteIdRef.current}
                    >
                      <Trash2 className='h-4 w-4 mr-2' />
                      Delete Note
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className='grid gap-6'>
                <FormField
                  control={form.control}
                  name='title'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder='Title'
                          {...field}
                          autoFocus
                          className='text-lg font-semibold shadow-none focus-visible:ring-0'
                          onBlur={(e) => {
                            field.onBlur()
                            handleBlur()
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder='Take a note...'
                          rows={8}
                          {...field}
                          className='resize-none shadow-none focus-visible:ring-0 min-h-[150px]'
                          onBlur={(e) => {
                            field.onBlur()
                            handleBlur()
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Tags Section */}
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                      Tags
                    </label>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => setTagManagementOpen(true)}
                      className='h-6 text-xs px-2'
                    >
                      <Settings2 className='h-3 w-3 mr-1' /> Manage
                    </Button>
                  </div>

                  <div className='border rounded-md px-3 py-2 bg-background focus-within:ring-1 focus-within:ring-ring min-h-[40px] flex flex-wrap gap-2'>
                    {selectedTags.map((tag) => (
                      <Badge key={tag.id} variant='secondary' className='h-6 pr-1 gap-1'>
                        <span className={`w-1.5 h-1.5 rounded-full ${tag.color}`} />
                        {tag.name}
                        <button
                          type='button'
                          onClick={() => toggleTag(tag.id)}
                          className='hover:bg-muted rounded-full p-0.5 ml-1'
                        >
                          <X className='h-3 w-3 opacity-50' />
                        </button>
                      </Badge>
                    ))}
                    <div className='relative flex-1 min-w-[120px]'>
                      <input
                        className='w-full bg-transparent outline-none text-sm h-6 placeholder:text-muted-foreground'
                        placeholder={selectedTags.length === 0 ? 'Add tags...' : ''}
                        value={tagSearch}
                        onChange={(e) => setTagSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            if (tagSearch.trim()) {
                              if (!exactMatch) handleCreateTag()
                              else if (!form.getValues('tagIds').includes(exactMatch.id)) {
                                toggleTag(exactMatch.id)
                                setTagSearch('')
                              }
                            }
                          } else if (e.key === 'Escape') {
                            e.preventDefault()
                            e.stopPropagation()
                            setTagSearch('')
                          } else if (e.key === 'Backspace' && !tagSearch && selectedTags.length > 0) {
                            toggleTag(selectedTags[selectedTags.length - 1].id)
                          }
                        }}
                      />
                      {tagSearch && (
                        <div
                          className='absolute top-full left-0 w-full mt-1 border rounded-md shadow-lg bg-popover z-50 overflow-hidden'
                          style={{ minWidth: '200px' }}
                        >
                          {filteredTags.length === 0 ? (
                            <div
                              className='p-2 text-sm text-center text-muted-foreground cursor-pointer hover:bg-accent'
                              onClick={handleCreateTag}
                            >
                              Create "{tagSearch}"
                            </div>
                          ) : (
                            <div className='max-h-[200px] overflow-y-auto p-1'>
                              {filteredTags.map((tag) => (
                                <div
                                  key={tag.id}
                                  className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent ${
                                    form.watch('tagIds').includes(tag.id) ? 'bg-accent/50' : ''
                                  }`}
                                  onClick={() => {
                                    toggleTag(tag.id)
                                    setTagSearch('')
                                  }}
                                >
                                  <span className={`w-2 h-2 rounded-full ${tag.color}`} />
                                  <span>{tag.name}</span>
                                  {form.watch('tagIds').includes(tag.id) && <Check className='h-3 w-3 ml-auto' />}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className='space-y-4 pt-2'>
                  <FormField
                    control={form.control}
                    name='bgCover'
                    render={({ field }) => (
                      <FormItem className='space-y-2'>
                        <FormLabel>Card Color</FormLabel>
                        <div className='flex flex-wrap gap-2'>
                          {BG_COLORS.map((color) => (
                            <button
                              key={color.value}
                              type='button'
                              onClick={() => field.onChange(color.value)}
                              className={`w-6 h-6 rounded-full border border-border/50 transition-all ${
                                color.value === 'default'
                                  ? 'bg-slate-100 dark:bg-slate-800'
                                  : color.value === 'blue'
                                  ? 'bg-blue-100 dark:bg-blue-900'
                                  : color.value === 'green'
                                  ? 'bg-green-100 dark:bg-green-900'
                                  : color.value === 'purple'
                                  ? 'bg-purple-100 dark:bg-purple-900'
                                  : color.value === 'orange'
                                  ? 'bg-orange-100 dark:bg-orange-900'
                                  : 'bg-pink-100 dark:bg-pink-900'
                              } ${
                                field.value === color.value ? 'ring-2 ring-primary ring-offset-2' : 'hover:scale-110'
                              }`}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className='space-y-2'>
                    <FormLabel>Cover Image</FormLabel>
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors relative min-h-[120px] flex items-center justify-center bg-muted/20 ${
                        isDragActive ? 'border-primary' : 'border-muted-foreground/20 hover:bg-muted/30'
                      }`}
                    >
                      <input {...getInputProps()} />
                      {coverImage ? (
                        <div className='absolute inset-0 w-full h-full group'>
                          <Image src={coverImage} alt='Cover' fill className='object-cover rounded-md' />
                          <button
                            type='button'
                            onClick={(e) => {
                              e.stopPropagation()
                              setCoverImage(null)
                              saveNote(form.getValues(), null)
                            }}
                            className='absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive'
                          >
                            <Trash2 className='h-4 w-4' />
                          </button>
                        </div>
                      ) : (
                        <div className='flex flex-col items-center gap-1 text-muted-foreground'>
                          <Upload className='h-6 w-6 opacity-50' />
                          <span className='text-xs'>Drop image or click to upload</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title='Delete Note'
        description='Are you sure you want to delete this note?'
        onConfirm={handleDelete}
        variant='destructive'
      />

      <TagManagementDialog
        open={tagManagementOpen}
        onOpenChange={(open) => {
          setTagManagementOpen(open)
          if (!open) loadTags()
        }}
      />
    </>
  )
}
