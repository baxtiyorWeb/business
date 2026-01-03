"use client";

import { useState } from "react";
import { account } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Lock,
  User,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronLeft,
} from "lucide-react";
import { OAuthProvider } from "appwrite";

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<"login" | "signup" | "forgot">(
    "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (authMode === "login") {
        // --- KIRISH ---
        try {
          await account.deleteSession("current");
        } catch (e) {
          // Sessiya bo'lmasa xatoni o'tkazib yuboramiz
        }
        await account.createEmailPasswordSession(email, password);
        setSuccess("Muvaffaqiyatli kirildi! Yo'naltirilmoqda...");
        setTimeout(() => router.push("/"), 1500);
      } else if (authMode === "signup") {
        // --- RO'YXATDAN O'TISH ---
        await account.create("unique()", email, password, name);
        await account.createEmailPasswordSession(email, password);
        await account.createVerification(`${window.location.origin}/verify`);
        setSuccess("Hisob yaratildi! Emailingizni tasdiqlang.");
        setEmail("");
        setPassword("");
        setName("");
      } else {
        // --- PAROLNI TIKLASH ---
        await account.createRecovery(
          email,
          `${window.location.origin}/reset-password`
        );
        setSuccess("Parolni tiklash havolasi emailingizga yuborildi.");
      }
    } catch (err: any) {
      setError(err.message || "Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);

      await account.createOAuth2Session(
        OAuthProvider.Google,
        `${window.location.origin}/`,
        `${window.location.origin}/auth`
      );
    } catch (err: any) {
      setError("Google orqali kirishda xatolik.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 font-sans text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-[440px] space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {authMode === "login" && ""}
            {authMode === "signup" && ""}
            {authMode === "forgot" && "Parolni tiklash"}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 px-4">
            {authMode === "login" &&
              "Tizimga kirish uchun maʼlumotlarni kiriting"}
            {authMode === "signup" &&
              "Platformadan foydalanish uchun roʻyxatdan oʻting"}
            {authMode === "forgot" &&
              "Emailingizni kiriting va biz sizga havola yuboramiz"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md p-6 sm:p-8 transition-all">
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 text-sm bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-start gap-3 p-4 text-sm bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <p>{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {authMode === "signup" && (
              <div className="space-y-2">
                <label className="text-sm font-medium ml-1">To'liq ism</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {authMode !== "forgot" && (
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-medium">Parol</label>
                  {authMode === "login" && (
                    <button
                      type="button"
                      onClick={() => setAuthMode("forgot")}
                      className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                    >
                      Unutdingizmi?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            <Button
              disabled={loading}
              className="w-full py-6 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white rounded-xl font-semibold shadow-lg transition-all active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  {authMode === "login" && "Kirish"}
                  {authMode === "signup" && "Ro'yxatdan o'tish"}
                  {authMode === "forgot" && "Yuborish"}
                </>
              )}
            </Button>

            {authMode !== "forgot" && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-900 px-3 text-slate-500">
                      Yoki
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full py-6 border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 flex gap-3 transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google orqali
                </Button>
              </>
            )}

            {authMode === "forgot" && (
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className="flex items-center justify-center w-full gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              >
                <ChevronLeft size={16} /> Orqaga qaytish
              </button>
            )}
          </form>
        </div>

        {/* Footer */}
        {authMode !== "forgot" && (
          <p className="text-center text-sm text-slate-500">
            {authMode === "login"
              ? "Hali a'zo emasmisiz?"
              : "Hisobingiz bormi?"}{" "}
            <button
              onClick={() => {
                setAuthMode(authMode === "login" ? "signup" : "login");
                setError("");
                setSuccess("");
              }}
              className="text-slate-900 dark:text-white font-bold hover:underline underline-offset-4"
            >
              {authMode === "login" ? "Ro'yxatdan o'ting" : "Tizimga kiring"}
            </button>
          </p>
        )}

        <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest">
          Secure Cloud Authentication • Appwrite
        </p>
      </div>
    </div>
  );
}
