"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/types/task";
import type { Note } from "@/types/note";
import type { Status } from "@/types/board";
import { memo } from "react";
import { Link2 } from "lucide-react";

interface TaskCardProps {
  task: Task;
  status?: Status;
  linkedNotes: Note[];
  onEdit: (task: Task) => void;
}

export const TaskCard = memo(function TaskCard({
  task,
  status,
  linkedNotes,
  onEdit,
}: TaskCardProps) {
  return (
    <Card
      onClick={() => onEdit(task)}
      className="p-4 cursor-pointer transition-all hover:shadow-lg border-2"
      style={{
        borderColor: status?.color || "#e5e7eb",
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold line-clamp-2 flex-1">{task.title}</h3>
        {status && (
          <Badge
            className="shrink-0 flex items-center gap-1"
            style={{
              backgroundColor: status.color,
            }}
          >
            <div className="w-2 h-2 rounded-full bg-white opacity-70" />
            {status.title}
          </Badge>
        )}
      </div>

      {task.description && (
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {task.description}
        </p>
      )}

      {linkedNotes.length > 0 && (
        <div className="space-y-2 mt-3 pt-3 border-t">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <Link2 className="h-3 w-3" />
            Linked Notes
          </div>
          <div className="space-y-1">
            {linkedNotes.map((note) => (
              <div
                key={note.id}
                className="text-xs p-2 rounded bg-muted/50 hover:bg-muted transition-colors"
              >
                <p className="font-medium truncate">{note.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
        <span>
          {new Date(task.createdAt).toLocaleDateString("vi-VN", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </Card>
  );
});
