"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { Note } from "@/types/note";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { useWatch, type Control } from "react-hook-form";
import type { TaskFormValues } from "./create-task-dialog";

interface NoteSectionProps {
  control: Control<TaskFormValues>;
  availableNotes: Note[];
  onToggleNote: (noteId: string) => void;
}

export function NoteSection({
  control,
  availableNotes,
  onToggleNote,
}: NoteSectionProps) {
  const [noteSearch, setNoteSearch] = useState("");
  const [noteInputFocused, setNoteInputFocused] = useState(false);

  const linkedNoteIds = useWatch({
    control,
    name: "linkedNoteIds",
    defaultValue: [],
  });

  const selectedNotes = availableNotes.filter((note) =>
    linkedNoteIds.includes(note.id)
  );

  const filteredNotes = noteSearch
    ? availableNotes.filter((note) =>
        note.title.toLowerCase().includes(noteSearch.toLowerCase())
      )
    : availableNotes;

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Linked Notes
      </label>

      {/* Selected Notes as Chips */}
      <div className="flex flex-wrap gap-2">
        {selectedNotes.map((note) => (
          <Badge
            key={note.id}
            variant="secondary"
            className="flex items-center gap-1 pr-1"
          >
            {note.title}
            <button
              type="button"
              onClick={() => onToggleNote(note.id)}
              className="hover:bg-muted rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      {/* Search and Dropdown */}
      <div className="relative">
        <Input
          placeholder={
            selectedNotes.length === 0 ? "Search notes..." : "Add more notes..."
          }
          value={noteSearch}
          onChange={(e) => setNoteSearch(e.target.value)}
          onFocus={() => setNoteInputFocused(true)}
          onBlur={() => setTimeout(() => setNoteInputFocused(false), 200)}
          className="h-9"
        />

        {noteInputFocused && (
          <div className="absolute top-full left-0 right-0 mt-1 border rounded-md bg-background shadow-md z-50 max-h-64 overflow-y-auto">
            {filteredNotes.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground text-center">
                No notes available
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isLinked = linkedNoteIds.includes(note.id);
                return (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => onToggleNote(note.id)}
                    className="w-full text-left px-3 py-2 hover:bg-accent flex items-center justify-between text-sm transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{note.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {note.description}
                      </p>
                    </div>
                    {isLinked && (
                      <Check className="h-4 w-4 text-primary shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {availableNotes.length === 0 && (
        <p className="text-xs text-muted-foreground">No notes available</p>
      )}
    </div>
  );
}
