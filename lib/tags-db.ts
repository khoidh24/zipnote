import { openDB, DBSchema, IDBPDatabase } from 'idb'
import type { Tag } from '@/types/tag'

interface TagsDB extends DBSchema {
  tags: {
    key: string
    value: Tag
    indexes: { 'by-name': string }
  }
}

const DB_NAME = 'tags-db'
const DB_VERSION = 1

let dbInstance: IDBPDatabase<TagsDB> | null = null

async function getDB(): Promise<IDBPDatabase<TagsDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<TagsDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('tags')) {
        const tagStore = db.createObjectStore('tags', { keyPath: 'id' })
        tagStore.createIndex('by-name', 'name')
      }
    }
  })

  return dbInstance
}

// CRUD operations
export async function getAllTags(): Promise<Tag[]> {
  const db = await getDB()
  const tags = await db.getAll('tags')
  return tags.sort((a, b) => a.name.localeCompare(b.name))
}

export async function getTagById(id: string): Promise<Tag | undefined> {
  const db = await getDB()
  return db.get('tags', id)
}

export async function getTagsByIds(ids: string[]): Promise<Tag[]> {
  const db = await getDB()
  const tags = await Promise.all(ids.map((id) => db.get('tags', id)))
  return tags.filter((tag): tag is Tag => tag !== undefined)
}

export async function addTag(tag: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tag> {
  const db = await getDB()

  // Check if tag with same name exists
  const existingTags = await db.getAllFromIndex('tags', 'by-name', tag.name)
  if (existingTags.length > 0) {
    throw new Error('Tag with this name already exists')
  }

  const newTag: Tag = {
    ...tag,
    id: `tag-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  await db.add('tags', newTag)
  return newTag
}

export async function updateTag(id: string, updates: Partial<Tag>): Promise<void> {
  const db = await getDB()
  const tag = await db.get('tags', id)
  if (tag) {
    await db.put('tags', { ...tag, ...updates, updatedAt: new Date() })
  }
}

export async function deleteTag(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('tags', id)
}

export async function findOrCreateTag(name: string, color: string = 'bg-gray-500'): Promise<Tag> {
  const db = await getDB()
  const existingTags = await db.getAllFromIndex('tags', 'by-name', name)

  if (existingTags.length > 0) {
    return existingTags[0]
  }

  return addTag({ name, color })
}
