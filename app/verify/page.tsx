// app/verify/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    const userId = searchParams.get("userId");
    const secret = searchParams.get("secret");

    if (userId && secret) {
      account
        .updateVerification(userId, secret)
        .then(() => {
          setStatus("success");
          // 3 soniyadan keyin bosh sahifaga o'tkazish
          setTimeout(() => router.push("/"), 3000);
        })
        .catch((err) => {
          console.error("Verification error:", err);
          setStatus("error");
        });
    } else {
      setStatus("error");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-center">
        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-slate-900 dark:text-white" />
            <h1 className="text-xl font-semibold">Email tasdiqlanmoqda...</h1>
            <p className="text-slate-500 text-sm">
              Iltimos, kuting, biz ma'lumotlarni tekshiryapmiz.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-500" />
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              Email tasdiqlandi!
            </h1>
            <p className="text-slate-500 text-sm">
              Muvaffaqiyatli o'tdingiz. Hozir sizni bosh sahifaga yo'naltiramiz.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <XCircle className="h-12 w-12 mx-auto text-red-500" />
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              Xatolik yuz berdi
            </h1>
            <p className="text-slate-500 text-sm">
              Link eskirgan yoki noto'g'ri. Iltimos, qaytadan urinib ko'ring.
            </p>
            <button
              onClick={() => router.push("/auth")}
              className="mt-4 px-6 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-lg text-sm font-medium"
            >
              Auth sahifasiga qaytish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
