"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { account } from "@/lib/appwrite";
import { Loader2 } from "lucide-react"; // Loader iconi uchun (shadcn/ui yoki shunga o'xshash)

export function GlobalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checkingAuth, setCheckingAuth] = useState(true); // Yuklanish holati

  // Faqat /auth bilan boshlanadigan sahifalar uchun TRUE
  const isAuthPage = pathname?.startsWith("/auth");

  useEffect(() => {
    // Agar foydalanuvchi /auth sahifasida bo'lsa, tekshirmaymiz va yuklanishni tugatamiz.
    if (isAuthPage) {
      setCheckingAuth(false);
      return;
    }

    // Auth tekshiruvini boshlash
    setCheckingAuth(true);

    account
      .get()
      .then(() => {
        // Muvaffaqiyatli - foydalanuvchi kirgan.
        setCheckingAuth(false);
      })
      .catch(() => {
        // Xato - foydalanuvchi kirmagan, /auth sahifasiga yo'naltirish.
        console.log(
          "Foydalanuvchi kirmagan. /auth sahifasiga yo'naltirilmoqda."
        );
        router.push("/auth");
      });
    // setCheckingAuth kodini .catch() blokidan tashqariga olib tashlash,
    // chunki yo'naltirish (router.push) sodir bo'lganida komponentning
    // ishini to'xtatish maqsadga muvofiq (lekin bu Appwrite API call tugagach sodir bo'lishi kerak).
    // setCheckingAuth(false) ni .then() ichida qoldirish to'g'riroq.
  }, [pathname, router, isAuthPage]);

  // --- Yuklanishni ko'rsatish ---
  // Agar /auth sahifasida bo'lmasa VA auth tekshiruvi hali tugamagan bo'lsa, spinner ko'rsatish.
  if (!isAuthPage && checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">
          Autentifikatsiya tekshirilmoqda...
        </p>
      </div>
    );
  }

  // --- Asosiy Layout ---
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      {/* Navigatsiya Paneli: Faqat Auth sahifalarida ko'rsatilmaydi */}
      {!isAuthPage && <Navigation />}

      {/* Asosiy Kontent: Auth sahifasida kenglik cheklovi yo'q, boshqa sahifalarda bor */}
      <main
        className={
          isAuthPage
            ? "h-full"
            : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8"
        }
      >
        {children}
      </main>
    </div>
  );
}
