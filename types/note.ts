export interface Note {
  id: string;
  title: string;
  description: string;
  tagIds: string[];
  bgCover?: string;
  coverImage?: string; // Base64 string
  createdAt: Date;
  updatedAt: Date;
  linkedTaskIds: string[];
}

export type NoteSortBy = "createdAt" | "updatedAt" | "title";
export type SortOrder = "asc" | "desc";

export const BG_COLORS = [
  { name: "Default", value: "dark:bg-slate-800" },
  { name: "Blue", value: "dark:bg-blue-800" },
  { name: "Green", value: "dark:bg-green-800" },
  { name: "Purple", value: "dark:bg-purple-800" },
  { name: "Orange", value: "dark:bg-orange-800" },
  { name: "Pink", value: "dark:bg-pink-800" },
];

export const BG_COVERS = {
  default:
    "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900",
  blue: "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-950",
  green:
    "bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-950",
  purple:
    "bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-950",
  orange:
    "bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-950",
  pink: "bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900 dark:to-pink-950",
};

export const BORDER_COLORS = {
  default: "border-slate-200 dark:border-slate-700",
  blue: "border-blue-200 dark:border-blue-700",
  green: "border-green-200 dark:border-green-700",
  purple: "border-purple-200 dark:border-purple-700",
  orange: "border-orange-200 dark:border-orange-700",
  pink: "border-pink-200 dark:border-pink-700",
};
