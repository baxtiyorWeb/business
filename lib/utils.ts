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
  // 1. Kirish qiymatini tekshirish
  if (!date) {
    return "Noma'lum sana"; // Yoki bo'sh qator: ''
  }

  // 2. Sana obyektini yaratish
  const dateObject = new Date(date);

  // 3. Agar yaratilgan sana obyektining qiymati noto'g'ri bo'lsa (Invalid Date), xatoni ushlash
  if (isNaN(dateObject.getTime())) {
    console.error("Noto'g'ri sana formati aniqlandi:", date);
    return "Yaroqsiz sana";
  }

  // 4. Sanani formatlash
  return new Intl.DateTimeFormat("uz-UZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObject);
}
