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
  Save,
} from "lucide-react";
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

// Light/Dark rejimga mos dinamik input stillari
const inputBaseStyles =
  "focus-visible:ring-1 focus-visible:ring-primary border-border bg-background shadow-sm rounded-xl h-11 transition-all";

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
        amount: formData.amount.toString(),
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
        toast.success("Muvaffaqiyatli yangilandi");
      } else {
        await databases.createDocument(
          DATABASE_ID,
          TRANSACTIONS_COLLECTION_ID,
          ID.unique(),
          payload
        );
        toast.success("Tranzaksiya qo'shildi");
      }
      closeFormModal();
      loadData();
    } catch (error) {
      toast.error("Saqlashda xatolik");
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
        <Loader2 className="h-10 w-10 animate-spin text-primary/60" />
      </div>
    );

  // Card uchun yagona dizayn (Light va Dark rejimga mos)
  const cardBaseStyle =
    "bg-card border-border shadow-sm rounded-3xl overflow-hidden";

  return (
    <div className="max-w-dvw mx-auto space-y-4 py-6 px-0 lg:px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/businesses")}
            className="rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {business?.name}
            </h1>
            <p className="text-sm text-muted-foreground capitalize">
              {business?.type} boshqaruvi
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowFormModal(true)}
          className="hidden md:flex rounded-xl px-6 shadow-lg shadow-primary/20"
        >
          <Plus className="h-5 w-5 mr-2" /> Tranzaksiya qo'shish
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        {/* Income Card */}
        <Card className={`${cardBaseStyle} border-l-4 border-l-blue-500`}>
          <CardContent className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Daromad
              </span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {formatCurrency(stats.totalIncome)}
            </div>
            <p className="text-[10px] text-emerald-500 mt-1">+ Jami tushum</p>
          </CardContent>
        </Card>

        {/* Expense Card */}
        <Card className={`${cardBaseStyle} border-l-4 border-l-destructive`}>
          <CardContent className="p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Xarajat
              </span>
              <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                <TrendingDown className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {formatCurrency(stats.totalExpense)}
            </div>
            <p className="text-[10px] text-destructive mt-1">
              Chiqimlar miqdori
            </p>
          </CardContent>
        </Card>

        {/* Balance Card */}
        <Card
          className={`${cardBaseStyle} border-l-4 col-span-2 lg:col-span-1 ${
            stats.balance >= 0 ? "border-l-emerald-500" : "border-l-orange-500"
          }`}
        >
          <CardContent className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Sof Foyda
              </span>
              <div
                className={`p-2 rounded-lg ${
                  stats.balance >= 0
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-orange-500/10 text-orange-500"
                }`}
              >
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div
              className={`text-xl sm:text-2xl font-bold ${
                stats.balance >= 0 ? "text-emerald-500" : "text-orange-500"
              }`}
            >
              {formatCurrency(stats.balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground px-1">
          Harakatlar tarixi
        </h3>

        {/* Desktop Table */}
        <div className={`hidden lg:block ${cardBaseStyle}`}>
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-muted-foreground font-bold">
                  Turi
                </TableHead>
                <TableHead className="text-muted-foreground font-bold">
                  Tavsif
                </TableHead>
                <TableHead className="text-muted-foreground font-bold">
                  Mijoz
                </TableHead>
                <TableHead className="text-muted-foreground font-bold">
                  Sana
                </TableHead>
                <TableHead className="text-right text-muted-foreground font-bold">
                  Summa
                </TableHead>
                <TableHead className="text-right text-muted-foreground font-bold">
                  Amallar
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow
                  key={t.$id}
                  className="hover:bg-muted/30 border-border/50"
                >
                  <TableCell>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        t.type === "income"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {t.type === "income" ? "Daromad" : "Xarajat"}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">
                    {t.courseName || t.description || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {t.customerName || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(t.date)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-bold ${
                      t.type === "income"
                        ? "text-emerald-600"
                        : "text-destructive"
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
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
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
                        className="h-8 w-8 text-destructive/70 hover:text-destructive"
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

        {/* Mobile List View */}
        <div className="lg:hidden space-y-3">
          {transactions.map((t) => (
            <Card
              key={t.$id}
              className="bg-card border-border rounded-2xl shadow-none"
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        t.type === "income"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {t.type === "income" ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <TrendingDown className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm">
                        {t.courseName ||
                          t.description ||
                          (t.type === "income" ? "Daromad" : "Xarajat")}
                      </h4>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDate(t.date)} • {t.paymentMethod || "Naqd"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h4
                      className={`font-bold text-sm ${
                        t.type === "income"
                          ? "text-emerald-600"
                          : "text-destructive"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {formatCurrency(t.amount)}
                    </h4>
                  </div>
                </div>
                {t.customerName && (
                  <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <User className="h-3 w-3" /> {t.customerName}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(t)}
                        className="text-muted-foreground p-1"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setTransactionToDelete(t.$id);
                          setShowDeleteModal(true);
                        }}
                        className="text-destructive p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Floating Action Button (Mobile) */}
      <Button
        onClick={() => setShowFormModal(true)}
        className="md:hidden fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full shadow-2xl active:scale-90 transition-transform"
        size="icon"
      >
        <Plus className="h-7 w-7" />
      </Button>

      {/* Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-lg shadow-2xl rounded-3xl border-border bg-card animate-in zoom-in-95">
            <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
              <CardTitle className="text-xl font-bold text-foreground">
                {editingTransaction ? "Tahrirlash" : "Yangi tranzaksiya"}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeFormModal}
                className="rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3 p-1 bg-muted rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "income" })}
                    className={`py-2 text-sm font-bold rounded-xl ${
                      formData.type === "income"
                        ? "bg-emerald-500 text-white shadow-md"
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
                    className={`py-2 text-sm font-bold rounded-xl ${
                      formData.type === "expense"
                        ? "bg-destructive text-white shadow-md"
                        : "text-muted-foreground"
                    }`}
                  >
                    Xarajat
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs font-bold ml-1">
                      Summa *
                    </Label>
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
                  <div className="space-y-1.5">
                    <Label className="text-muted-foreground text-xs font-bold ml-1">
                      Sana *
                    </Label>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-muted-foreground text-xs font-bold ml-1">
                        Kurs
                      </Label>
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
                    <div className="space-y-1.5">
                      <Label className="text-muted-foreground text-xs font-bold ml-1">
                        To'lov usuli
                      </Label>
                      <select
                        className="w-full h-11 px-3 rounded-xl border border-border bg-background outline-none text-sm"
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
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs font-bold ml-1">
                    Mijoz
                  </Label>
                  <Input
                    className={inputBaseStyles}
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs font-bold ml-1">
                    Tavsif
                  </Label>
                  <Textarea
                    className={`${inputBaseStyles} min-h-[80px] py-2`}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
              </CardContent>
              <div className="p-6 border-t flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl h-12"
                  onClick={closeFormModal}
                >
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 rounded-xl h-12 shadow-lg shadow-primary/20"
                >
                  {actionLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}{" "}
                  Saqlash
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-sm shadow-2xl rounded-3xl border-border bg-card animate-in zoom-in-95">
            <CardContent className="pt-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-xl text-foreground">
                O'chirishni tasdiqlaysizmi?
              </h3>
              <p className="text-sm text-muted-foreground">
                Bu amalni ortga qaytarib bo'lmaydi.
              </p>
            </CardContent>
            <div className="p-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-11"
                onClick={() => setShowDeleteModal(false)}
              >
                Yo'q
              </Button>
              <Button
                variant="destructive"
                className="flex-1 rounded-xl h-11 shadow-lg shadow-destructive/20"
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
