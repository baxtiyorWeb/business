"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Moon,
  Sun,
  Bell,
  Globe,
  Shield,
  LogOut,
  ChevronRight,
  Smartphone,
  Mail,
  Lock,
  Trash2,
} from "lucide-react";
import { account } from "@/lib/appwrite";
import { toast } from "sonner";

// Skeleton komponenti
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded-md bg-muted ${className}`} />
);

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Foydalanuvchi autentifikatsiyasini tekshirish
    const checkAuth = async () => {
      try {
        await account.get();
        setLoading(false);
      } catch (error) {
        router.push("/auth");
      }
    };
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    if (!confirm("Hisobdan chiqishni tasdiqlaysizmi?")) return;
    try {
      await account.deleteSession("current");
      toast.success("Muvaffaqiyatli chiqildi");
      router.push("/auth");
    } catch (error) {
      toast.error("Chiqishda xatolik");
    }
  };

  // LOADING SKELETON
  if (loading) {
    return (
      <div className="max-w-dvw mx-auto space-y-4 px-0 lg:px-4 py-0 pb-0">
        <div className="space-y-2 text-center sm:text-left">
          <Skeleton className="h-10 w-64 mx-auto sm:mx-0" />
          <Skeleton className="h-5 w-96 mx-auto sm:mx-0" />
        </div>

        <div className="grid gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-none shadow-sm">
              <CardHeader>
                <Skeleton className="h-6 w-56" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div
                    key={j}
                    className="flex items-center justify-between p-4 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div>
                        <Skeleton className="h-5 w-52" />
                        <Skeleton className="h-4 w-60 mt-2" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-5" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          <div className="pt-6">
            <Skeleton className="h-12 w-full max-w-md mx-auto rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden px-0 sm:px-0 lg:px-0">
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Sozlamalar</h1>
        <p className="text-muted-foreground mt-2">
          Hisobingiz va ilova sozlamalarini boshqaring
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="border-none bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Ko'rinish</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-purple-500/10 rounded-lg text-purple-600">
                  <Moon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Qorong'i rejim</p>
                  <p className="text-sm text-muted-foreground">
                    Tizim sozlamasiga moslashadi
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </button>

            <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-600">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Til</p>
                  <p className="text-sm text-muted-foreground">O'zbekcha</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </button>
          </CardContent>
        </Card>

        <Card className="border-none bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Bildirishnomalar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-600">
                  <Bell className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Push bildirishnomalar</p>
                  <p className="text-sm text-muted-foreground">
                    Yangi tranzaksiyalar haqida xabar berish
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </button>

            <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-orange-500/10 rounded-lg text-orange-600">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Email xabarnomalar</p>
                  <p className="text-sm text-muted-foreground">
                    Hisob faoliyati haqida haftalik hisobot
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </button>
          </CardContent>
        </Card>

        <Card className="border-none bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Xavfsizlik</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <button
              onClick={() => router.push("/settings/password")}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-blue-500 rounded-lg text-white shadow-lg shadow-blue-500/20">
                  <Lock className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Parolni o'zgartirish</p>
                  <p className="text-sm text-muted-foreground">
                    Hisobingizni himoya qilish uchun yangi parol o'rnating
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="w-full flex items-center justify-between p-4 rounded-xl bg-muted/30 opacity-60 cursor-not-allowed">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-slate-400 rounded-lg text-white">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium">2-bosqichli autentifikatsiya</p>
                  <p className="text-sm text-muted-foreground">
                    Qo'shimcha himoya qatlami
                  </p>
                </div>
              </div>
              <span className="text-xs bg-muted px-3 py-1 rounded-md uppercase font-bold">
                Yaqinda
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Hisob</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-destructive/10 rounded-lg text-destructive">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-destructive">Hisobni o'chirish</p>
                  <p className="text-sm text-muted-foreground">
                    Barcha ma'lumotlar butunlay o'chiriladi
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </button>
          </CardContent>
        </Card>
      </div>

      <div className="pt-6">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full max-w-md mx-auto h-12 text-lg font-medium rounded-xl border-destructive/50 text-destructive hover:bg-destructive/5"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Hisobdan chiqish
        </Button>
      </div>
    </div>
  );
}