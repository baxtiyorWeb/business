"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Lock,
  Bell,
  Globe,
  Moon,
  Sun,
  Monitor,
  Save,
  Mail,
  Phone,
} from "lucide-react";
import { account } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    const savedTheme =
      (localStorage.getItem("theme") as "light" | "dark" | "system") ||
      "system";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const checkAuth = async () => {
    try {
      await account.get();
    } catch (error) {
      router.push("/auth");
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (newTheme: "light" | "dark" | "system") => {
    if (newTheme === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    } else {
      document.documentElement.classList.toggle("dark", newTheme === "dark");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Yangi parollar mos kelmaydi");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Parol kamida 8 ta belgidan iborat bo'lishi kerak");
      return;
    }

    try {
      await account.updatePassword(
        passwordData.newPassword,
        passwordData.oldPassword
      );
      toast.success("Parol muvaffaqiyatli o'zgartirildi");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Parolni o'zgartirishda xatolik yuz berdi");
    }
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-dvw mx-auto space-y-1 py-0 px-4 sm:px-6 lg:px-0">

      <div className="grid gap-6 md:grid-cols-2">
        {/* Parolni o'zgartirish */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30">
                <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Parolni o'zgartirish</CardTitle>
                <CardDescription>
                  Hisobingiz xavfsizligini kuchaytiring
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="oldPassword">Joriy parol</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      oldPassword: e.target.value,
                    })
                  }
                  placeholder="••••••••"
                  required
                  className="h-11 border-slate-500 focus:border-slate-500 outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Yangi parol</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="Kamida 8 belgi"
                  required
                  minLength={8}
                  className="h-11 border-slate-500 focus:border-slate-500 outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Yangi parolni tasdiqlash
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Yana bir marta kiriting"
                  required
                  className="h-11 border-slate-500 focus:border-slate-500 outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              <Button type="submit" size="lg" className="w-full h-12">
                <Save className="mr-2 h-5 w-5" />
                Parolni yangilash
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tema sozlamalari */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <Monitor className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Ilova temi</CardTitle>
                <CardDescription>
                  Ko'rinishni o'zingizga moslang
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <button
              onClick={() => handleThemeChange("light")}
              className={`w-full flex items-center justify-between p-5 rounded-xl border-2 transition-all ${
                theme === "light"
                  ? "border-primary bg-primary/5"
                  : "border-slate-500 hover:border-slate-400 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/30">
                  <Sun className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Yorug' tema</p>
                  <p className="text-sm text-muted-foreground">
                    Kun davomida qulay
                  </p>
                </div>
              </div>
              {theme === "light" && (
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-white"></div>
                </div>
              )}
            </button>

            <button
              onClick={() => handleThemeChange("dark")}
              className={`w-full flex items-center justify-between p-5 rounded-xl border-2 transition-all ${
                theme === "dark"
                  ? "border-primary bg-primary/5"
                  : "border-slate-500 hover:border-slate-400 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                  <Moon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Qorong'u tema</p>
                  <p className="text-sm text-muted-foreground">
                    Ko'zlar uchun qulay
                  </p>
                </div>
              </div>
              {theme === "dark" && (
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-white"></div>
                </div>
              )}
            </button>

            <button
              onClick={() => handleThemeChange("system")}
              className={`w-full flex items-center justify-between p-5 rounded-xl border-2 transition-all ${
                theme === "system"
                  ? "border-primary bg-primary/5"
                  : "border-slate-500 hover:border-slate-400 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <Monitor className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Tizim bo'yicha</p>
                  <p className="text-sm text-muted-foreground">
                    Qurilma sozlamasiga mos
                  </p>
                </div>
              </div>
              {theme === "system" && (
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-white"></div>
                </div>
              )}
            </button>
          </CardContent>
        </Card>

        {/* Bildirishnomalar */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Bildirishnomalar</CardTitle>
                <CardDescription>
                  Muhim yangiliklardan xabardor bo'ling
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <Mail className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium">Email bildirishnomalari</p>
                  <p className="text-sm text-muted-foreground">
                    Hisob faoliyati haqida
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setNotifications({
                    ...notifications,
                    email: !notifications.email,
                  })
                }
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  notifications.email ? "bg-emerald-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${
                    notifications.email ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium">Push bildirishnomalari</p>
                  <p className="text-sm text-muted-foreground">
                    Brauzer orqali
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setNotifications({
                    ...notifications,
                    push: !notifications.push,
                  })
                }
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  notifications.push ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${
                    notifications.push ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between opacity-60">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                  <Phone className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="font-medium">SMS bildirishnomalari</p>
                  <p className="text-sm text-muted-foreground">Tez orada</p>
                </div>
              </div>
              <div className="relative inline-flex h-8 w-14 items-center rounded-full bg-slate-300">
                <span className="inline-block h-6 w-6 translate-x-1 rounded-full bg-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Til sozlamalari */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                <Globe className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Ilova tili</CardTitle>
                <CardDescription>Interfeys tilini tanlang</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 rounded-xl border-2 border-primary bg-primary/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                    <Globe className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold">O'zbekcha (Ўзбекча)</p>
                    <p className="text-sm text-primary">Joriy til</p>
                  </div>
                </div>
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-white"></div>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-dashed border-slate-500 dark:border-slate-700 text-center">
                <p className="text-sm text-muted-foreground">
                  Boshqa tillar tez orada qo'shiladi
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
