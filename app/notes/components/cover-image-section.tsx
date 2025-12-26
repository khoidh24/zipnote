"use client";

import { FormLabel } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Trash2, Upload } from "lucide-react";
import Image from "next/image";

interface CoverImageSectionProps {
  coverImage: string | null;
  onImageChange: (image: string | null) => void;
  isDragActive: boolean;
  getRootProps: (options?: Record<string, unknown>) => Record<string, unknown>;
  getInputProps: (options?: Record<string, unknown>) => Record<string, unknown>;
}

export function CoverImageSection({
  coverImage,
  onImageChange,
  isDragActive,
  getRootProps,
  getInputProps,
}: CoverImageSectionProps) {
  return (
    <div className="space-y-2">
      <FormLabel>Cover Image</FormLabel>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors relative min-h-30 flex items-center justify-center bg-muted/20",
          isDragActive
            ? "border-primary"
            : "border-muted-foreground/20 hover:bg-muted/30",
          coverImage ? "border-none" : ""
        )}
      >
        <input {...getInputProps()} />
        {coverImage ? (
          <div className="absolute inset-0 w-full h-full group">
            <Image
              src={coverImage}
              alt="Cover"
              fill
              className="object-cover object-center rounded-md"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onImageChange(null);
              }}
              className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <Upload className="h-6 w-6 opacity-50" />
            <span className="text-xs">Drop image or click to upload</span>
          </div>
        )}
      </div>
    </div>
  );
}
