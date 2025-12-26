import {
  addChecklist,
  getAllTasks as dbGetAllTasks,
  updateTask as dbUpdateTask,
  deleteTask as dbDeleteTask,
  getTasksByStatus,
} from "./db";
import type { Task as TaskType } from "@/types/task";
import type { Task as BoardTask } from "@/types/board";

export const addTask = async (
  task: Omit<TaskType, "id" | "createdAt" | "updatedAt">
) => {
  // Map from /types/task.ts to /types/board.ts format
  const boardTask: Omit<BoardTask, "id" | "createdAt" | "updatedAt"> = {
    title: task.title,
    description: task.description,
    statusId: task.statusId,
    linkedNoteIds: task.linkedNoteIds,
    order: Date.now(),
    logWork: [],
  };
  return addChecklist(boardTask);
};

export const getAllTasks = async (): Promise<TaskType[]> => {
  const boardTasks = await dbGetAllTasks();
  // Map from /types/board.ts to /types/task.ts format
  return boardTasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    statusId: task.statusId,
    linkedNoteIds: task.linkedNoteIds,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  }));
};

export const getTaskById = async (
  id: string
): Promise<TaskType | undefined> => {
  const tasks = await getAllTasks();
  return tasks.find((task) => task.id === id);
};

export const updateTask = async (
  id: string,
  updates: Partial<Omit<TaskType, "id" | "createdAt">>
) => {
  // Map only the fields that exist in both types
  const boardUpdates: Partial<BoardTask> = {};
  if (updates.title !== undefined) boardUpdates.title = updates.title;
  if (updates.description !== undefined)
    boardUpdates.description = updates.description;
  if (updates.statusId !== undefined) boardUpdates.statusId = updates.statusId;
  if (updates.linkedNoteIds !== undefined)
    boardUpdates.linkedNoteIds = updates.linkedNoteIds;

  await dbUpdateTask(id, boardUpdates);
};

export const deleteTask = async (id: string) => {
  return dbDeleteTask(id);
};

export const getTasksByNoteId = async (noteId: string): Promise<TaskType[]> => {
  const allTasks = await getAllTasks();
  return allTasks.filter(
    (task) => task.linkedNoteIds?.includes(noteId) || false
  );
};

export const getTasksByStatusId = async (
  statusId: string
): Promise<TaskType[]> => {
  const boardTasks = await getTasksByStatus(statusId);
  // Map from /types/board.ts to /types/task.ts format
  return boardTasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    statusId: task.statusId,
    linkedNoteIds: task.linkedNoteIds,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  }));
};
