"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Store,
  DollarSign,
  Users,
  Calendar,
  Building2,
  CreditCard,
  Settings,
  Activity,
  BarChart3,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  databases,
  DATABASE_ID,
  BUSINESSES_COLLECTION_ID,
  TRANSACTIONS_COLLECTION_ID,
  Query,
} from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface Stats {
  totalBusinesses: number;
  totalRevenue: number;
  totalCustomers: number;
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  revenueChange: number;
  businessesChange: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalBusinesses: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    dailyRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    revenueChange: 0,
    businessesChange: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkAuth = async () => {
    try {
      await account.get();
    } catch (error) {
      router.push("/auth");
    }
  };

  const loadStats = async () => {
    try {
      const userId = (await account.get()).$id;

      const businesses = await databases.listDocuments(
        DATABASE_ID,
        BUSINESSES_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const allTransactions = await databases.listDocuments(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );

      const dailyTransactions = allTransactions.documents.filter(
        (t: any) => new Date(t.date) >= today
      );
      const dailyRevenue = dailyTransactions.reduce(
        (sum: number, t: any) => {
          const amount = parseFloat(t.amount) || 0;
          return sum + (t.type === "expense" ? -amount : amount);
        },
        0
      );

      const weeklyTransactions = allTransactions.documents.filter(
        (t: any) => new Date(t.date) >= weekAgo
      );
      const weeklyRevenue = weeklyTransactions.reduce(
        (sum: number, t: any) => {
          const amount = parseFloat(t.amount) || 0;
          return sum + (t.type === "expense" ? -amount : amount);
        },
        0
      );

      const monthlyTransactions = allTransactions.documents.filter(
        (t: any) => new Date(t.date) >= monthAgo
      );
      const monthlyRevenue = monthlyTransactions.reduce(
        (sum: number, t: any) => {
          const amount = parseFloat(t.amount) || 0;
          return sum + (t.type === "expense" ? -amount : amount);
        },
        0
      );

      const totalRevenue = allTransactions.documents.reduce(
        (sum: number, t: any) => {
          const amount = parseFloat(t.amount) || 0;
          return sum + (t.type === "expense" ? -amount : amount);
        },
        0
      );

      const uniqueCustomers = new Set(
        allTransactions.documents.map(
          (t: any) => t.customerId || t.customerName
        )
      ).size;

      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        
        const dayTransactions = allTransactions.documents.filter((t: any) => {
          const tDate = new Date(t.date);
          return tDate >= dayStart && tDate < dayEnd;
        });
        
        const dayRevenue = dayTransactions.reduce(
          (sum: number, t: any) => {
            const amount = parseFloat(t.amount) || 0;
            return sum + (t.type === "expense" ? -amount : amount);
          },
          0
        );
        
        last7Days.push({
          day: date.toLocaleDateString("uz-UZ", { weekday: "short" }),
          fullDate: date.toLocaleDateString("uz-UZ"),
          revenue: dayRevenue,
          count: dayTransactions.length,
        });
      }
      setChartData(last7Days);

      const lastMonthStart = new Date(
        monthAgo.getTime() - 30 * 24 * 60 * 60 * 1000
      );
      const lastMonthTransactions = allTransactions.documents.filter(
        (t: any) => {
          const date = new Date(t.date);
          return date >= lastMonthStart && date < monthAgo;
        }
      );
      const lastMonthRevenue = lastMonthTransactions.reduce(
        (sum: number, t: any) => {
          const amount = parseFloat(t.amount) || 0;
          return sum + (t.type === "expense" ? -amount : amount);
        },
        0
      );
      const revenueChange =
        lastMonthRevenue > 0
          ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          : monthlyRevenue > 0 ? 100 : 0;

      setStats({
        totalBusinesses: businesses.total,
        totalRevenue,
        totalCustomers: uniqueCustomers || 0,
        dailyRevenue,
        weeklyRevenue,
        monthlyRevenue,
        revenueChange: Math.round(revenueChange * 10) / 10,
        businessesChange: 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground">
            Yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
    

      {/* Main Stats Cards - Professional va yengil ranglar */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Jami Balans
              </CardTitle>
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2 flex items-center">
              {stats.revenueChange >= 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-emerald-600" />
                  <span className="text-emerald-600">
                    +{Math.abs(stats.revenueChange)}%
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-red-600" />
                  <span className="text-red-600">
                    {stats.revenueChange}%
                  </span>
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Bizneslar
              </CardTitle>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold">
              {stats.totalBusinesses}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
              Faol biznes
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Mijozlar
              </CardTitle>
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold">
              {stats.totalCustomers}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
              Umumiy
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Bugun
              </CardTitle>
              <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/30">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold">
              {formatCurrency(stats.dailyRevenue)}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
              Bugungi balans
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Haftalik Chart */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Haftalik Balans
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  Oxirgi 7 kunlik statistika
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-lg sm:text-xl font-bold text-blue-600">
                  {formatCurrency(stats.weeklyRevenue)}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="day"
                  className="text-xs"
                  tick={{ fill: "currentColor" }}
                />
                <YAxis className="text-xs" tick={{ fill: "currentColor" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: any) => [formatCurrency(value), "Balans"]}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Oylik Trend */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-600" />
                  Oylik Trend
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  Oxirgi 7 kunlik o'sish
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-lg sm:text-xl font-bold text-emerald-600">
                  {formatCurrency(stats.monthlyRevenue)}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="day"
                  className="text-xs"
                  tick={{ fill: "currentColor" }}
                />
                <YAxis className="text-xs" tick={{ fill: "currentColor" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: any) => [formatCurrency(value), "Balans"]}
                  labelFormatter={(label) => `${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown - Minimal va yengil */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-emerald-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
              </div>
              <CardTitle className="text-sm sm:text-base">Kunlik</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-emerald-600">
              {formatCurrency(stats.dailyRevenue)}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Bugungi kun
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <CardTitle className="text-sm sm:text-base">Haftalik</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {formatCurrency(stats.weeklyRevenue)}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              7 kun
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              </div>
              <CardTitle className="text-sm sm:text-base">Oylik</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-purple-600">
              {formatCurrency(stats.monthlyRevenue)}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              30 kun
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Minimal va professional */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Tezkor Amallar</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Ko'p ishlatiladigan funksiyalar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href="/businesses"
              className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl border border-border hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all group"
            >
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors shrink-0">
                <Store className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm sm:text-base">
                  Biznes Qo'shish
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Yangi biznes yaratish
                </div>
              </div>
            </a>

            <a
              href="/transactions/new"
              className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl border border-border hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all group"
            >
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors shrink-0">
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm sm:text-base">
                  Tranzaksiya
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Daromad qo'shish
                </div>
              </div>
            </a>

            <a
              href="/settings"
              className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl border border-border hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all group"
            >
              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 transition-colors shrink-0">
                <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm sm:text-base">
                  Sozlamalar
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Hisob sozlash
                </div>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}