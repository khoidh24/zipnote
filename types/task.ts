export interface Task {
  id: string;
  title: string;
  description?: string;
  statusId: string;
  linkedNoteIds: string[];
  createdAt: Date;
  updatedAt: Date;
}
