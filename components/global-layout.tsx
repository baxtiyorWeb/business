"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { account } from "@/lib/appwrite";
import { Loader2 } from "lucide-react";

export function GlobalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const isAuthPage = pathname?.startsWith("/auth");

  useEffect(() => {
    if (isAuthPage) {
      setCheckingAuth(false);
      return;
    }

    account
      .get()
      .then(() => {
        setCheckingAuth(false);
      })
      .catch(() => {
        router.push("/auth");
      });
  }, [pathname, router, isAuthPage]);

  if (!isAuthPage && checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      {!isAuthPage && <Navigation />}

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
