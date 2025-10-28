import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const stripHtmlTags = (html: string): string => {
  const text = html.replace(/<[^>]*>/g, "").trim();
  const parser = new DOMParser();
  const decoded = parser.parseFromString(text, "text/html").documentElement
    .textContent;
  return decoded || "";
};
