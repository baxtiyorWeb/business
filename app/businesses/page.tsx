'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  X
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  databases, 
  DATABASE_ID, 
  BUSINESSES_COLLECTION_ID, 
  TRANSACTIONS_COLLECTION_ID,
  ID, 
  Query 
} from '@/lib/appwrite';
import { account } from '@/lib/appwrite';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/toast';

interface Business {
  $id: string;
  name: string;
  type: 'store' | 'business' | 'education';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'store' as 'store' | 'business' | 'education',
    address: '',
    phone: '',
    email: '',
    description: '',
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
      router.push('/auth');
    }
  };

  const loadBusinesses = async () => {
    try {
      const userId = (await account.get()).$id;
      const response = await databases.listDocuments(
        DATABASE_ID,
        BUSINESSES_COLLECTION_ID,
        [Query.equal('userId', userId), Query.orderDesc('$createdAt')]
      );
      setBusinesses(response.documents as unknown as any[]);
    } catch (error) {
      console.error('Error loading businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userId = (await account.get()).$id;
      
      if (editingBusiness) {
        // Update existing business
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
      } else {
        // Create new business
        await databases.createDocument(
          DATABASE_ID,
          BUSINESSES_COLLECTION_ID,
          ID.unique(),
          {
            ...formData,
            userId,
          }
        );
      }
      
      setShowModal(false);
      setEditingBusiness(null);
      setFormData({
        name: '',
        type: 'store',
        address: '',
        phone: '',
        email: '',
        description: '',
      });
      loadBusinesses();
    } catch (error) {
      console.error('Error saving business:', error);
      toast.error('Xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
    }
  };

  const handleEdit = (business: Business) => {
    setEditingBusiness(business);
    setFormData({
      name: business.name,
      type: business.type,
      address: business.address || '',
      phone: business.phone || '',
      email: business.email || '',
      description: business.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu biznesni o\'chirishni xohlaysizmi?')) return;
    
    try {
      await databases.deleteDocument(DATABASE_ID, BUSINESSES_COLLECTION_ID, id);
      loadBusinesses();
    } catch (error) {
      console.error('Error deleting business:', error);
      toast.error('Xatolik yuz berdi.');
    }
  };

  const filteredBusinesses = businesses.filter((business) =>
    business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    business.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      store: 'Do\'kon',
      business: 'Biznes',
      education: 'O\'quv Markazi',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-slate-50 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
            Bizneslar
          </h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Barcha bizneslaringizni boshqaring
          </p>
        </div>
        <Button 
          className="w-full sm:w-auto"
          onClick={() => {
          setEditingBusiness(null);
          setFormData({
            name: '',
            type: 'store',
            address: '',
            phone: '',
            email: '',
            description: '',
          });
          setShowModal(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Yangi Biznes
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Bizneslarni qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 text-sm sm:text-base"
        />
      </div>

      {/* Businesses Grid */}
      {filteredBusinesses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Store className="h-12 w-12 text-slate-400 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              {searchQuery ? 'Hech narsa topilmadi' : 'Hali biznes qo\'shilmagan'}
            </p>
            {!searchQuery && (
              <Button className="mt-4" onClick={() => setShowModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Birinchi Biznesni Qo'shing
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBusinesses.map((business) => (
            <Card key={business.$id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      <Store className="h-5 w-5 mr-2 text-slate-600 dark:text-slate-400" />
                      {business.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {getTypeLabel(business.type)}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(business)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(business.$id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {business.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {business.description}
                  </p>
                )}
                <div className="space-y-2 text-sm">
                  {business.address && (
                    <div className="flex items-center text-slate-600 dark:text-slate-400">
                      <MapPin className="h-4 w-4 mr-2" />
                      {business.address}
                    </div>
                  )}
                  {business.phone && (
                    <div className="flex items-center text-slate-600 dark:text-slate-400">
                      <Phone className="h-4 w-4 mr-2" />
                      {business.phone}
                    </div>
                  )}
                  {business.email && (
                    <div className="flex items-center text-slate-600 dark:text-slate-400">
                      <Mail className="h-4 w-4 mr-2" />
                      {business.email}
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Yaratilgan: {formatDate(business.createdAt)}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/businesses/${business.$id}`)}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Batafsil
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <Card className="w-full sm:w-full sm:max-w-md max-h-[90vh] sm:max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-lg">
            <CardHeader className="sticky top-0 bg-white dark:bg-slate-950 border-b z-10">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg sm:text-xl">
                  {editingBusiness ? 'Biznesni Tahrirlash' : 'Yangi Biznes'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowModal(false);
                    setEditingBusiness(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="name">Biznes Nomi *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Masalan: Mening Do'konim"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Biznes Turi *</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                    required
                  >
                    <option value="store">Do'kon</option>
                    <option value="business">Biznes</option>
                    <option value="education">O'quv Markazi</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="address">Manzil</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Manzil"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+998 90 123 45 67"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Tavsif</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                    placeholder="Biznes haqida qisqacha ma'lumot"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingBusiness ? 'Saqlash' : 'Qo\'shish'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false);
                      setEditingBusiness(null);
                    }}
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

