"use client";

import { useState } from "react";
import { account, ID } from "@/lib/appwrite";
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
  Phone,
  Sparkles,
} from "lucide-react";
import { OAuthProvider } from "appwrite";

type AuthMode = "login" | "signup" | "forgot";

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (authMode === "login") {
        try {
          await account.deleteSession("current");
        } catch (e) {}
        await account.createEmailPasswordSession(email, password);
        setSuccess("Muvaffaqiyatli kirildi!");
        setTimeout(() => router.push("/"), 1000);
      } else if (authMode === "signup") {
        await account.create(ID.unique(), email, password, name);
        await account.createEmailPasswordSession(email, password);
        setSuccess("Hisob yaratildi! Xush kelibsiz.");
        setTimeout(() => router.push("/"), 1500);
      } else if (authMode === "forgot") {
        await account.createRecovery(
          email,
          `${window.location.origin}/reset-password`
        );
        setSuccess("Tiklash havolasi emailingizga yuborildi.");
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
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#020617] p-4 font-sans selection:bg-primary/10">
      <div className="w-full max-w-[420px] space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          
          <h1 className="text-xl sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
            {authMode === "login"
              ? "Tizimga kirish"
              : authMode === "signup"
              ? "Hisob yaratish"
              : "Parolni tiklash"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Barcha moliyaviy biznesingizni bir joyda boshqaring
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none p-6 sm:p-10 relative overflow-hidden">
          {/* Messages */}
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 text-sm bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-2xl animate-in fade-in zoom-in duration-300">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 flex items-start gap-3 p-4 text-sm bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <p className="font-medium">{success}</p>
            </div>
          )}

          {/* Auth Method Switch (Tez kunda effekti bilan) */}
          {authMode !== "forgot" && (
            <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl mb-8 relative">
              <div className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl bg-white dark:bg-slate-700 shadow-sm text-primary transition-all">
                <Mail size={16} /> Email
              </div>

              <div className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-slate-400 cursor-not-allowed group relative">
                <Phone size={16} /> Telefon
                {/* Coming Soon Tooltip/Badge */}
                <span className="absolute -top-3 -right-2 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg rotate-12 group-hover:rotate-0 transition-transform">
                  TEZ KUNDA
                </span>
              </div>
            </div>
          )}

          {/* Email Auth Form */}
          <form onSubmit={handleEmailAuth} className="space-y-5">
            {authMode === "signup" && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">
                  To'liq ism
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">
                Email Manzil
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {authMode !== "forgot" && (
              <div className="space-y-1.5">
                <div className="flex justify-between ml-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Parol
                  </label>
                  {authMode === "login" && (
                    <button
                      type="button"
                      onClick={() => setAuthMode("forgot")}
                      className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                      Unutdingizmi?
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            <Button
              disabled={loading}
              className="w-full py-7 rounded-2xl text-[16px] font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : authMode === "login" ? (
                "Tizimga kirish"
              ) : authMode === "signup" ? (
                "Ro'yxatdan o'tish"
              ) : (
                "Tiklash havolasini yuborish"
              )}
            </Button>
          </form>

          {/* Social Auth */}
          {authMode !== "forgot" && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <span className="bg-white dark:bg-slate-900 px-4">Yoki</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-6 border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 flex gap-3 font-bold transition-all"
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
                Google bilan davom etish
              </Button>
            </>
          )}

          {authMode === "forgot" && (
            <button
              onClick={() => setAuthMode("login")}
              className="mt-6 flex items-center justify-center w-full gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors"
            >
              <ChevronLeft size={16} /> Login sahifasiga qaytish
            </button>
          )}
        </div>

        {/* Bottom Toggle */}
        {authMode !== "forgot" && (
          <p className="text-center text-sm text-slate-500 font-medium">
            {authMode === "login"
              ? "Hali hisobingiz yo'qmi?"
              : "Allaqachon a'zomisiz?"}{" "}
            <button
              onClick={() => {
                setAuthMode(authMode === "login" ? "signup" : "login");
                setError("");
                setSuccess("");
              }}
              className="text-primary font-black hover:underline underline-offset-4 ml-1"
            >
              {authMode === "login" ? "Ro'yxatdan o'ting" : "Tizimga kiring"}
            </button>
          </p>
        )}

        <div className="text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-medium">
            Xavfsiz va Himoyalangan • Cloud Auth
          </p>
        </div>
      </div>
    </div>
  );
}
