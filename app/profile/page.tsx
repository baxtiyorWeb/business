"use client";

import { useEffect, useState, useRef } from "react";
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
  User,
  Mail,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  Upload,
  Camera,
  Trash2,
} from "lucide-react";
import { account, storage } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { ID, AVATARS_BUCKET_ID } from "@/lib/appwrite";
import { toast } from "@/components/ui/toast";

interface UserData {
  name: string;
  email: string;
  $createdAt: string;
  $id: string;
  avatar?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ name: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await account.get();
      let avatarUrl = "";
      try {
        const prefs = userData.prefs || {};
        if (prefs.avatarId) {
          const avatarFile = storage.getFileView(
            AVATARS_BUCKET_ID,
            prefs.avatarId
          );
          avatarUrl = avatarFile.toString();
        }
      } catch (e) {
        console.log("Avatar not found or error:", e);
      }

      setUser({
        ...(userData as any),
        avatar: avatarUrl,
      });
      setFormData({ name: userData.name || "" });
    } catch (error) {
      console.error("Error loading user:", error);
      router.push("/auth");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await account.updateName(formData.name);
      await loadUser();
      setEditing(false);
      toast.success("Ismingiz yangilandi.");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Ismni yangilashda xatolik yuz berdi.");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Faqat rasm fayllari qabul qilinadi");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Rasm hajmi 5MB dan kichik bo'lishi kerak");
      return;
    }

    try {
      setUploading(true);

      const userData = await account.get();
      const prefs = userData.prefs || {};
      if (prefs.avatarId) {
        try {
          await storage.deleteFile(AVATARS_BUCKET_ID, prefs.avatarId);
        } catch (e) {}
      }

      const fileId = ID.unique();
      await storage.createFile(AVATARS_BUCKET_ID, fileId, file);

      await account.updatePrefs({
        ...prefs,
        avatarId: fileId,
      });

      await loadUser();
      toast.success("Avatar muvaffaqiyatli yuklandi.");
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error(error.message || "Avatar yuklashda xatolik yuz berdi.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    if (!confirm("Avatarni oʻchirishni xohlaysizmi?")) return;

    try {
      const userData = await account.get();
      const prefs = userData.prefs || {};
      if (prefs.avatarId) {
        await storage.deleteFile(AVATARS_BUCKET_ID, prefs.avatarId);
        await account.updatePrefs({ ...prefs, avatarId: null });
        await loadUser();
        toast.success("Avatar oʻchirildi.");
      }
    } catch (error: any) {
      toast.error(error.message || "Avatar oʻchirishda xatolik yuz berdi.");
    }
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

  if (!user) return null;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Shaxsiy Ma'lumotlar */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Shaxsiy Ma'lumotlar</CardTitle>
            <CardDescription>
              Profilingizning asosiy ma'lumotlari
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative group">
                <div className="h-28 w-28 rounded-full bg-linear-to-br from-blue-500 to-purple-600 p-1 shadow-xl">
                  <div className="h-full w-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name || "Avatar"}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <User className="h-14 w-14 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="p-3 bg-white/90 hover:bg-white rounded-full transition-colors"
                      title="Yuklash"
                    >
                      <Camera className="h-5 w-5 text-slate-900" />
                    </button>
                    {user.avatar && (
                      <button
                        onClick={handleRemoveAvatar}
                        disabled={uploading}
                        className="p-3 bg-white/90 hover:bg-white rounded-full transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </button>
                    )}
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              <div className="text-center sm:text-left">
                <h3 className="text-2xl font-bold text-foreground">
                  {user.name || "Foydalanuvchi"}
                </h3>
                <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2 mt-1">
                  <Mail className="h-4 w-4 text-blue-500" />
                  {user.email}
                </p>
                {uploading && (
                  <p className="text-sm text-primary mt-2 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                    Yuklanmoqda...
                  </p>
                )}
              </div>
            </div>

            {/* Mobile Upload Button */}
            <div className="sm:hidden flex gap-3">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex-1"
              >
                <Upload className="mr-2 h-4 w-4 text-emerald-600" />
                {uploading ? "Yuklanmoqda..." : "Avatar Yuklash"}
              </Button>
              {user.avatar && (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={handleRemoveAvatar}
                  disabled={uploading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* User Info */}
            {!editing ? (
              <div className="space-y-5">
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Ism
                    </p>
                    <p className="font-semibold">
                      {user.name || "Kiritilmagan"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                  <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                    <Mail className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Email
                    </p>
                    <p className="font-semibold">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                  <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                    <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Ro'yxatdan o'tgan sana
                    </p>
                    <p className="font-semibold">
                      {formatDate(user.$createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                  <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
                    <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Hisob ID
                    </p>
                    <p className="font-mono font-semibold">
                      {user.$id.slice(0, 12)}...
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => setEditing(true)}
                  className="w-full"
                  size="lg"
                >
                  <Edit className="mr-2 h-5 w-5" />
                  Tahrirlash
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-base">
                    Ism
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ismingizni kiriting"
                    className="mt-2"
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleSave} className="flex-1" size="lg">
                    <Save className="mr-2 h-5 w-5" />
                    Saqlash
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditing(false);
                      setFormData({ name: user.name || "" });
                    }}
                    className="flex-1"
                    size="lg"
                  >
                    <X className="mr-2 h-5 w-5" />
                    Bekor qilish
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hisob Xavfsizligi */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Hisob Xavfsizligi</CardTitle>
            <CardDescription>Parol va xavfsizlik sozlamalari</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 rounded-xl border border-red-200 dark:border-red-900/50">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/50">
                  <Shield className="h-7 w-7 text-red-600 dark:text-red-400" />
                </div>
                <h4 className="text-lg font-semibold">Parolni o'zgartirish</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-5">
                Parolingizni xavfsiz saqlang va muntazam yangilang
              </p>
              <Button
                variant="default"
                onClick={() => router.push("/settings/password")}
              >
                Parolni o'zgartirish
              </Button>
            </div>

            <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl border border-blue-200 dark:border-blue-900/50">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
                  <Shield className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-lg font-semibold">
                  Ikki faktorli autentifikatsiya
                </h4>
              </div>
              <p className="text-sm text-muted-foreground mb-5">
                Hisobingizni qo‘shimcha himoya bilan ta'minlang
              </p>
              <Button variant="outline" disabled>
                Tez orada
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
