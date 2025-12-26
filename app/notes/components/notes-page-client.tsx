"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllNotes } from "@/lib/notes-db";
import type { Note } from "@/types/note";
import { Plus, SortAsc, SortDesc } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CreateNoteDialog } from "./create-note-dialog";
import { NoteCard } from "./note-card";

type SortBy = "createdAt" | "updatedAt" | "title";
type SortOrder = "asc" | "desc";

interface NotesPageClientProps {
  initialNotes: Note[];
}

export function NotesPageClient({ initialNotes }: NotesPageClientProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [isLoading, setIsLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const loadedNotes = await getAllNotes();
      setNotes(sortNotes(loadedNotes));
    } catch (error) {
      console.error("Failed to load notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sortNotes = (notesToSort: Note[]) => {
    return [...notesToSort].sort((a, b) => {
      let compareValue = 0;

      if (sortBy === "title") {
        compareValue = a.title.localeCompare(b.title);
      } else {
        const aDate = new Date(a[sortBy]).getTime();
        const bDate = new Date(b[sortBy]).getTime();
        compareValue = aDate - bDate;
      }

      return sortOrder === "asc" ? compareValue : -compareValue;
    });
  };

  useEffect(() => {
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setNotes((prevNotes) => sortNotes(prevNotes));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortOrder]);

  // Memoize handleEdit to prevent NoteCard re-renders
  const handleEdit = useCallback((note: Note) => {
    setEditNote(note);
    setCreateDialogOpen(true);
  }, []);

  const handleDialogClose = (open: boolean) => {
    setCreateDialogOpen(open);
    if (!open) {
      setEditNote(null);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="flex flex-col h-full p-6 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {notes.length} {notes.length === 1 ? "note" : "notes"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Controls */}
          <Select
            value={sortBy}
            onValueChange={(value: SortBy) => setSortBy(value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Created Date</SelectItem>
              <SelectItem value="updatedAt">Updated Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={toggleSortOrder}>
            {sortOrder === "asc" ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </Button>

          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <p className="text-muted-foreground text-lg">No notes yet</p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Note
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} onEdit={handleEdit} />
            ))}
          </div>
        )}
      </div>

      <CreateNoteDialog
        open={createDialogOpen}
        onOpenChange={handleDialogClose}
        onNoteCreated={loadNotes}
        editNote={editNote}
      />
    </div>
  );
}
