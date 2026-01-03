"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import {
  ArrowLeft,
  Plus,
  DollarSign,
  Calendar,
  User,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BookOpen,
  CreditCard,
  X,
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

type BusinessType = "Restaurant" | "Shop" | "StudyCenter" | string;

interface Business {
  $id: string;
  name: string;
  type: BusinessType;
  address?: string;
  phone?: string;
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
  courseName?: string;
  paymentMethod?: string;
}

const initialFormData = {
  amount: "",
  type: "income" as "income" | "expense",
  description: "",
  customerName: "",
  date: new Date().toISOString().split("T")[0],
  courseName: "",
  paymentMethod: "Cash",
};

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params?.id as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null
  );
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const [formData, setFormData] = useState(initialFormData);

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
    if (!business) return;

    try {
      const user = await account.get();
      const userId = user.$id;

      const payload: any = {
        amount: formData.amount,
        type: formData.type,
        description: formData.description,
        customerName: formData.customerName,
        date: formData.date,
        ...(business.type === "StudyCenter" && {
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
        toast.success("Muvaffaqiyatli yangilandi");
      } else {
        await databases.createDocument(
          DATABASE_ID,
          TRANSACTIONS_COLLECTION_ID,
          ID.unique(),
          {
            ...payload,
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
      courseName: transaction.courseName || "",
      paymentMethod: transaction.paymentMethod || "Cash",
    });
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingTransaction(null);
    setFormData(initialFormData);
  };

  const renderStudyCenterFields = () => (
    <>
      <div className="space-y-2">
        <Label>Kurs Nomi</Label>
        <div className="relative">
          <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Masalan: Full-Stack Bootcamp"
            value={formData.courseName}
            onChange={(e) =>
              setFormData({ ...formData, courseName: e.target.value })
            }
            className="pl-9 border-slate-300 focus:border-slate-500 outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>To'lov Usuli</Label>
        <Select
          onValueChange={(value: "Cash" | "Card") =>
            setFormData({ ...formData, paymentMethod: value })
          }
          value={formData.paymentMethod}
        >
          <SelectTrigger className="w-full border-slate-300 focus:border-slate-500 outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
            <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Usulni tanlang" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Cash">Naqd pul (Cash)</SelectItem>
            <SelectItem value="Card">Karta (Card/Transfer)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!business) return null;

  return (
    <div className="container mx-auto max-w-screen-xl space-y-6 px-4 pb-20 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/businesses")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold truncate sm:text-2xl">
            {business.name} ({business.type})
          </h1>
        </div>
        <Button
          onClick={() => setShowFormModal(true)}
          size="sm"
          className="whitespace-nowrap"
        >
          <Plus className="h-4 w-4 mr-1" /> Qo'shish
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
        {/* Daromad Card */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
          <CardHeader className="p-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium">Daromad</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-lg font-bold text-blue-700 md:text-xl">
              {formatCurrency(stats.totalIncome)}
            </div>
          </CardContent>
        </Card>

        {/* Xarajat Card */}
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200">
          <CardHeader className="p-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium">Xarajat</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-lg font-bold text-red-700 md:text-xl">
              {formatCurrency(stats.totalExpense)}
            </div>
          </CardContent>
        </Card>

        {/* Balans Card (Mobil ekranda to'liq kenglikda) */}
        <Card
          className={`col-span-2 lg:col-span-1 p-3 lg:p-4 ${
            stats.balance >= 0
              ? "bg-emerald-50 border-emerald-200"
              : "bg-orange-50 border-orange-200"
          } dark:bg-emerald-950/10`}
        >
          <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Balans</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent className="p-0 pt-1">
            <div
              className={`text-2xl font-bold ${
                stats.balance >= 0 ? "text-emerald-700" : "text-red-600"
              }`}
            >
              {formatCurrency(stats.balance)}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">So'nggi harakatlar</h3>
        {transactions.length === 0 ? (
          <div className="text-center py-10 border border-slate-300 dark:border-slate-700 rounded-xl bg-muted/20">
            <p className="text-muted-foreground">Hozircha ma'lumot yo'q</p>
          </div>
        ) : (
          <>
            <div className="hidden lg:block">
              <Card>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]">Turi</TableHead>
                        <TableHead className="min-w-[150px]">
                          Tavsif / Kurs
                        </TableHead>
                        <TableHead>Mijoz/Kontragent</TableHead>
                        <TableHead>Sana</TableHead>
                        <TableHead>To'lov Usuli</TableHead>
                        <TableHead className="text-right min-w-[120px]">
                          Summa
                        </TableHead>
                        <TableHead className="text-right w-[80px]">
                          Amallar
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((t) => (
                        <TableRow key={t.$id}>
                          <TableCell>
                            <div
                              className={`p-2 rounded-full w-fit ${
                                t.type === "income"
                                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                            >
                              {t.type === "income" ? (
                                <TrendingUp className="h-5 w-5" />
                              ) : (
                                <TrendingDown className="h-5 w-5" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {t.courseName ||
                              t.description ||
                              (t.type === "income" ? "Daromad" : "Xarajat")}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {t.customerName || "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(t.date)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {t.paymentMethod || "—"}
                          </TableCell>
                          <TableCell
                            className={`text-right font-bold ${
                              t.type === "income"
                                ? "text-emerald-600"
                                : "text-red-600"
                            }`}
                          >
                            {t.type === "income" ? "+" : "-"}
                            {formatCurrency(parseFloat(t.amount))}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 text-blue-600 p-0"
                                onClick={() => openEditModal(t)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 text-red-600 p-0"
                                onClick={() => {
                                  setTransactionToDelete(t.$id);
                                  setShowDeleteModal(true);
                                }}
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
              </Card>
            </div>

            <div className="lg:hidden">
              <div className="rounded-md border overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow className="text-xs">
                      <TableHead className="w-[40px] p-2">Turi</TableHead>
                      <TableHead className="p-2 min-w-[120px]">
                        Tavsif / Kurs
                      </TableHead>
                      <TableHead className="hidden sm:table-cell p-2">
                        Sana
                      </TableHead>
                      <TableHead className="hidden md:table-cell p-2">
                        Mijoz
                      </TableHead>
                      <TableHead className="hidden sm:table-cell p-2">
                        To'lov
                      </TableHead>
                      <TableHead className="text-right p-2 min-w-[100px]">
                        Summa
                      </TableHead>
                      <TableHead className="w-[60px] p-2">Amallar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((t) => (
                      <TableRow key={t.$id} className="text-xs">
                        <TableCell className="py-1 px-2">
                          <div
                            className={`p-1 rounded-full w-fit ${
                              t.type === "income"
                                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {t.type === "income" ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="py-1 px-2 font-medium">
                          {t.courseName ||
                            t.description ||
                            (t.type === "income" ? "Daromad" : "Xarajat")}
                        </TableCell>

                        <TableCell className="hidden sm:table-cell py-1 px-2 text-muted-foreground">
                          {formatDate(t.date)}
                        </TableCell>

                        <TableCell className="hidden md:table-cell py-1 px-2">
                          {t.customerName || "-"}
                        </TableCell>

                        <TableCell className="hidden sm:table-cell py-1 px-2">
                          {t.paymentMethod || "-"}
                        </TableCell>

                        <TableCell
                          className={`text-right py-1 px-2 font-bold ${
                            t.type === "income"
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {t.type === "income" ? "+" : "-"}
                          {formatCurrency(parseFloat(t.amount))}
                        </TableCell>

                        <TableCell className="py-1 px-2">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-blue-600 p-0"
                              onClick={() => openEditModal(t)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-600 p-0"
                              onClick={() => {
                                setTransactionToDelete(t.$id);
                                setShowDeleteModal(true);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}
      </div>

      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm dark:bg-black/80">
          <Card className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
              <CardTitle>
                {editingTransaction ? "Tahrirlash" : "Yangi tranzaksiya"}
                <span className="text-sm font-normal text-muted-foreground block">
                  {business?.type === "StudyCenter"
                    ? "O'quv Markazi"
                    : "Umumiy"}
                </span>
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={closeFormModal}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg mx-6 mt-6">
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
                  onClick={() => setFormData({ ...formData, type: "expense" })}
                  className={`py-2 text-sm font-medium rounded-md transition-all ${
                    formData.type === "expense"
                      ? "bg-background shadow-sm text-red-600"
                      : "text-muted-foreground"
                  }`}
                >
                  Xarajat
                </button>
              </div>
              <CardContent className="space-y-4 pt-6 grid grid-cols-1 lg:grid-cols-2 lg:gap-4">
                <div className="space-y-2">
                  <Label>Summa</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      className="pl-9 text-lg border-slate-300 focus:border-slate-500 outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      required
                    />
                  </div>
                </div>

                {business.type === "StudyCenter" && renderStudyCenterFields()}

                {business.type !== "StudyCenter" && (
                  <div className="space-y-2">
                    <Label>Tavsif</Label>
                    <Textarea
                      placeholder="Masalan: Mahsulot sotuvi yoki Ijara to'lovi"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="border-slate-300 focus:border-slate-500 outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Mijoz/Kontragent (ixtiyoriy)</Label>
                  <Input
                    placeholder="Ism sharifi yoki tashkilot nomi"
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                    className="border-slate-300 focus:border-slate-500 outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
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
                    className="border-slate-300 focus:border-slate-500 outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
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

      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60">
          <Card className="w-full max-w-[320px]">
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
