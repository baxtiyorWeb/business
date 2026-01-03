import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    minimumFractionDigits: 0,
  }).format(amount);
}
// utils.ts (Yangilangan kod)
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "Noma'lum sana";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "Yaroqsiz sana";

  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();

  return `${day}.${month}.${year}`; // 👉 03.01.2026
}
