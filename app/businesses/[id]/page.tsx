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
  const businessId = params.id as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
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
      const userId = (await account.get()).$id;

      // Load business
      const businessData = await databases.getDocument(
        DATABASE_ID,
        BUSINESSES_COLLECTION_ID,
        businessId
      );
      setBusiness(businessData as unknown as Business);

      // Load transactions
      const transactionsData = await databases.listDocuments(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        [
          Query.equal("businessId", businessId),
          Query.equal("userId", userId),
          Query.orderDesc("date"),
        ]
      );
      setTransactions(transactionsData.documents as unknown as Transaction[]);

      // Calculate stats
      const income = transactionsData.documents
        .filter((t: any) => t.type === "income")
        .reduce((sum: number, t: any) => sum + (parseFloat(t.amount) || 0), 0);

      const expense = transactionsData.documents
        .filter((t: any) => t.type === "expense")
        .reduce((sum: number, t: any) => sum + (parseFloat(t.amount) || 0), 0);

      setStats({
        totalIncome: income,
        totalExpense: expense,
        balance: income - expense,
      });
    } catch (error) {
      console.error("Error loading data:", error);
      router.push("/businesses");
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
      }

      setShowModal(false);
      setEditingTransaction(null);
      setFormData({
        amount: "",
        type: "income",
        description: "",
        customerName: "",
        date: new Date().toISOString().split("T")[0],
      });
      loadData();
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast.error("Xatolik yuz berdi.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bu tranzaksiyani o'chirishni xohlaysizmi?")) return;

    try {
      await databases.deleteDocument(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        id
      );
      loadData();
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-slate-50 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  if (!business) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="flex justify-start items-start space-x-2 sm:space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/businesses")}
            className=" relative -top-1"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-xl font-bold text-slate-900 dark:text-slate-50 truncate">
              {business.name}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
              {business.description || "Tranzaksiyalar va statistika"}
            </p>
          </div>
        </div>
        <Button
          className="w-full sm:w-auto"
          onClick={() => {
            setEditingTransaction(null);
            setFormData({
              amount: "",
              type: "income",
              description: "",
              customerName: "",
              date: new Date().toISOString().split("T")[0],
            });
            setShowModal(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tranzaksiya Qo'shish
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jami Daromad</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(stats.totalIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jami Xarajat</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(stats.totalExpense)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balans</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stats.balance >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(stats.balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Tranzaksiyalar</CardTitle>
          <CardDescription>Barcha daromad va xarajatlar</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                Hali tranzaksiya qo'shilmagan
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.$id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors gap-3 sm:gap-0"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        transaction.type === "income"
                          ? "bg-green-100 dark:bg-green-900/20"
                          : "bg-red-100 dark:bg-red-900/20"
                      }`}
                    >
                      {transaction.type === "income" ? (
                        <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-sm sm:text-base text-slate-900 dark:text-slate-50 truncate">
                          {transaction.description ||
                            (transaction.type === "income"
                              ? "Daromad"
                              : "Xarajat")}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                            transaction.type === "income"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                          }`}
                        >
                          {transaction.type === "income"
                            ? "Daromad"
                            : "Xarajat"}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                        {transaction.customerName && (
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1 shrink-0" />
                            <span className="truncate">
                              {transaction.customerName}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 shrink-0" />
                          {formatDate(transaction.date)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-0">
                      <div
                        className={`text-base sm:text-lg font-bold ${
                          transaction.type === "income"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(parseFloat(transaction.amount))}
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingTransaction(transaction);
                            setFormData({
                              amount: transaction.amount,
                              type: transaction.type,
                              description: transaction.description || "",
                              customerName: transaction.customerName || "",
                              date: transaction.date.split("T")[0],
                            });
                            setShowModal(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(transaction.$id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <Card className="w-full sm:w-full sm:max-w-md max-h-[90vh] sm:max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-lg">
            <CardHeader className="sticky top-0 bg-white dark:bg-slate-950 border-b z-10">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg sm:text-xl">
                  {editingTransaction
                    ? "Tranzaksiyani Tahrirlash"
                    : "Yangi Tranzaksiya"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTransaction(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="type">Turi *</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as any })
                    }
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                    required
                  >
                    <option value="income">Daromad</option>
                    <option value="expense">Xarajat</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="amount">Summa *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    required
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Tavsif</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Tranzaksiya haqida qisqacha ma'lumot"
                  />
                </div>
                <div>
                  <Label htmlFor="customerName">Mijoz Ismi</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                    placeholder="Mijoz ismi (ixtiyoriy)"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Sana *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingTransaction ? "Saqlash" : "Qo'shish"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false);
                      setEditingTransaction(null);
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
