"use client";

import { FormItem, FormLabel } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { BG_COLORS } from "@/types/note";

interface ColorPickerSectionProps {
  value: string;
  onChange: (value: string) => void;
}

const COLOR_PREVIEW_MAP: Record<string, string> = {
  "dark:bg-slate-800": "bg-slate-100 dark:bg-slate-800",
  "dark:bg-blue-800": "bg-blue-100 dark:bg-blue-800",
  "dark:bg-green-800": "bg-green-100 dark:bg-green-800",
  "dark:bg-purple-800": "bg-purple-100 dark:bg-purple-800",
  "dark:bg-orange-800": "bg-orange-100 dark:bg-orange-800",
  "dark:bg-pink-800": "bg-pink-100 dark:bg-pink-800",
};

export function ColorPickerSection({
  value,
  onChange,
}: ColorPickerSectionProps) {
  return (
    <FormItem className="space-y-2">
      <FormLabel>Card Color</FormLabel>
      <div className="flex flex-wrap gap-2">
        {BG_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            className={cn(
              "w-6 h-6 rounded-full border border-border/50 transition-all",
              COLOR_PREVIEW_MAP[color.value],
              value === color.value
                ? "ring-2 ring-primary ring-offset-2"
                : "hover:scale-110"
            )}
            title={color.name}
          />
        ))}
      </div>
    </FormItem>
  );
}
