"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  ArrowLeft,
  Plus,
  DollarSign,
  Calendar,
  User,
  Edit,
  Trash2,
  X,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  databases,
  DATABASE_ID,
  BUSINESSES_COLLECTION_ID,
  TRANSACTIONS_COLLECTION_ID,
  ID,
  Query,
} from "@/lib/appwrite";
import { account } from "@/lib/appwrite";
import { toast } from "@/components/ui/toast";

interface Business {
  $id: string;
  name: string;
  type: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
}

interface Transaction {
  $id: string;
  businessId: string;
  amount: string;
  type: "income" | "expense";
  description?: string;
  customerName?: string;
  date: string;
  userId: string;
}

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params?.id as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null
  );
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const [formData, setFormData] = useState({
    amount: "",
    type: "income" as "income" | "expense",
    description: "",
    customerName: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });

  useEffect(() => {
    loadData();
  }, [businessId]);

  const loadData = async () => {
    try {
      const user = await account.get();
      const userId = user.$id;

      const businessData = await databases.getDocument(
        DATABASE_ID,
        BUSINESSES_COLLECTION_ID,
        businessId
      );
      setBusiness(businessData as unknown as Business);

      const transactionsData = await databases.listDocuments(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        [
          Query.equal("businessId", businessId),
          Query.equal("userId", userId),
          Query.orderDesc("date"),
        ]
      );

      const docs = transactionsData.documents as unknown as Transaction[];
      setTransactions(docs);

      const income = docs
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

      const expense = docs
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

      setStats({
        totalIncome: income,
        totalExpense: expense,
        balance: income - expense,
      });
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userId = (await account.get()).$id;

      if (editingTransaction) {
        await databases.updateDocument(
          DATABASE_ID,
          TRANSACTIONS_COLLECTION_ID,
          editingTransaction.$id,
          {
            amount: formData.amount,
            type: formData.type,
            description: formData.description,
            customerName: formData.customerName,
            date: formData.date,
          }
        );
        toast.success("Muvaffaqiyatli yangilandi");
      } else {
        await databases.createDocument(
          DATABASE_ID,
          TRANSACTIONS_COLLECTION_ID,
          ID.unique(),
          {
            ...formData,
            businessId,
            userId,
          }
        );
        toast.success("Yangi tranzaksiya qo'shildi");
      }

      closeFormModal();
      loadData();
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Saqlashda xatolik yuz berdi");
    }
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        transactionToDelete
      );
      toast.success("O'chirildi");
      setShowDeleteModal(false);
      setTransactionToDelete(null);
      loadData();
    } catch (error) {
      toast.error("O'chirishda xatolik");
    }
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description || "",
      customerName: transaction.customerName || "",
      date: transaction.date.split("T")[0],
    });
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingTransaction(null);
    setFormData({
      amount: "",
      type: "income",
      description: "",
      customerName: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!business) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 px-4 sm:px-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/businesses")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold truncate">
            {business.name}
          </h1>
        </div>
        <Button onClick={() => setShowFormModal(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Qo'shish
        </Button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Daromad</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold text-blue-700">
              {formatCurrency(stats.totalIncome)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200">
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Xarajat</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold text-red-700">
              {formatCurrency(stats.totalExpense)}
            </div>
          </CardContent>
        </Card>
        <Card
          className={`${
            stats.balance >= 0
              ? "bg-emerald-50 border-emerald-200"
              : "bg-orange-50 border-orange-200"
          } dark:bg-emerald-950/10`}
        >
          <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Balans</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div
              className={`text-xl font-bold ${
                stats.balance >= 0 ? "text-emerald-700" : "text-red-600"
              }`}
            >
              {formatCurrency(stats.balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg px-1">So'nggi harakatlar</h3>
        {transactions.length === 0 ? (
          <div className="text-center py-10 border rounded-xl bg-muted/20">
            <p className="text-muted-foreground">Hozircha ma'lumot yo'q</p>
          </div>
        ) : (
          transactions.map((t) => (
            <Card key={t.$id} className="overflow-hidden group">
              <div className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className={`p-2 rounded-full ${
                      t.type === "income"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {t.type === "income" ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {t.description ||
                        (t.type === "income" ? "Daromad" : "Xarajat")}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {formatDate(t.date)}
                      </span>
                      {t.customerName && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" /> {t.customerName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`font-bold ${
                      t.type === "income" ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatCurrency(parseFloat(t.amount))}
                  </span>
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600"
                      onClick={() => openEditModal(t)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600"
                      onClick={() => {
                        setTransactionToDelete(t.$id);
                        setShowDeleteModal(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* --- MODALS --- */}

      {/* 1. Form Modal (Add/Edit) */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
              <CardTitle>
                {editingTransaction ? "Tahrirlash" : "Yangi tranzaksiya"}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={closeFormModal}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "income" })}
                    className={`py-2 text-sm font-medium rounded-md transition-all ${
                      formData.type === "income"
                        ? "bg-background shadow-sm text-emerald-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    Daromad
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, type: "expense" })
                    }
                    className={`py-2 text-sm font-medium rounded-md transition-all ${
                      formData.type === "expense"
                        ? "bg-background shadow-sm text-red-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    Xarajat
                  </button>
                </div>

                <div className="space-y-2">
                  <Label>Summa</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      className="pl-9 text-lg"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tavsif</Label>
                  <Input
                    placeholder="Masalan: Mahsulot sotuvi"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Mijoz (ixtiyoriy)</Label>
                  <Input
                    placeholder="Ism sharifi"
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sana</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>
              </CardContent>
              <div className="p-6 border-t flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={closeFormModal}
                >
                  Bekor qilish
                </Button>
                <Button type="submit" className="flex-1">
                  {editingTransaction ? "Saqlash" : "Qo'shish"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 2. Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60">
          <Card className="w-full max-w-[320px] animate-in fade-in zoom-in-95 duration-200">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg">O'chirishni tasdiqlaysizmi?</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Bu amalni ortga qaytarib bo'lmaydi.
              </p>
            </CardContent>
            <div className="p-4 flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteModal(false)}
              >
                Yo'q
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={confirmDelete}
              >
                Ha, o'chirilsin
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
