import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

// Utility function to merge and conditionally apply CSS classes
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// milestone 3: Tuned list filtering logic for location and role preferences
