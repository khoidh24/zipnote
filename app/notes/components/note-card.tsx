"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import type { Note } from "@/types/note";
import type { Tag } from "@/types/tag";
import moment from "moment";
import { useEffect, useState, memo } from "react";
import { getTagsByIds } from "@/lib/tags-db";
import Image from "next/image";
import { BG_COVERS, BORDER_COLORS } from "@/types/note";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
}

export const NoteCard = memo(function NoteCard({
  note,
  onEdit,
}: NoteCardProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const bgCover =
    (note.bgCover && BG_COVERS[note.bgCover as keyof typeof BG_COVERS]) ||
    BG_COVERS.default;
  const borderColor =
    (note.bgCover &&
      BORDER_COLORS[note.bgCover as keyof typeof BORDER_COLORS]) ||
    BORDER_COLORS.default;

  useEffect(() => {
    let mounted = true;
    const loadTags = async () => {
      if (note.tagIds?.length > 0) {
        const noteTags = await getTagsByIds(note.tagIds);
        if (mounted) setTags(noteTags);
      }
    };
    loadTags();
    return () => {
      mounted = false;
    };
  }, [note.tagIds]);

  return (
    <Card
      className={`py-0 group hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer flex flex-col gap-2 h-full bg-card hover:bg-card/90 border-2 ring-0 ${borderColor}`}
      onClick={() => onEdit(note)}
    >
      {/* Cover Area (Top) */}
      <div className="relative h-32 w-full shrink-0">
        {note.coverImage ? (
          <Image
            src={note.coverImage}
            alt={note.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className={`w-full h-full ${bgCover}`} />
        )}
      </div>

      {/* Content Area (Bottom) */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Title */}
        <h3
          className="font-semibold text-base leading-tight line-clamp-2"
          title={note.title}
        >
          {note.title}
        </h3>

        {/* Date */}
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1" />
          {moment(note.createdAt).toNow()} ago
        </div>

        {/* Tags */}
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-5 font-normal"
              >
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${tag.color}`}
                />
                {tag.name}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mt-3">No tag selected</p>
        )}
      </div>
    </Card>
  );
});
