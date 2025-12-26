"use client";

import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addNote, deleteNote, updateNote } from "@/lib/notes-db";
import { getAllTags } from "@/lib/tags-db";
import { type Note } from "@/types/note";
import { zodResolver } from "@hookform/resolvers/zod";
import { MoreVertical, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { TagManagementDialog } from "./tag-management-dialog";
import { TagSection } from "./tag-section";
import { ColorPickerSection } from "./color-picker-section";
import { CoverImageSection } from "./cover-image-section";
import { Tag } from "@/types/tag";
import { cn } from "@/lib/utils";

const noteFormSchema = z.object({
  title: z.string().max(200, "Title is too long").optional(),
  description: z.string().max(2000, "Description is too long").optional(),
  tagIds: z.array(z.string()),
  bgCover: z.string(),
});

export type NoteFormValues = z.infer<typeof noteFormSchema>;

interface CreateNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNoteCreated: () => void;
  editNote?: Note | null;
}

export function CreateNoteDialog({
  open,
  onOpenChange,
  onNoteCreated,
  editNote,
}: CreateNoteDialogProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [tagManagementOpen, setTagManagementOpen] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const noteIdRef = useRef<string | null>(null);
  const prevOpenRef = useRef(open);

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: "",
      description: "",
      tagIds: [],
      bgCover: "default",
    },
  });

  // Load Tags
  const loadTags = async () => {
    try {
      const tags = await getAllTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error("Failed to load tags:", error);
    }
  };

  // Initial State Setup
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      loadTags();

      if (editNote) {
        noteIdRef.current = editNote.id;
        form.reset({
          title: editNote.title,
          description: editNote.description,
          tagIds: editNote.tagIds || [],
          bgCover: editNote.bgCover || "default",
        });
        setCoverImage(editNote.coverImage || null);
      } else {
        noteIdRef.current = null;
        form.reset({
          title: "",
          description: "",
          tagIds: [],
          bgCover: "default",
        });
        setCoverImage(null);
      }
    }
    prevOpenRef.current = open;
  }, [open, editNote, form]);

  // Save Logic
  const saveNote = async (
    values: NoteFormValues,
    imageOverride?: string | null
  ) => {
    const finalImage =
      imageOverride !== undefined ? imageOverride : coverImage || undefined;
    const title = values.title || "Untitled Note";

    const noteData = {
      title,
      description: values.description || "",
      tagIds: values.tagIds,
      bgCover: values.bgCover,
      coverImage: finalImage || undefined,
    };

    try {
      if (noteIdRef.current) {
        await updateNote(noteIdRef.current, noteData);
      } else {
        const newNote = await addNote({ ...noteData, linkedTaskIds: [] });
        noteIdRef.current = newNote.id;
      }
    } catch (error) {
      console.error("Failed to auto-save note:", error);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Close dialog immediately (UI)
      onOpenChange(isOpen);

      // Save and refresh in background (non-blocking)
      (async () => {
        try {
          await saveNote(form.getValues());
          onNoteCreated();
        } catch (error) {
          console.error("Failed to save note on close:", error);
        }
      })();
    } else {
      onOpenChange(isOpen);
    }
  };

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "bgCover" || name === "tagIds") {
        saveNote(form.getValues() as NoteFormValues).catch((error) =>
          console.error("Failed to auto-save:", error)
        );
      }
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch]);

  const handleDelete = async () => {
    if (noteIdRef.current) {
      try {
        await deleteNote(noteIdRef.current);
        onNoteCreated();
        onOpenChange(false);
      } catch (error) {
        console.error("Failed to delete note:", error);
      }
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        return alert("Max 8MB");
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCoverImage(result);
        saveNote(form.getValues(), result);
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="sm:max-w-137.5 max-h-[90vh] overflow-y-auto [&>button]:hidden"
          onEscapeKeyDown={(e) => {
            e.preventDefault();
          }}
        >
          <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="flex items-start justify-between mb-4">
                <DialogTitle className="text-xl font-bold">
                  {noteIdRef.current ? "" : "Create New Note"}
                </DialogTitle>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("h-8 w-8", !noteIdRef.current && "hidden")}
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive cursor-pointer"
                      onClick={() => setDeleteConfirmOpen(true)}
                      disabled={!noteIdRef.current}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Note
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Title"
                          {...field}
                          autoFocus
                          className="text-lg font-semibold shadow-none focus-visible:ring-0"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Take a note..."
                          rows={8}
                          {...field}
                          className="resize-none shadow-none focus-visible:ring-0 min-h-37.5"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <TagSection
                  form={{
                    watch: form.watch,
                    setValue: form.setValue,
                    getValues: form.getValues,
                  }}
                  availableTags={availableTags}
                  onLoadTags={loadTags}
                  tagManagementOpen={tagManagementOpen}
                  setTagManagementOpen={setTagManagementOpen}
                />

                <div className="space-y-4 pt-2">
                  <FormField
                    control={form.control}
                    name="bgCover"
                    render={({ field }) => (
                      <ColorPickerSection
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />

                  <CoverImageSection
                    coverImage={coverImage}
                    onImageChange={(image) => {
                      setCoverImage(image);
                      saveNote(form.getValues(), image);
                    }}
                    isDragActive={isDragActive}
                    getRootProps={getRootProps}
                    getInputProps={getInputProps}
                  />
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Note"
        description="Are you sure you want to delete this note?"
        onConfirm={handleDelete}
        variant="destructive"
      />

      <TagManagementDialog
        open={tagManagementOpen}
        onOpenChange={(open) => {
          setTagManagementOpen(open);
          if (!open) loadTags();
        }}
      />
    </>
  );
}
