"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Store,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Search,
  Building2,
  Briefcase,
  GraduationCap,
  MoreVertical,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton"; // <-- Bu komponent bor deb faraz qilamiz
import { formatDate } from "@/lib/utils";
import {
  databases,
  DATABASE_ID,
  BUSINESSES_COLLECTION_ID,
  ID,
  Query,
  account,
} from "@/lib/appwrite";
import { toast } from "sonner";

interface Business {
  $id: string;
  name: string;
  type: "store" | "business" | "education";
  address?: string;
  phone?: string;
  description?: string;
  userId: string;
  $createdAt: string;
}

const inputBaseStyles =
  "focus-visible:ring-0 focus-visible:ring-offset-0 border-slate-300 dark:border-slate-700 focus:border-primary shadow-none outline-none bg-background";

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    type: "store" as "store" | "business" | "education",
    address: "",
    phone: "",
    description: "",
  });

  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      try {
        await account.get();
        await loadBusinesses();
      } catch (error) {
        router.push("/auth");
      }
    };
    init();
  }, []);

  const loadBusinesses = async () => {
    try {
      const user = await account.get();
      const response = await databases.listDocuments(
        DATABASE_ID,
        BUSINESSES_COLLECTION_ID,
        [Query.equal("userId", user.$id), Query.orderDesc("$createdAt")]
      );
      setBusinesses(response.documents as any);
    } catch (error) {
      toast.error("Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (business?: Business) => {
    if (business) {
      setEditingBusiness(business);
      setFormData({
        name: business.name,
        type: business.type,
        address: business.address || "",
        phone: business.phone || "",
        description: business.description || "",
      });
    } else {
      setEditingBusiness(null);
      setFormData({
        name: "",
        type: "store",
        address: "",
        phone: "",
        description: "",
      });
    }
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const user = await account.get();
      if (editingBusiness) {
        await databases.updateDocument(
          DATABASE_ID,
          BUSINESSES_COLLECTION_ID,
          editingBusiness.$id,
          { ...formData }
        );
        toast.success("Yangilandi");
      } else {
        await databases.createDocument(
          DATABASE_ID,
          BUSINESSES_COLLECTION_ID,
          ID.unique(),
          { ...formData, userId: user.$id }
        );
        toast.success("Qo'shildi");
      }
      setOpen(false);
      loadBusinesses();
    } catch (error) {
      toast.error("Xatolik");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    try {
      await databases.deleteDocument(DATABASE_ID, BUSINESSES_COLLECTION_ID, id);
      toast.success("O'chirildi");
      loadBusinesses();
    } catch (error) {
      toast.error("Xatolik");
    }
  };

  const getTypeConfig = (type: string) => {
    const configs = {
      store: {
        label: "Do'kon",
        icon: Store,
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      },
      business: {
        label: "Biznes",
        icon: Briefcase,
        color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      },
      education: {
        label: "O'quv Markazi",
        icon: GraduationCap,
        color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      },
    };
    return (
      configs[type as keyof typeof configs] || {
        label: type,
        icon: Building2,
        color: "bg-slate-500/10 text-slate-500",
      }
    );
  };

  const filtered = businesses.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Skeleton komponenti yo'q bo'lsa, oddiy div bilan animatsiya qilamiz
  const SkeletonLine = ({ width = "100%", height = "h-4" }: { width?: string; height?: string }) => (
    <div className={`bg-muted animate-pulse rounded-md ${height} ${width}`} />
  );

  if (loading) {
    return (
      <div className="max-w-full mx-auto space-y-6 p-0 lg:p-0 relative min-h-screen pb-20">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="relative w-full md:max-w-md">
            <SkeletonLine height="h-11" />
          </div>
          <div className="hidden md:block">
            <SkeletonLine width="w-40" height="h-11" />
          </div>
        </div>

        {/* Mobile FAB Skeleton */}
        <div className="md:hidden fixed bottom-24 right-6 z-50">
          <Skeleton className="h-14 w-14 rounded-full" />
        </div>

        {/* Desktop Table Skeleton */}
        <div className="hidden lg:block bg-card border rounded-2xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Biznes</TableHead>
                <TableHead>Turi</TableHead>
                <TableHead>Aloqa</TableHead>
                <TableHead>Sana</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(6)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-xl" />
                      <SkeletonLine width="w-48" height="h-5" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <SkeletonLine width="w-24" height="h-6" />
                  </TableCell>
                  <TableCell>
                    <SkeletonLine width="w-32" height="h-4" />
                  </TableCell>
                  <TableCell>
                    <SkeletonLine width="w-28" height="h-4" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Skeleton className="h-9 w-9" />
                      <Skeleton className="h-9 w-9" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards Skeleton */}
        <div className="lg:hidden grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="space-y-3">
                      <SkeletonLine width="w-52" height="h-6" />
                      <SkeletonLine width="w-32" height="h-6" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-10 rounded-md" />
                </div>
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <SkeletonLine width="w-64" height="h-4" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <SkeletonLine width="w-40" height="h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto space-y-6 p-0 lg:p-0 relative min-h-screen pb-20">
      {/* Search & Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Qidirish..."
            className={`pl-10 h-11 ${inputBaseStyles}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="hidden md:flex shadow-sm"
        >
          <Plus className="mr-2 h-5 w-5" /> Yangi Biznes
        </Button>
      </div>

      {/* Floating Action Button - Mobile */}
      <Button
        onClick={() => handleOpenModal()}
        size="icon"
        className="md:hidden fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full shadow-2xl active:scale-90 transition-transform"
      >
        <Plus className="h-7 w-7" />
      </Button>

      {/* Content */}
      <div className="space-y-4">
        {/* Desktop Table */}
        <div className="hidden lg:block bg-card border rounded-2xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead>Biznes</TableHead>
                <TableHead>Turi</TableHead>
                <TableHead>Aloqa</TableHead>
                <TableHead>Sana</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    Hech nima topilmadi
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((b) => {
                  const config = getTypeConfig(b.type);
                  return (
                    <TableRow
                      key={b.$id}
                      className="hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => router.push(`/businesses/${b.$id}`)}
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${config.color}`}>
                            <config.icon className="h-5 w-5" />
                          </div>
                          <span className="font-semibold">{b.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`${config.color} border-none`}
                        >
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {b.phone || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(b.$createdAt)}
                      </TableCell>
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenModal(b)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDelete(b.$id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden grid gap-4">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Hech nima topilmadi
            </div>
          ) : (
            filtered.map((b) => {
              const config = getTypeConfig(b.type);
              return (
                <Card
                  key={b.$id}
                  className="bg-card hover:border-primary/50 transition-colors shadow-sm"
                  onClick={() => router.push(`/businesses/${b.$id}`)}
                >
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-xl ${config.color}`}>
                          <config.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg leading-tight">
                            {b.name}
                          </h4>
                          <Badge
                            variant="secondary"
                            className={`mt-1 ${config.color} border-none`}
                          >
                            {config.label}
                          </Badge>
                        </div>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenModal(b)}>
                              <Edit className="mr-2 h-4 w-4" /> Tahrirlash
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(b.$id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> O'chirish
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t space-y-2">
                      {b.address && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground leading-none">
                          <MapPin className="h-3.5 w-3.5" /> {b.address}
                        </div>
                      )}
                      {b.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground leading-none">
                          <Phone className="h-3.5 w-3.5" /> {b.phone}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingBusiness ? "Biznesni tahrirlash" : "Yangi biznes qo'shish"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Biznes nomi *</Label>
              <Input
                required
                className={inputBaseStyles}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Turi</Label>
                <select
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:border-primary`}
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as any })
                  }
                >
                  <option value="store">Do'kon</option>
                  <option value="business">Biznes</option>
                  <option value="education">O'quv markazi</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input
                  className={inputBaseStyles}
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Manzil</Label>
              <Input
                className={inputBaseStyles}
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Tavsif (ixtiyoriy)</Label>
              <textarea
                className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary`}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Bekor qilish
              </Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}{" "}
                Saqlash
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}