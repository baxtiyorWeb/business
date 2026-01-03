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
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Search,
  X,
  Building2,
  Briefcase,
  GraduationCap,
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
  createdAt: string;
}

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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
        return { label: "Do'kon", icon: Store, color: "emerald" };
      case "business":
        return { label: "Biznes", icon: Briefcase, color: "blue" };
      case "education":
        return { label: "O'quv Markazi", icon: GraduationCap, color: "purple" };
      default:
        return { label: type, icon: Building2, color: "slate" };
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

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Bizneslar</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Barcha bizneslaringizni boshqaring
          </p>
        </div>
        <Button size="lg" onClick={() => openModal()} className="w-full sm:w-auto">
          <Plus className="mr-2 h-5 w-5" />
          Yangi Biznes
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
        <Input
          placeholder="Qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 sm:pl-10 h-10 sm:h-12 w-full"
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
              <Button size="lg" onClick={() => openModal()} className="w-full sm:w-auto">
                <Plus className="mr-2 h-5 w-5" />
                Birinchi Biznesni Qo'shish
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredBusinesses.map((business) => {
            const { label } = getTypeConfig(business.type);

            return (
              <Card
                key={business.$id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col"
              >
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex justify-between items-start gap-2 sm:gap-3">
                    <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg font-semibold leading-tight line-clamp-2">
                          {business.name}
                        </CardTitle>
                        <Badge variant="secondary" className="mt-1.5 text-xs">
                          {label}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 sm:h-10 sm:w-10"
                        onClick={() => openModal(business)}
                      >
                        <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 sm:h-10 sm:w-10"
                        onClick={() => handleDelete(business.$id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col justify-between pt-0 space-y-3 sm:space-y-4">
                  {business.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {business.description}
                    </p>
                  )}

                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
                    {business.address && (
                      <div className="flex items-start gap-2 sm:gap-3">
                        <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 break-words">{business.address}</span>
                      </div>
                    )}
                    {business.phone && (
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 shrink-0" />
                        <span className="truncate">{business.phone}</span>
                      </div>
                    )}
                    {business.email && (
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{business.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                    <p className="text-xs text-muted-foreground">
                      {formatDate(business.createdAt)}
                    </p>
                    <Button
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => router.push(`/businesses/${business.$id}`)}
                    >
                      <DollarSign className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Batafsil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal - To'liq responsive */}
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
              <div className="space-y-4 sm:space-y-5">
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
                  <Button
                    onClick={handleSubmit}
                    size="lg"
                    className="flex-1 h-11"
                  >
                    {editingBusiness ? "Saqlash" : "Qo'shish"}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-11"
                    onClick={() => setShowModal(false)}
                  >
                    Bekor qilish
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}