"use client";

import { Button } from "@/components/ui/button";
import {
  deleteStatus,
  deleteTask,
  getAllStatuses,
  getAllTasks,
  updateStatus,
  updateTask,
} from "@/lib/db";
import { cn } from "@/lib/utils";
import type { Status, Task } from "@/types/board";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  PointerSensor,
  TouchSensor,
  closestCorners,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { BoardSkeleton } from "./components/board-skeleton";
import { CreateStatusDialog } from "./components/create-status-dialog";
import { CreateChecklistDialog } from "./components/create-checklist-dialog";
import { StatusColumn } from "./components/status-column";
import { TaskCard } from "./components/task-card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function CheckListPage() {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeStatus, setActiveStatus] = useState<Status | null>(null);
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  const [createStatusDialogOpen, setCreateStatusDialogOpen] = useState(false);
  const [selectedStatusId, setSelectedStatusId] = useState<string>("");
  const [deleteStatusConfirm, setDeleteStatusConfirm] = useState<{
    open: boolean;
    statusId?: string;
  }>({
    open: false,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [loadedStatuses, loadedTasks] = await Promise.all([
        getAllStatuses(),
        getAllTasks(),
      ]);
      setStatuses(loadedStatuses);
      setTasks(loadedTasks);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save board data to localStorage whenever statuses or tasks change
  useEffect(() => {
    if (statuses.length > 0 || tasks.length > 0) {
      const boardData = { statuses, tasks };
      localStorage.setItem("board-data", JSON.stringify(boardData));
      console.log("Saved board data to localStorage:", boardData);
    }
  }, [statuses, tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;

    if (activeData?.type === "Task") {
      setActiveTask(activeData.task);
    } else if (activeData?.type === "Status") {
      setActiveStatus(activeData.status);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    // Dropping task over another task
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        const newTasks = [...tasks];
        if (newTasks[activeIndex].statusId !== newTasks[overIndex].statusId) {
          newTasks[activeIndex].statusId = newTasks[overIndex].statusId;
        }

        return arrayMove(newTasks, activeIndex, overIndex);
      });
    }

    // Dropping task over a status column
    const isOverAStatus = over.data.current?.type === "Status";
    if (isActiveATask && isOverAStatus) {
      setTasks((tasks) => {
        const newTasks = [...tasks];
        const activeIndex = newTasks.findIndex((t) => t.id === activeId);
        newTasks[activeIndex].statusId = overId as string;
        return newTasks;
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    setActiveStatus(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeType = active.data.current?.type;

    // Handle status reordering
    if (activeType === "Status") {
      const activeIndex = statuses.findIndex((s) => s.id === activeId);
      const overIndex = statuses.findIndex((s) => s.id === overId);

      if (activeIndex !== overIndex) {
        const newStatuses = arrayMove(statuses, activeIndex, overIndex);
        setStatuses(newStatuses);

        // Update order in database
        try {
          await Promise.all(
            newStatuses.map((status, index) =>
              updateStatus(status.id, { order: index })
            )
          );
        } catch (error) {
          console.error("Failed to update status order:", error);
          // Revert on error
          await loadData();
        }
      }
      return;
    }

    // Handle task movement
    if (activeType === "Task") {
      const overType = over.data.current?.type;
      let newStatusId: string | null = null;

      // Determine new status based on where task was dropped
      if (overType === "Status") {
        // Dropped directly on a status column
        newStatusId = overId as string;
      } else if (overType === "Task") {
        // Dropped on another task - get that task's status
        const overTask = tasks.find((t) => t.id === overId);
        if (overTask) {
          newStatusId = overTask.statusId;
        }
      }

      if (newStatusId) {
        try {
          console.log(`Updating task ${activeId} to status ${newStatusId}`);
          await updateTask(activeId as string, {
            statusId: newStatusId,
            order: Date.now(),
          });
          console.log(
            `Task ${activeId} updated successfully to status ${newStatusId}`
          );
        } catch (error) {
          console.error("Failed to update task:", error);
          await loadData();
        }
      }
    }
  };

  const handleCreateTask = (statusId: string) => {
    setSelectedStatusId(statusId);
    setCreateTaskDialogOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      await loadData();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleDeleteStatus = (statusId: string) => {
    setDeleteStatusConfirm({ open: true, statusId });
  };

  const handleDeleteStatusConfirm = async () => {
    if (deleteStatusConfirm.statusId) {
      try {
        await deleteStatus(deleteStatusConfirm.statusId);
        await loadData();
        setDeleteStatusConfirm({ open: false });
      } catch (error) {
        console.error("Failed to delete status:", error);
      }
    }
  };

  const getTasksByStatusId = (statusId: string) => {
    return tasks
      .filter((task) => task.statusId === statusId)
      .sort((a, b) => a.order - b.order);
  };

  const statusIds = statuses.map((s) => s.id);

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.4",
        },
      },
    }),
    duration: 150,
    easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
  };

  return (
    <div className="flex flex-col h-full p-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks Board</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Organize your tasks with drag and drop
          </p>
        </div>
        <Button onClick={() => setCreateStatusDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Status
        </Button>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        {isLoading ? (
          <BoardSkeleton />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 h-full pb-4">
              <SortableContext
                items={statusIds}
                strategy={horizontalListSortingStrategy}
              >
                {statuses.map((status) => (
                  <StatusColumn
                    key={status.id}
                    status={status}
                    tasks={getTasksByStatusId(status.id)}
                    onCreateTask={handleCreateTask}
                    onDeleteTask={handleDeleteTask}
                    onDeleteStatus={handleDeleteStatus}
                  />
                ))}
              </SortableContext>

              {statuses.length === 0 && (
                <div className="flex items-center justify-center h-full w-full">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">
                      No status columns yet
                    </p>
                    <Button onClick={() => setCreateStatusDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Status
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <DragOverlay dropAnimation={dropAnimation}>
              {activeTask ? (
                <div
                  style={{
                    transform: "rotate(3deg)",
                    transition:
                      "transform 200ms cubic-bezier(0.18, 0.67, 0.6, 1.22)",
                  }}
                >
                  <TaskCard task={activeTask} onDelete={() => {}} />
                </div>
              ) : activeStatus ? (
                <div className="bg-muted/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border-2 border-primary">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn("w-3 h-3 rounded-full", activeStatus.color)}
                    />
                    <span className="font-semibold text-sm">
                      {activeStatus.title}
                    </span>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Dialogs */}
      <CreateChecklistDialog
        open={createTaskDialogOpen}
        onOpenChange={setCreateTaskDialogOpen}
        statusId={selectedStatusId}
        onTaskCreated={loadData}
      />
      <CreateStatusDialog
        open={createStatusDialogOpen}
        onOpenChange={setCreateStatusDialogOpen}
        onStatusCreated={loadData}
      />
      <ConfirmDialog
        open={deleteStatusConfirm.open}
        onOpenChange={(open) => setDeleteStatusConfirm({ open })}
        title="Delete Status"
        description="Are you sure you want to delete this status? This will permanently delete all tasks within this column."
        onConfirm={handleDeleteStatusConfirm}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}
