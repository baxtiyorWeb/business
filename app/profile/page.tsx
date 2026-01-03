"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Edit2,
  Check,
  X,
  Camera,
  Trash2,
  ChevronRight,
  Lock,
} from "lucide-react";
import { account, storage, ID, AVATARS_BUCKET_ID } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

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
          avatarUrl = storage
            .getFileView(AVATARS_BUCKET_ID, prefs.avatarId)
            .toString();
        }
      } catch (e) {
        console.log(e);
      }

      setUser({ ...(userData as any), avatar: avatarUrl });
      setFormData({ name: userData.name || "" });
    } catch (error) {
      router.push("/auth");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!formData.name.trim()) return;
    try {
      await account.updateName(formData.name);
      await loadUser();
      setEditing(false);
      toast.success("Ism yangilandi");
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
      await account.updatePrefs({ ...prefs, avatarId: fileId });
      await loadUser();
      toast.success("Avatar yangilandi");
    } catch (error) {
      toast.error("Yuklashda xatolik");
    } finally {
      setUploading(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  if (!user) return null;

  return (
    <div className="max-w-dvw mx-auto space-y-6 ">
      {/* Header & Avatar Section */}
      <div className="flex flex-col items-center sm:flex-row sm:items-end gap-5 px-2">
        <div className="relative group">
          <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-3xl bg-linear-to-tr from-blue-600 to-purple-600 p-1 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-300">
            <div className="h-full w-full rounded-[20px] bg-card flex items-center justify-center overflow-hidden -rotate-3 group-hover:rotate-0 transition-transform duration-300">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-colors border-4 border-background"
          >
            {uploading ? (
              <div className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>

        <div className="text-center sm:text-left space-y-1 flex-1 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-center sm:justify-start gap-3">
            {editing ? (
              <div className="flex flex-col gap-3 w-full max-w-md mx-auto sm:mx-0">
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  placeholder="Yangi ism kiriting"
                  className="h-12 text-xl font-bold border-slate-300 focus:border-slate-500 outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 text-emerald-600 hover:bg-emerald-50"
                    onClick={handleSaveName}
                  >
                    <Check className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setEditing(false);
                      setFormData({ name: user.name || "" });
                    }}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center">
                <h1 className="text-2xl font-bold tracking-tight">
                  {user.name || "Foydalanuvchi"}
                </h1>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-10 w-10 text-muted-foreground hover:bg-muted"
                  onClick={() => setEditing(true)}
                >
                  <Edit2 className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
          <p className="text-muted-foreground text-sm flex items-center justify-center sm:justify-start gap-1.5">
            <Mail className="h-3.5 w-3.5" /> {user.email}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Card className="border-none bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Hisob ma'lumotlari
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between p-0 lg:p-3 rounded-xl hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-sm">A'zolik sanasi</span>
              </div>
              <span className="text-sm font-medium">
                {formatDate(user.$createdAt)}
              </span>
            </div>
            <div className="flex items-center justify-between  p-0  lg:p-3 rounded-xl hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-emerald-500" />
                <span className="text-sm">Hisob ID</span>
              </div>
              <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                {user.$id.slice(0, 8)}...
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Xavfsizlik
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              onClick={() => router.push("/settings/password")}
              className="w-full flex items-center justify-between  p-0 py-2 px-2 lg:p-3 rounded-xl bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg text-white shadow-blue-500/20 shadow-lg">
                  <Lock className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">Parolni o'zgartirish</p>
                  <p className="text-[10px] text-muted-foreground">
                    Oxirgi marta 3 oy oldin
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center justify-between  p-0 py-2 px-2 lg:p-3 rounded-xl bg-muted/30 opacity-60 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-400 rounded-lg text-white">
                  <Shield className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">2-bosqichli himoya</span>
              </div>
              <span className="text-[10px] bg-muted px-2 py-1 rounded-md uppercase font-bold">
                Yaqinda
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {user.avatar && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" /> Avatarni o'chirish
          </Button>
        </div>
      )}
    </div>
  );
}
