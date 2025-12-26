import { openDB, DBSchema, IDBPDatabase } from 'idb'
import type { Note } from '@/types/note'

interface NotesDB extends DBSchema {
  notes: {
    key: string
    value: Note
    indexes: { 'by-createdAt': Date; 'by-updatedAt': Date; 'by-title': string }
  }
}

const DB_NAME = 'notes-db'
const DB_VERSION = 1

let dbInstance: IDBPDatabase<NotesDB> | null = null

async function getDB(): Promise<IDBPDatabase<NotesDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<NotesDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('notes')) {
        const noteStore = db.createObjectStore('notes', { keyPath: 'id' })
        noteStore.createIndex('by-createdAt', 'createdAt')
        noteStore.createIndex('by-updatedAt', 'updatedAt')
        noteStore.createIndex('by-title', 'title')
      }
    }
  })

  return dbInstance
}

// CRUD operations
export async function getAllNotes(): Promise<Note[]> {
  const db = await getDB()
  return db.getAll('notes')
}

export async function getNoteById(id: string): Promise<Note | undefined> {
  const db = await getDB()
  return db.get('notes', id)
}

export async function addNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
  const db = await getDB()
  const newNote: Note = {
    ...note,
    id: `note-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  await db.add('notes', newNote)
  return newNote
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<void> {
  const db = await getDB()
  const note = await db.get('notes', id)
  if (note) {
    await db.put('notes', { ...note, ...updates, updatedAt: new Date() })
  }
}

export async function deleteNote(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('notes', id)
}

export async function getNotesSorted(sortBy: 'createdAt' | 'updatedAt' | 'title' = 'createdAt'): Promise<Note[]> {
  const db = await getDB()
  return db.getAllFromIndex('notes', `by-${sortBy}`)
}
