import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"; /** * Combines multiple class names and merges Tailwind CSS classes efficiently. * @param {...string} inputs - Class names or conditional class objects. * @returns {string} - Merged class string. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
