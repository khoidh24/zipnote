"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { addTask, deleteTask, updateTask } from "@/lib/tasks-db";
import { cn } from "@/lib/utils";
import type { Status } from "@/types/board";
import type { Note } from "@/types/note";
import type { Task } from "@/types/task";
import { zodResolver } from "@hookform/resolvers/zod";
import { MoreVertical, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { NoteSection } from "./note-section";

const taskFormSchema = z.object({
  title: z.string().max(200, "Title is too long").optional(),
  description: z.string().max(2000, "Description is too long").optional(),
  statusId: z.string(),
  linkedNoteIds: z.array(z.string()),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: () => void;
  editTask?: Task | null;
  availableNotes: Note[];
  availableStatuses: Status[];
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  onTaskCreated,
  editTask,
  availableNotes,
  availableStatuses,
}: CreateTaskDialogProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const prevOpenRef = useRef(open);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      statusId: availableStatuses[0]?.id || "",
      linkedNoteIds: [],
    },
  });

  // Initial State Setup
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      (async () => {
        if (editTask) {
          setTaskId(editTask.id);
          form.reset({
            title: editTask.title,
            description: editTask.description || "",
            statusId: editTask.statusId,
            linkedNoteIds: editTask.linkedNoteIds,
          });
        } else {
          setTaskId(null);
          form.reset({
            title: "",
            description: "",
            statusId: availableStatuses[0]?.id || "",
            linkedNoteIds: [],
          });
        }
      })();
    }
    prevOpenRef.current = open;
  }, [open, editTask, form, availableStatuses]);

  // Save Logic
  const saveTask = async (values: TaskFormValues) => {
    const title = values.title || "Untitled Task";

    const taskData = {
      title,
      description: values.description || "",
      statusId: values.statusId,
      linkedNoteIds: values.linkedNoteIds,
    };

    try {
      if (taskId) {
        await updateTask(taskId, taskData);
      } else {
        const newTask = await addTask(taskData);
        setTaskId(newTask.id);
      }
    } catch (error) {
      console.error("Failed to save task:", error);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Close dialog immediately (UI)
      onOpenChange(isOpen);

      // Save and refresh in background (non-blocking)
      (async () => {
        try {
          await saveTask(form.getValues());
          if (!taskId) {
            onTaskCreated();
          }
        } catch (error) {
          console.error("Failed to save task on close:", error);
        }
      })();
    } else {
      onOpenChange(isOpen);
    }
  };

  const handleDelete = async () => {
    if (taskId) {
      try {
        await deleteTask(taskId);
        onTaskCreated();
        onOpenChange(false);
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };

  const toggleLinkedNote = (noteId: string) => {
    const current = form.getValues("linkedNoteIds");
    if (current.includes(noteId)) {
      form.setValue(
        "linkedNoteIds",
        current.filter((id) => id !== noteId)
      );
    } else {
      form.setValue("linkedNoteIds", [...current, noteId]);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-137.5 max-h-[90vh] overflow-y-auto [&>button]:hidden">
          <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="flex items-start justify-between mb-4">
                <DialogTitle className="text-xl font-bold">
                  {taskId ? "" : "Create New Task"}
                </DialogTitle>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("h-8 w-8", !taskId && "hidden")}
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive cursor-pointer"
                      onClick={() => setDeleteConfirmOpen(true)}
                      disabled={!taskId}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Task
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
                          placeholder="Task title"
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
                  name="statusId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableStatuses.map((status) => (
                            <SelectItem key={status.id} value={status.id}>
                              {status.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                          placeholder="Task description..."
                          rows={6}
                          {...field}
                          className="resize-none shadow-none focus-visible:ring-0 min-h-32"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <NoteSection
                  control={form.control}
                  availableNotes={availableNotes}
                  onToggleNote={toggleLinkedNote}
                />
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Task"
        description="Are you sure you want to delete this task?"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </>
  );
}
