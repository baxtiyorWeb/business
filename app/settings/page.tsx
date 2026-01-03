"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Bell,
  Globe,
  Moon,
  Sun,
  Monitor,
  Check,
  ChevronRight,
  ShieldCheck,
  Mail,
  Smartphone,
  Loader2,
  Save,
} from "lucide-react";

import { account } from "@/lib/appwrite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      try {
        await account.get();
        const savedTheme = (localStorage.getItem("theme") as any) || "system";
        setTheme(savedTheme);
      } catch {
        router.push("/auth");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    const isDark =
      newTheme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
        : newTheme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Yangi parollar mos kelmaydi");
      return;
    }
    setIsUpdating(true);
    try {
      await account.updatePassword(
        passwordData.newPassword,
        passwordData.oldPassword
      );
      toast.success("Parol muvaffaqiyatli yangilandi");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Xatolik yuz berdi");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
      </div>
    );
  }

  const cardStyle =
    "bg-card/50 backdrop-blur-md border border-border/50 shadow-sm rounded-3xl overflow-hidden";

  return (
    <div className="max-w-dvw mx-auto space-y-8 py-0 px-0 lg:px-4 sm:px-3">
      {/* XAVFSIZLIK - PAROLNI O'ZGARTIRISH */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Xavfsizlik sozlamalari
          </h2>
        </div>

        <div className={cardStyle}>
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <h3 className="text-lg font-semibold">Parolni yangilash</h3>
              <p className="text-sm text-muted-foreground">
                Hisobingiz xavfsizligini ta'minlash uchun kuchli paroldan
                foydalaning.
              </p>
            </div>

            <form
              onSubmit={handlePasswordUpdate}
              className="grid gap-6 md:grid-cols-3"
            >
              <div className="space-y-2">
                <Label className="text-sm font-medium ml-1">Joriy parol</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="bg-background/50 border-slate-300 focus:border-slate-500 outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 rounded-2xl"
                  value={passwordData.oldPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      oldPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium ml-1">Yangi parol</Label>
                <Input
                  type="password"
                  placeholder="Kamida 8 belgi"
                  className="bg-background/50 border-slate-300 focus:border-slate-500 outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 rounded-2xl"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium ml-1">Tasdiqlash</Label>
                <Input
                  type="password"
                  placeholder="Qayta kiriting"
                  className="bg-background/50 border-slate-300 focus:border-slate-500 outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 rounded-2xl"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <Button
                  disabled={isUpdating}
                  size="sm"
                  className="h-11 px-6 rounded-2xl shadow-md transition-all active:scale-95"
                >
                  {isUpdating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Saqlash
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        {/* TEMA SOZLAMALARI */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Monitor className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Ko'rinish</h2>
          </div>

          <div className={`${cardStyle} p-2`}>
            <div className="flex flex-col gap-1">
              {[
                {
                  id: "light",
                  label: "Yorug' tema",
                  icon: Sun,
                  color: "text-orange-500 bg-orange-500/10",
                },
                {
                  id: "dark",
                  label: "Qorong'u tema",
                  icon: Moon,
                  color: "text-blue-500 bg-blue-500/10",
                },
                {
                  id: "system",
                  label: "Tizimga mos",
                  icon: Monitor,
                  color: "text-emerald-500 bg-emerald-500/10",
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleThemeChange(item.id as any)}
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                    theme === item.id
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "hover:bg-primary/10 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-xl ${
                        theme === item.id ? "bg-white/20" : item.color
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="font-semibold">{item.label}</span>
                  </div>
                  {theme === item.id && (
                    <Check className="h-5 w-5 stroke-[3px]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* BILDIRISHNOMALAR VA TIL */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Ilova sozlamalari
            </h2>
          </div>

          <div className={cardStyle}>
            <div className="divide-y divide-border/50">
              {/* Email */}
              <div className="flex items-center justify-between p-5 hover:bg-primary/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Email bildirishnomalar</p>
                    <p className="text-xs text-muted-foreground">
                      Xavfsizlik haqida xabarlar
                    </p>
                  </div>
                </div>
                <div className="h-6 w-11 rounded-full bg-primary/20 flex items-center px-1 cursor-pointer">
                  <div className="h-4 w-4 rounded-full bg-primary translate-x-5 transition-transform shadow-sm" />
                </div>
              </div>

              {/* Til */}
              <div className="flex items-center justify-between p-5 hover:bg-primary/5 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Interfeys tili</p>
                    <p className="text-xs text-muted-foreground">
                      O'zbekcha (Lotin)
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>

              {/* SMS (Disabled) */}
              <div className="flex items-center justify-between p-5 opacity-50 bg-secondary/20">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-muted">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">SMS xabarnomalar</p>
                    <p className="text-xs">Tez kunda qo'shiladi</p>
                  </div>
                </div>
                <div className="h-6 w-11 rounded-full bg-muted flex items-center px-1">
                  <div className="h-4 w-4 rounded-full bg-background transition-transform shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
