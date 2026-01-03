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
import { Lock, Bell, Globe, Moon, Sun, Monitor, Save, Mail, Phone } from "lucide-react";
import { account } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast"; // to'g'ri import (shadcn/ui toast)

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
    <div className="space-y-6 p-4 sm:p-6 lg:p-0">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Parolni o'zgartirish</CardTitle>
                <CardDescription>
                  Hisobingiz xavfsizligini ta'minlang
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
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
                  required
                  placeholder="••••••••"
                  className="mt-2"
                />
              </div>
              <div>
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
                  required
                  minLength={8}
                  placeholder="Kamida 8 belgi"
                  className="mt-2"
                />
              </div>
              <div>
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
                  required
                  placeholder="Yana bir marta kiriting"
                  className="mt-2"
                />
              </div>
              <Button type="submit" className="w-full" size="lg">
                <Save className="mr-2 h-5 w-5" />
                Parolni yangilash
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <Monitor className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Ilova temi</CardTitle>
                <CardDescription>
                  Ko'rinishni o'zingizga qulay qiling
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              onClick={() => handleThemeChange("light")}
              className={`w-full flex items-center justify-between p-5 rounded-xl border-2 transition-all ${
                theme === "light"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                  : "border-border hover:border-blue-300 dark:hover:border-blue-700 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
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
                <div className="h-3 w-3 rounded-full bg-blue-600"></div>
              )}
            </button>

            <button
              onClick={() => handleThemeChange("dark")}
              className={`w-full flex items-center justify-between p-5 rounded-xl border-2 transition-all ${
                theme === "dark"
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30"
                  : "border-border border-slate-500 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
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
                <div className="h-3 w-3 rounded-full bg-purple-600"></div>
              )}
            </button>

            <button
              onClick={() => handleThemeChange("system")}
              className={`w-full flex items-center justify-between p-5 rounded-xl border-2 transition-all ${
                theme === "system"
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                  : "border-border border-slate-500 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
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
                <div className="h-3 w-3 rounded-full bg-emerald-600"></div>
              )}
            </button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
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
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
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
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  notifications.email ? "bg-emerald-600" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                    notifications.email ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
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
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  notifications.push ? "bg-blue-600" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                    notifications.push ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <Phone className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="font-medium">SMS bildirishnomalari</p>
                  <p className="text-sm text-muted-foreground">Tez orada</p>
                </div>
              </div>
              <button
                disabled
                className="relative inline-flex h-7 w-12 items-center rounded-full bg-muted opacity-50"
              >
                <span className="inline-block h-5 w-5 translate-x-1 rounded-full bg-white" />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                <Globe className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Ilova tili</CardTitle>
                <CardDescription>
                  Hozircha faqat o'zbek tili mavjud
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-5 rounded-xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                    <Globe className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold">O'zbekcha (Ўзбекча)</p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">
                      Joriy til
                    </p>
                  </div>
                </div>
                <div className="h-3 w-3 rounded-full bg-emerald-600"></div>
              </div>

              <div className="p-5 rounded-xl border border-dashed border-muted-foreground/30 text-center text-muted-foreground">
                <p className="text-sm">Boshqa tillar tez orada qo'shiladi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
