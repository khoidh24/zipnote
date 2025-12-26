"use client";

import { Button } from "@/components/ui/button";
import { getAllNotes } from "@/lib/notes-db";
import { getAllTasks } from "@/lib/tasks-db";
import type { Status } from "@/types/board";
import type { Note } from "@/types/note";
import type { Task } from "@/types/task";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CreateTaskDialog } from "./create-task-dialog";
import { TaskCard } from "./task-card";

interface TasksPageClientProps {
  initialTasks: Task[];
}

// Get statuses from localStorage (from check-list page)
const getStatusesFromBoard = async (): Promise<Status[]> => {
  if (typeof window !== "undefined") {
    const boardStr = localStorage.getItem("board-data");
    if (boardStr) {
      try {
        const board = JSON.parse(boardStr);
        console.log("Loaded board data:", board);
        return board.statuses || [];
      } catch (e) {
        console.error("Failed to parse board data:", e);
      }
    } else {
      console.warn("No board-data found in localStorage");
    }
  }
  return [];
};

export function TasksPageClient({ initialTasks }: TasksPageClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [notes, setNotes] = useState<Note[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [loadedTasks, loadedNotes, loadedStatuses] = await Promise.all([
        getAllTasks(),
        getAllNotes(),
        getStatusesFromBoard(),
      ]);
      setTasks(loadedTasks);
      setNotes(loadedNotes);
      setStatuses(loadedStatuses);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = useCallback((task: Task) => {
    setEditTask(task);
    setCreateDialogOpen(true);
  }, []);

  const handleDialogClose = (open: boolean) => {
    setCreateDialogOpen(open);
    if (!open) {
      setEditTask(null);
    }
  };

  return (
    <div className="flex flex-col h-full p-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </p>
        </div>

        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <p className="text-muted-foreground text-lg">No tasks yet</p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Task
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
            {tasks.map((task) => {
              const status = statuses.find((s) => s.id === task.statusId);
              const linkedNotes = notes.filter((n) =>
                task.linkedNoteIds.includes(n.id)
              );
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  status={status}
                  linkedNotes={linkedNotes}
                  onEdit={handleEdit}
                />
              );
            })}
          </div>
        )}
      </div>

      <CreateTaskDialog
        open={createDialogOpen}
        onOpenChange={handleDialogClose}
        onTaskCreated={loadData}
        editTask={editTask}
        availableNotes={notes}
        availableStatuses={statuses}
      />
    </div>
  );
}
