"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { addTag } from "@/lib/tags-db";
import type { Tag } from "@/types/tag";
import { TAG_COLORS } from "@/types/tag";
import { Check, Settings2, X } from "lucide-react";
import { useState } from "react";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import type { NoteFormValues } from "./create-note-dialog";

interface TagSectionProps {
  form: {
    watch: UseFormWatch<NoteFormValues>;
    setValue: UseFormSetValue<NoteFormValues>;
    getValues: () => NoteFormValues;
  };
  availableTags: Tag[];
  onLoadTags: () => Promise<void>;
  tagManagementOpen: boolean;
  setTagManagementOpen: (open: boolean) => void;
}

export function TagSection({
  form,
  availableTags,
  onLoadTags,
  setTagManagementOpen,
}: TagSectionProps) {
  const [tagSearch, setTagSearch] = useState("");
  const [tagInputFocused, setTagInputFocused] = useState(false);

  const selectedTags = availableTags.filter((tag) =>
    form.watch("tagIds").includes(tag.id)
  );
  const filteredTags = availableTags.filter((tag) =>
    tag.name.toLowerCase().includes(tagSearch.toLowerCase())
  );
  const exactMatch = availableTags.find(
    (tag) => tag.name.toLowerCase() === tagSearch.toLowerCase()
  );

  const toggleTag = (tagId: string) => {
    const currentTags = form.getValues().tagIds;
    if (currentTags.includes(tagId)) {
      form.setValue(
        "tagIds",
        currentTags.filter((id) => id !== tagId)
      );
    } else {
      form.setValue("tagIds", [...currentTags, tagId]);
    }
  };

  const handleCreateTag = async () => {
    if (!tagSearch.trim()) return;
    try {
      const newTag = await addTag({
        name: tagSearch.trim(),
        color: TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)].value,
      });
      await onLoadTags();
      toggleTag(newTag.id);
      setTagSearch("");
    } catch (error) {
      console.error("Failed to create tag:", error);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Tags
        </label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setTagManagementOpen(true)}
          className="h-6 text-xs px-2"
        >
          <Settings2 className="h-3 w-3 mr-1" /> Manage
        </Button>
      </div>

      <div className="relative border rounded-md px-3 py-2 bg-background focus-within:ring-1 focus-within:ring-ring min-h-10 flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <Badge key={tag.id} variant="secondary" className="h-6 pr-1 gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${tag.color}`} />
            {tag.name}
            <button
              type="button"
              onClick={() => toggleTag(tag.id)}
              className="hover:bg-muted rounded-full p-0.5 ml-1"
            >
              <X className="h-3 w-3 opacity-50" />
            </button>
          </Badge>
        ))}
        <div className="flex-1 min-w-30">
          <input
            className="w-full bg-transparent outline-none text-sm h-6 placeholder:text-muted-foreground"
            placeholder={selectedTags.length === 0 ? "Add tags..." : ""}
            value={tagSearch}
            onChange={(e) => setTagSearch(e.target.value)}
            onFocus={() => setTagInputFocused(true)}
            onBlur={() => setTagInputFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (tagSearch.trim()) {
                  if (!exactMatch) handleCreateTag();
                  else if (!form.getValues().tagIds.includes(exactMatch.id)) {
                    toggleTag(exactMatch.id);
                    setTagSearch("");
                  }
                }
              } else if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                setTagSearch("");
                setTagInputFocused(false);
              } else if (
                e.key === "Backspace" &&
                !tagSearch &&
                selectedTags.length > 0
              ) {
                toggleTag(selectedTags[selectedTags.length - 1].id);
              }
            }}
          />
          {tagInputFocused && (
            <div
              className="absolute top-full left-0 w-full mt-1 border rounded-md shadow-lg bg-popover z-50 overflow-hidden"
              style={{ minWidth: "200px" }}
            >
              {filteredTags.length === 0 && !tagSearch ? (
                <div className="p-2 text-sm text-center text-muted-foreground">
                  No tags available
                </div>
              ) : (
                <div className="max-h-50 overflow-y-auto p-1">
                  {filteredTags.map((tag) => (
                    <div
                      key={tag.id}
                      className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent ${
                        form.watch("tagIds").includes(tag.id)
                          ? "bg-accent/50"
                          : ""
                      }`}
                      onClick={() => {
                        toggleTag(tag.id);
                        setTagSearch("");
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <span className={`w-2 h-2 rounded-full ${tag.color}`} />
                      <span>{tag.name}</span>
                      {form.watch("tagIds").includes(tag.id) && (
                        <Check className="h-3 w-3 ml-auto" />
                      )}
                    </div>
                  ))}
                  {tagSearch && !exactMatch && (
                    <div
                      className="p-2 text-sm text-center text-muted-foreground cursor-pointer hover:bg-accent border-t"
                      onClick={handleCreateTag}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      Create &quot;{tagSearch}&quot;
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
