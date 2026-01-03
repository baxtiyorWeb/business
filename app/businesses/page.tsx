"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/ui/table"; // <-- Shadcn Table
import {
  Store,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Search,
  X,
  Building2,
  Briefcase,
  GraduationCap,
  MoreVertical,
  Calendar,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  databases,
  DATABASE_ID,
  BUSINESSES_COLLECTION_ID,
  ID,
  Query,
} from "@/lib/appwrite";
import { account } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";

interface Business {
  $id: string;
  name: string;
  type: "store" | "business" | "education";
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  userId: string;
  $createdAt?: string;
}

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "store" as "store" | "business" | "education",
    address: "",
    phone: "",
    email: "",
    description: "",
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadBusinesses();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const checkAuth = async () => {
    try {
      await account.get();
    } catch (error) {
      router.push("/auth");
    }
  };

  const loadBusinesses = async () => {
    try {
      const userId = (await account.get()).$id;
      const response = await databases.listDocuments(
        DATABASE_ID,
        BUSINESSES_COLLECTION_ID,
        [Query.equal("userId", userId), Query.orderDesc("$createdAt")]
      );
      setBusinesses(response.documents as any);
    } catch (error) {
      console.error("Error loading businesses:", error);
      toast.error("Bizneslarni yuklashda muammo yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (business?: Business) => {
    if (business) {
      setEditingBusiness(business);
      setFormData({
        name: business.name,
        type: business.type,
        address: business.address || "",
        phone: business.phone || "",
        email: business.email || "",
        description: business.description || "",
      });
    } else {
      setEditingBusiness(null);
      setFormData({
        name: "",
        type: "store",
        address: "",
        phone: "",
        email: "",
        description: "",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userId = (await account.get()).$id;

      if (editingBusiness) {
        await databases.updateDocument(
          DATABASE_ID,
          BUSINESSES_COLLECTION_ID,
          editingBusiness.$id,
          {
            name: formData.name,
            type: formData.type,
            address: formData.address,
            phone: formData.phone,
            email: formData.email,
            description: formData.description,
          }
        );
        toast.success("Biznes muvaffaqiyatli yangilandi.");
      } else {
        await databases.createDocument(
          DATABASE_ID,
          BUSINESSES_COLLECTION_ID,
          ID.unique(),
          { ...formData, userId }
        );
        toast.success("Yangi biznes qo'shildi.");
      }

      setShowModal(false);
      setEditingBusiness(null);
      loadBusinesses();
    } catch (error) {
      console.error("Error saving business:", error);
      toast.error("Saqlashda xatolik yuz berdi.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bu biznesni butunlay oʻchirishni xohlaysizmi?"))
      return;

    try {
      await databases.deleteDocument(DATABASE_ID, BUSINESSES_COLLECTION_ID, id);
      toast.success("Biznes muvaffaqiyatli o'chirildi.");
      loadBusinesses();
    } catch (error) {
      toast.error("O'chirishda muammo yuz berdi.");
    }
  };

  const filteredBusinesses = businesses.filter(
    (business) =>
      business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (business.address &&
        business.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "store":
        return {
          label: "Do'kon",
          icon: Store,
          color:
            "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
        };
      case "business":
        return {
          label: "Biznes",
          icon: Briefcase,
          color:
            "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
        };
      case "education":
        return {
          label: "O'quv Markazi",
          icon: GraduationCap,
          color:
            "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
        };
      default:
        return {
          label: type,
          icon: Building2,
          color:
            "bg-slate-50 text-slate-700 dark:bg-slate-950/30 dark:text-slate-400",
        };
    }
  };

  const handleRowClick = (businessId: string) => {
    router.push(`/businesses/${businessId}`);
  };

  const handleActionClick = (e: React.MouseEvent, businessId: string) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === businessId ? null : businessId);
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
    <div className="max-w-7xl mx-auto space-y-2 pb-0 px-4 sm:px-6 lg:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
        
        </div>
        <Button size="lg" onClick={() => openModal()}>
          <Plus className="mr-2 h-5 w-5" />
          Yangi Biznes
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Biznes nomi, turi yoki manzil bo'yicha qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 border-slate-300 focus:border-slate-500 outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      {/* Empty State */}
      {filteredBusinesses.length === 0 ? (
        <Card className="border-dashed border-slate-300">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-6 rounded-full bg-muted/50 mb-6">
              <Store className="h-16 w-16 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? "Hech narsa topilmadi" : "Hozircha bizneslar yoʻq"}
            </h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              {searchQuery
                ? "Boshqa kalit soʻz bilan qidirib koʻring"
                : "Birinchi biznesingizni qoʻshing va moliyaviy hisobotlarni boshlang"}
            </p>
            {!searchQuery && (
              <Button size="lg" onClick={() => openModal()}>
                <Plus className="mr-2 h-5 w-5" />
                Birinchi Biznesni Qo'shish
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop: Shadcn Table */}
          <div className="hidden lg:block">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Biznes</TableHead>
                    <TableHead>Turi</TableHead>
                    <TableHead>Aloqa</TableHead>
                    <TableHead>Manzil</TableHead>
                    <TableHead>Yaratilgan</TableHead>
                    <TableHead className="text-right">Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBusinesses.map((business) => {
                    const {
                      label,
                      icon: Icon,
                      color,
                    } = getTypeConfig(business.type);
                    return (
                      <TableRow
                        key={business.$id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(business.$id)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-4">
                            <div
                              className={`p-3 rounded-xl ${
                                color.split(" ")[0]
                              } ${color.split(" ")[1]}`}
                            >
                              <Icon className="h-6 w-6" />
                            </div>
                            <div>
                              <div className="font-semibold">
                                {business.name}
                              </div>
                              {business.description && (
                                <div className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                  {business.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={color}>
                            {label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            {business.phone && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                {business.phone}
                              </div>
                            )}
                            {business.email && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                {business.email}
                              </div>
                            )}
                            {!business.phone && !business.email && "—"}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {business.address || "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(business?.$createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openModal(business);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(business.$id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Mobile: Cards */}
          <div className="lg:hidden grid gap-4">
            {filteredBusinesses.map((business) => {
              const { label, icon: Icon, color } = getTypeConfig(business.type);
              return (
                <Card
                  key={business.$id}
                  className="hover:shadow-md transition-shadow"
                  onClick={() => handleRowClick(business.$id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-xl ${color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {business.name}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={`mt-2 ${color}`}
                          >
                            {label}
                          </Badge>
                        </div>
                      </div>
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleActionClick(e, business.$id)}
                        >
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                        {activeDropdown === business.$id && (
                          <div className="absolute right-0 mt-2 w-48 bg-card border rounded-lg shadow-lg z-10">
                            <button
                              className="w-full px-4 py-3 text-left hover:bg-muted flex items-center gap-3"
                              onClick={(e) => {
                                e.stopPropagation();
                                openModal(business);
                                setActiveDropdown(null);
                              }}
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                              Tahrirlash
                            </button>
                            <button
                              className="w-full px-4 py-3 text-left hover:bg-muted flex items-center gap-3 border-t"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(business.$id);
                                setActiveDropdown(null);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                              O'chirish
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {business.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {business.description}
                      </p>
                    )}

                    <div className="space-y-3 text-sm text-muted-foreground">
                      {business.address && (
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 mt-0.5" />
                          <span>{business.address}</span>
                        </div>
                      )}
                      {business.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5" />
                          <span>{business.phone}</span>
                        </div>
                      )}
                      {business.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5" />
                          <span>{business.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 pt-3 border-t">
                        <Calendar className="h-5 w-5" />
                        <span>{formatDate(business?.$createdAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Modal – o'zgarmadi, faqat slate border saqlangan */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background">
            <CardHeader className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">
                  {editingBusiness
                    ? "Biznesni Tahrirlash"
                    : "Yangi Biznes Qo'shish"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowModal(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Biznes Nomi *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Masalan: Super Market"
                      required
                      className="h-11 border-slate-300 focus:border-slate-500 outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Biznes Turi *</Label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as any,
                        })
                      }
                      required
                      className="w-full h-11 px-4 rounded-lg border border-slate-300 bg-background text-foreground focus:border-slate-500 focus:outline-none transition-colors"
                    >
                      <option value="store">Do'kon</option>
                      <option value="business">Umumiy Biznes</option>
                      <option value="education">O'quv Markazi</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Manzil</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="Toshkent, Chilanzar..."
                      className="h-11 border-slate-300 focus:border-slate-500 outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Telefon</Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+998 90 123 45 67"
                      className="h-11 border-slate-300 focus:border-slate-500 outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="info@biznes.uz"
                      className="h-11 border-slate-300 focus:border-slate-500 outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Tavsif (ixtiyoriy)</Label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      placeholder="Bu biznes haqida qisqacha ma'lumot..."
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-background text-foreground placeholder:text-muted-foreground focus:border-slate-500 focus:outline-none resize-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <Button type="submit" size="lg" className="flex-1 h-12">
                    {editingBusiness ? "Saqlash" : "Qo'shish"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-12"
                    onClick={() => setShowModal(false)}
                  >
                    Bekor qilish
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
