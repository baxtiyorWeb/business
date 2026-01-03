"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Plus,
  DollarSign,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  X,
  User,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  databases,
  DATABASE_ID,
  BUSINESSES_COLLECTION_ID,
  TRANSACTIONS_COLLECTION_ID,
  ID,
  Query,
  account,
} from "@/lib/appwrite";
import { toast } from "sonner";

// Siz so'ragan umumiy input stillari: shadow/ring/outline yo'q, border slate-500
const inputBaseStyles =
  "focus-visible:ring-0 focus-visible:ring-offset-0 border-slate-500 focus:border-slate-500 shadow-none outline-none bg-transparent text-white";

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params?.id as string;

  const [business, setBusiness] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null
  );
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  const [formData, setFormData] = useState({
    amount: "",
    type: "income" as "income" | "expense",
    description: "",
    customerName: "",
    date: new Date().toISOString().split("T")[0],
    courseName: "",
    paymentMethod: "Cash",
  });

  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });

  useEffect(() => {
    const init = async () => {
      try {
        await account.get();
        await loadData();
      } catch (error) {
        router.push("/auth");
      }
    };
    init();
  }, [businessId]);

  const loadData = async () => {
    try {
      const user = await account.get();
      const businessData = await databases.getDocument(
        DATABASE_ID,
        BUSINESSES_COLLECTION_ID,
        businessId
      );
      setBusiness(businessData);

      const transactionsData = await databases.listDocuments(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        [
          Query.equal("businessId", businessId),
          Query.equal("userId", user.$id),
          Query.orderDesc("date"),
        ]
      );

      const docs = transactionsData.documents;
      setTransactions(docs);

      const income = docs
        .filter((t: any) => t.type === "income")
        .reduce((sum, t: any) => sum + (parseFloat(t.amount) || 0), 0);
      const expense = docs
        .filter((t: any) => t.type === "expense")
        .reduce((sum, t: any) => sum + (parseFloat(t.amount) || 0), 0);

      setStats({
        totalIncome: income,
        totalExpense: expense,
        balance: income - expense,
      });
    } catch (error) {
      toast.error("Ma'lumot yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const user = await account.get();
      const payload = {
        amount: formData.amount,
        type: formData.type,
        description: formData.description,
        customerName: formData.customerName,
        date: formData.date,
        businessId,
        userId: user.$id,
        ...(business.type === "education" && {
          courseName: formData.courseName,
          paymentMethod: formData.paymentMethod,
        }),
      };

      if (editingTransaction) {
        await databases.updateDocument(
          DATABASE_ID,
          TRANSACTIONS_COLLECTION_ID,
          editingTransaction.$id,
          payload
        );
        toast.success("Yangilandi");
      } else {
        await databases.createDocument(
          DATABASE_ID,
          TRANSACTIONS_COLLECTION_ID,
          ID.unique(),
          payload
        );
        toast.success("Qo'shildi");
      }
      closeFormModal();
      loadData();
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (t: any) => {
    setEditingTransaction(t);
    setFormData({
      amount: t.amount,
      type: t.type,
      description: t.description || "",
      customerName: t.customerName || "",
      date: t.date.split("T")[0],
      courseName: t.courseName || "",
      paymentMethod: t.paymentMethod || "Cash",
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
      courseName: "",
      paymentMethod: "Cash",
    });
  };

  if (loading)
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-white" />
      </div>
    );

  return (
    <div className="max-w-dvw mx-auto p-0 lg:p-4 space-y-4 relative min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/businesses")}
            className="text-white hover:bg-slate-800 shrink-0"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold text-white truncate">
            {business?.name}
          </h1>
        </div>

        {/* Desktop Add Button */}
        <Button
          onClick={() => setShowFormModal(true)}
          className="hidden md:flex bg-white text-black hover:bg-slate-200"
        >
          <Plus className="h-5 w-5 mr-1" /> Tranzaksiya qo'shish
        </Button>
      </div>

      {/* MOBILE FLOATING ACTION BUTTON (FAB) */}
      <button
        onClick={() => setShowFormModal(true)}
        className="md:hidden fixed bottom-24 right-6 z-50 bg-white text-black p-4 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-90 transition-transform"
      >
        <Plus className="h-8 w-8" />
      </button>

      {/* Stats Grid */}
      {/* Stats Grid - Yangi dizayn */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3">
        {/* Daromad Card */}
        <Card className="border-l-4 border-l-blue-500 bg-[#0f172a]/40 hover:shadow-md transition-all border-y-0 border-r-0">
          <CardHeader className="pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm font-medium text-slate-400">
                Daromad
              </p>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold text-white">
              {formatCurrency(stats.totalIncome)}
            </div>
            <p className="text-[10px] sm:text-xs text-emerald-500 mt-1 flex items-center">
              <Plus className="h-3 w-3 mr-0.5" /> Jami tushum
            </p>
          </CardContent>
        </Card>

        {/* Xarajat Card */}
        <Card className="border-l-4 border-l-red-500 bg-[#0f172a]/40 hover:shadow-md transition-all border-y-0 border-r-0">
          <CardHeader className="pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm font-medium text-slate-400">
                Xarajat
              </p>
              <div className="p-2 rounded-lg bg-red-500/10">
                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-lg sm:text-2xl font-bold text-white">
              {formatCurrency(stats.totalExpense)}
            </div>
            <p className="text-[10px] sm:text-xs text-red-400 mt-1 flex items-center">
              Chiqimlar miqdori
            </p>
          </CardContent>
        </Card>

        {/* Balans Card */}
        <Card
          className={`border-l-4 ${
            stats.balance >= 0 ? "border-l-emerald-500" : "border-l-orange-500"
          } col-span-2 lg:col-span-1 bg-[#0f172a]/40 hover:shadow-md transition-all border-y-0 border-r-0`}
        >
          <CardHeader className="pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm font-medium text-slate-400">
                Sof Foyda / Balans
              </p>
              <div
                className={`p-2 rounded-lg ${
                  stats.balance >= 0 ? "bg-emerald-500/10" : "bg-orange-500/10"
                }`}
              >
                <DollarSign
                  className={`h-4 w-4 sm:h-5 sm:w-5 ${
                    stats.balance >= 0 ? "text-emerald-500" : "text-orange-500"
                  }`}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div
              className={`text-xl sm:text-2xl font-bold ${
                stats.balance >= 0 ? "text-emerald-500" : "text-orange-500"
              }`}
            >
              {formatCurrency(stats.balance)}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
              Joriy holat bo'yicha
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Content Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Harakatlar tarixi</h3>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-[#0f172a]/50 border border-slate-800 rounded-2xl overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-900/50">
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Turi</TableHead>
                <TableHead className="text-slate-400">Tavsif</TableHead>
                <TableHead className="text-slate-400">Mijoz</TableHead>
                <TableHead className="text-slate-400">Sana</TableHead>
                <TableHead className="text-right text-slate-400">
                  Summa
                </TableHead>
                <TableHead className="text-right text-slate-400">
                  Amallar
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow
                  key={t.$id}
                  className="border-slate-800 hover:bg-slate-800/30"
                >
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        t.type === "income"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {t.type === "income" ? "Daromad" : "Xarajat"}
                    </span>
                  </TableCell>
                  <TableCell className="text-white font-medium">
                    {t.courseName || t.description || "—"}
                  </TableCell>
                  <TableCell className="text-slate-400">
                    {t.customerName || "—"}
                  </TableCell>
                  <TableCell className="text-slate-400">
                    {formatDate(t.date)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-bold ${
                      t.type === "income" ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatCurrency(t.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(t)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setTransactionToDelete(t.$id);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-500 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {transactions.map((t) => (
            <Card
              key={t.$id}
              className="bg-[#0f172a]/80 border-slate-800 shadow-none"
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        t.type === "income"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {t.type === "income" ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <TrendingDown className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-white font-bold truncate">
                        {t.courseName ||
                          t.description ||
                          (t.type === "income" ? "Daromad" : "Xarajat")}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {formatDate(t.date)} • {t.paymentMethod || "Naqd"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <h4
                      className={`font-bold ${
                        t.type === "income"
                          ? "text-emerald-500"
                          : "text-red-500"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {formatCurrency(t.amount)}
                    </h4>
                    <div className="flex gap-1 mt-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(t)}
                        className="h-8 w-8 text-slate-400"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setTransactionToDelete(t.$id);
                          setShowDeleteModal(true);
                        }}
                        className="h-8 w-8 text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                {t.customerName && (
                  <div className="mt-3 pt-3 border-t border-slate-800/50 flex items-center gap-2 text-xs text-slate-400">
                    <User className="h-3 w-3" /> {t.customerName}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {transactions.length === 0 && (
            <div className="text-center py-10 text-slate-500">
              Hozircha ma'lumot yo'q
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-lg bg-slate-900 border-slate-800 text-white max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
              <CardTitle className="text-lg">
                {editingTransaction ? "Tahrirlash" : "Yangi tranzaksiya"}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeFormModal}
                className="text-slate-400"
              >
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="p-6 space-y-4">
                {/* Type Switcher */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "income" })}
                    className={`py-2 text-sm font-medium rounded-lg transition-all ${
                      formData.type === "income"
                        ? "bg-emerald-500 text-white shadow-lg"
                        : "text-slate-400"
                    }`}
                  >
                    Daromad
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, type: "expense" })
                    }
                    className={`py-2 text-sm font-medium rounded-lg transition-all ${
                      formData.type === "expense"
                        ? "bg-red-500 text-white shadow-lg"
                        : "text-slate-400"
                    }`}
                  >
                    Xarajat
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-400">Summa *</Label>
                    <Input
                      required
                      type="number"
                      className={inputBaseStyles}
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-400">Sana *</Label>
                    <Input
                      required
                      type="date"
                      className={inputBaseStyles}
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                    />
                  </div>
                </div>

                {business.type === "education" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-400">Kurs nomi</Label>
                      <Input
                        className={inputBaseStyles}
                        value={formData.courseName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            courseName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-400">To'lov usuli</Label>
                      <select
                        className={`w-full h-10 px-3 rounded-md border ${inputBaseStyles} bg-slate-900`}
                        value={formData.paymentMethod}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paymentMethod: e.target.value,
                          })
                        }
                      >
                        <option value="Cash">Naqd pul</option>
                        <option value="Card">Karta / O'tkazma</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-slate-400">Mijoz / Kontragent</Label>
                  <Input
                    className={inputBaseStyles}
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-400">Tavsif</Label>
                  <Textarea
                    className={inputBaseStyles}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
              </CardContent>
              <div className="p-6 border-t border-slate-800 flex gap-3 sticky bottom-0 bg-slate-900">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 text-slate-400"
                  onClick={closeFormModal}
                >
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 bg-white text-black hover:bg-slate-200"
                >
                  {actionLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Saqlash
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card className="w-full max-w-sm bg-slate-900 border-slate-800 text-white">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg">O'chirishni tasdiqlaysizmi?</h3>
              <p className="text-sm text-slate-400 mt-2">
                Bu amalni ortga qaytarib bo'lmaydi.
              </p>
            </CardContent>
            <div className="p-4 flex gap-2">
              <Button
                variant="ghost"
                className="flex-1 text-slate-400"
                onClick={() => setShowDeleteModal(false)}
              >
                Yo'q
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={async () => {
                  try {
                    await databases.deleteDocument(
                      DATABASE_ID,
                      TRANSACTIONS_COLLECTION_ID,
                      transactionToDelete!
                    );
                    toast.success("O'chirildi");
                    setShowDeleteModal(false);
                    loadData();
                  } catch (e) {
                    toast.error("Xatolik");
                  }
                }}
              >
                O'chirish
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
