export interface Note {
  id: string
  title: string
  description: string
  tagIds: string[]
  bgCover?: string
  coverImage?: string // Base64 string
  createdAt: Date
  updatedAt: Date
  linkedTaskIds: string[]
}

export type NoteSortBy = 'createdAt' | 'updatedAt' | 'title'
export type SortOrder = 'asc' | 'desc'
