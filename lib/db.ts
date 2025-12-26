import { openDB, DBSchema, IDBPDatabase } from 'idb'
import type { Task, Status } from '@/types/board'

interface TaskBoardDB extends DBSchema {
  statuses: {
    key: string
    value: Status
    indexes: { 'by-order': number }
  }
  tasks: {
    key: string
    value: Task
    indexes: { 'by-status': string; 'by-order': number }
  }
}

const DB_NAME = 'taskboard-db'
const DB_VERSION = 1

let dbInstance: IDBPDatabase<TaskBoardDB> | null = null

async function getDB(): Promise<IDBPDatabase<TaskBoardDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<TaskBoardDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create statuses store
      if (!db.objectStoreNames.contains('statuses')) {
        const statusStore = db.createObjectStore('statuses', { keyPath: 'id' })
        statusStore.createIndex('by-order', 'order')
      }

      // Create tasks store
      if (!db.objectStoreNames.contains('tasks')) {
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id' })
        taskStore.createIndex('by-status', 'statusId')
        taskStore.createIndex('by-order', 'order')
      }
    }
  })

  // Initialize with default statuses if empty
  const statusCount = await dbInstance.count('statuses')
  if (statusCount === 0) {
    await initializeDefaultData(dbInstance)
  }

  return dbInstance
}

async function initializeDefaultData(db: IDBPDatabase<TaskBoardDB>) {
  const defaultStatuses: Status[] = [
    {
      id: 'status-1',
      title: 'Todo',
      color: 'bg-slate-500',
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'status-2',
      title: 'Pending',
      color: 'bg-amber-500',
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'status-3',
      title: 'In Progress',
      color: 'bg-blue-500',
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'status-4',
      title: 'Testing',
      color: 'bg-purple-500',
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'status-5',
      title: 'Waiting for deploy',
      color: 'bg-orange-500',
      order: 4,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'status-6',
      title: 'Completed',
      color: 'bg-green-500',
      order: 5,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  const tx = db.transaction('statuses', 'readwrite')
  await Promise.all(defaultStatuses.map((status) => tx.store.add(status)))
  await tx.done
}

// Status operations
export async function getAllStatuses(): Promise<Status[]> {
  const db = await getDB()
  return db.getAllFromIndex('statuses', 'by-order')
}

export async function addStatus(status: Omit<Status, 'id' | 'createdAt' | 'updatedAt'>): Promise<Status> {
  const db = await getDB()
  const newStatus: Status = {
    ...status,
    id: `status-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  await db.add('statuses', newStatus)
  return newStatus
}

export async function updateStatus(id: string, updates: Partial<Status>): Promise<void> {
  const db = await getDB()
  const status = await db.get('statuses', id)
  if (status) {
    await db.put('statuses', { ...status, ...updates, updatedAt: new Date() })
  }
}

export async function deleteStatus(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('statuses', id)
  // Also delete all tasks in this status
  const tasks = await getTasksByStatus(id)
  await Promise.all(tasks.map((task) => deleteTask(task.id)))
}

// Task operations
export async function getAllTasks(): Promise<Task[]> {
  const db = await getDB()
  return db.getAll('tasks')
}

export async function getTasksByStatus(statusId: string): Promise<Task[]> {
  const db = await getDB()
  return db.getAllFromIndex('tasks', 'by-status', statusId)
}

export async function addChecklist(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  const db = await getDB()
  const newTask: Task = {
    ...task,
    id: `task-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  await db.add('tasks', newTask)
  return newTask
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
  const db = await getDB()
  const task = await db.get('tasks', id)
  if (task) {
    await db.put('tasks', { ...task, ...updates, updatedAt: new Date() })
  }
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('tasks', id)
}

export async function moveTask(taskId: string, newStatusId: string, newOrder: number): Promise<void> {
  await updateTask(taskId, { statusId: newStatusId, order: newOrder })
}
