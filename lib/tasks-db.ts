import { openDB } from "idb";
import { Task } from "@/types/task";

const DB_NAME = "zipnote-db";
const STORE_NAME = "tasks";

export const initTasksDB = async () => {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    },
  });
  return db;
};

export const addTask = async (
  task: Omit<Task, "id" | "createdAt" | "updatedAt">
) => {
  const db = await initTasksDB();
  const id = Date.now().toString();
  const newTask: Task = {
    ...task,
    id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await db.add(STORE_NAME, newTask);
  return newTask;
};

export const getAllTasks = async (): Promise<Task[]> => {
  const db = await initTasksDB();
  const tasks = await db.getAll(STORE_NAME);
  return tasks.map((task) => ({
    ...task,
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
  }));
};

export const getTaskById = async (id: string): Promise<Task | undefined> => {
  const db = await initTasksDB();
  const task = await db.get(STORE_NAME, id);
  if (task) {
    return {
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
    };
  }
  return undefined;
};

export const updateTask = async (
  id: string,
  updates: Partial<Omit<Task, "id" | "createdAt">>
) => {
  const db = await initTasksDB();
  const task = await db.get(STORE_NAME, id);
  if (task) {
    const updatedTask: Task = {
      ...task,
      ...updates,
      id,
      createdAt: task.createdAt,
      updatedAt: new Date(),
    };
    await db.put(STORE_NAME, updatedTask);
    return updatedTask;
  }
};

export const deleteTask = async (id: string) => {
  const db = await initTasksDB();
  await db.delete(STORE_NAME, id);
};

export const getTasksByNoteId = async (noteId: string): Promise<Task[]> => {
  const allTasks = await getAllTasks();
  return allTasks.filter((task) => task.linkedNoteIds.includes(noteId));
};

export const getTasksByStatusId = async (statusId: string): Promise<Task[]> => {
  const allTasks = await getAllTasks();
  return allTasks.filter((task) => task.statusId === statusId);
};
