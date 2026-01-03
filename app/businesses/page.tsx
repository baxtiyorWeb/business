"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

  // Close dropdown when clicking outside
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
    <div className="space-y-4 px-5 sm:px-0 lg:px-0 sm:space-y-6 w-full max-w-full ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div></div>
        <Button
          size="lg"
          onClick={() => openModal()}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-5 w-5" />
          Yangi Biznes
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full">
        <Search className="absolute  left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
        <Input
          placeholder="Qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 sm:pl-10 h-10 sm:h-12 w-1/4"
        />
      </div>

      {/* Empty State */}
      {filteredBusinesses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
            <div className="p-4 sm:p-6 rounded-full bg-muted/50 mb-4 sm:mb-6">
              <Store className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              {searchQuery ? "Hech narsa topilmadi" : "Hozircha bizneslar yoʻq"}
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-sm">
              {searchQuery
                ? "Boshqa kalit soʻz bilan qidirib koʻring"
                : "Birinchi biznesingizni qoʻshing va daromadlarni kuzatishni boshlang"}
            </p>
            {!searchQuery && (
              <Button
                size="lg"
                onClick={() => openModal()}
                className="w-full sm:w-auto"
              >
                <Plus className="mr-2 h-5 w-5" />
                Birinchi Biznesni Qo'shish
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table View - Hidden on mobile */}
          <div className="hidden md:block">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-semibold text-sm">
                        Biznes
                      </th>
                      <th className="text-left p-4 font-semibold text-sm">
                        Turi
                      </th>
                      <th className="text-left p-4 font-semibold text-sm">
                        Aloqa
                      </th>
                      <th className="text-left p-4 font-semibold text-sm">
                        Manzil
                      </th>
                      <th className="text-left p-4 font-semibold text-sm">
                        Sana
                      </th>
                      <th className="text-right p-4 font-semibold text-sm">
                        Amallar
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBusinesses.map((business) => {
                      const {
                        label,
                        icon: Icon,
                        color,
                      } = getTypeConfig(business.type);

                      return (
                        <tr
                          key={business.$id}
                          onClick={() => handleRowClick(business.$id)}
                          className="border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  color.split(" ")[0]
                                } ${color.split(" ")[1]}`}
                              >
                                <Icon className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="font-semibold">
                                  {business.name}
                                </div>
                                {business.description && (
                                  <div className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
                                    {business.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="secondary" className={color}>
                              {label}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1 text-sm">
                              {business.phone && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Phone className="h-3.5 w-3.5" />
                                  <span>{business.phone}</span>
                                </div>
                              )}
                              {business.email && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Mail className="h-3.5 w-3.5" />
                                  <span className="truncate max-w-[200px]">
                                    {business.email}
                                  </span>
                                </div>
                              )}
                              {!business.phone && !business.email && (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            {business.address ? (
                              <div className="flex items-start gap-2 text-sm text-muted-foreground max-w-xs">
                                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                <span className="line-clamp-2">
                                  {business.address}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(business?.$createdAt)}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openModal(business);
                                }}
                              >
                                <Edit className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(business.$id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Mobile Card View - Visible only on mobile */}
          <div className="md:hidden grid gap-4">
            {filteredBusinesses.map((business) => {
              const { label, icon: Icon, color } = getTypeConfig(business.type);

              return (
                <Card
                  key={business.$id}
                  className="overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => handleRowClick(business.$id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg ${color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base line-clamp-1">
                            {business.name}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={`mt-1.5 text-xs ${color}`}
                          >
                            {label}
                          </Badge>
                        </div>
                      </div>

                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => handleActionClick(e, business.$id)}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>

                        {activeDropdown === business.$id && (
                          <div className="absolute right-0 mt-1 w-40 bg-background border rounded-lg shadow-lg z-10">
                            <button
                              className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
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
                              className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 border-t"
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
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {business.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm">
                      {business.address && (
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">
                            {business.address}
                          </span>
                        </div>
                      )}
                      {business.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4 shrink-0" />
                          <span>{business.phone}</span>
                        </div>
                      )}
                      {business.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4 shrink-0" />
                          <span className="truncate">{business.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground pt-2 border-t">
                        <Calendar className="h-4 w-4 shrink-0" />
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-0 sm:p-4">
          <Card className="w-full h-full sm:h-auto sm:max-w-lg sm:max-h-[90vh] overflow-y-auto sm:rounded-lg rounded-none">
            <CardHeader className="border-b sticky top-0 bg-background z-10 shadow-sm">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl sm:text-2xl">
                  {editingBusiness ? "Biznesni Tahrirlash" : "Yangi Biznes"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowModal(false)}
                  className="h-8 w-8 sm:h-10 sm:w-10"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6 pb-4 sm:pb-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <div>
                  <Label htmlFor="name" className="text-sm sm:text-base">
                    Biznes Nomi *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="Masalan: Super Market"
                    className="mt-1.5 sm:mt-2 h-10 sm:h-11"
                  />
                </div>

                <div>
                  <Label htmlFor="type" className="text-sm sm:text-base">
                    Biznes Turi *
                  </Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as any })
                    }
                    className="mt-1.5 sm:mt-2 flex h-10 sm:h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  >
                    <option value="store">Do'kon</option>
                    <option value="business">Umumiy Biznes</option>
                    <option value="education">O'quv Markazi</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm sm:text-base">
                    Manzil
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Toshkent, Chilanzar..."
                    className="mt-1.5 sm:mt-2 h-10 sm:h-11"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm sm:text-base">
                    Telefon
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+998 90 123 45 67"
                    className="mt-1.5 sm:mt-2 h-10 sm:h-11"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm sm:text-base">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="info@biznes.uz"
                    className="mt-1.5 sm:mt-2 h-10 sm:h-11"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm sm:text-base">
                    Tavsif
                  </Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="mt-1.5 sm:mt-2 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    placeholder="Qisqa ma'lumot..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-4">
                  <Button type="submit" size="lg" className="flex-1 h-11">
                    {editingBusiness ? "Saqlash" : "Qo'shish"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-11"
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
