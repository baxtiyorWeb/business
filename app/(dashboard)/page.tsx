'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  Store, 
  DollarSign, 
  Users, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  CreditCard,
  Settings
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { databases, DATABASE_ID, BUSINESSES_COLLECTION_ID, TRANSACTIONS_COLLECTION_ID, Query } from '@/lib/appwrite';
import { useRouter } from 'next/navigation';
import { account } from '@/lib/appwrite';

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
      router.push('/auth');
    }
  };

  const loadStats = async () => {
    try {
      const userId = (await account.get()).$id;
      
      const businesses = await databases.listDocuments(
        DATABASE_ID,
        BUSINESSES_COLLECTION_ID,
        [Query.equal('userId', userId)]
      );

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const allTransactions = await databases.listDocuments(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        [Query.equal('userId', userId)]
      );

      const dailyTransactions = allTransactions.documents.filter(
        (t: any) => new Date(t.date) >= today
      );
      const dailyRevenue = dailyTransactions.reduce(
        (sum: number, t: any) => sum + (parseFloat(t.amount) || 0),
        0
      );

      const weeklyTransactions = allTransactions.documents.filter(
        (t: any) => new Date(t.date) >= weekAgo
      );
      const weeklyRevenue = weeklyTransactions.reduce(
        (sum: number, t: any) => sum + (parseFloat(t.amount) || 0),
        0
      );

      const monthlyTransactions = allTransactions.documents.filter(
        (t: any) => new Date(t.date) >= monthAgo
      );
      const monthlyRevenue = monthlyTransactions.reduce(
        (sum: number, t: any) => sum + (parseFloat(t.amount) || 0),
        0
      );

      const totalRevenue = allTransactions.documents.reduce(
        (sum: number, t: any) => sum + (parseFloat(t.amount) || 0),
        0
      );

      const uniqueCustomers = new Set(
        allTransactions.documents.map((t: any) => t.customerId || t.customerName)
      ).size;

      const lastMonthStart = new Date(monthAgo.getTime() - 30 * 24 * 60 * 60 * 1000);
      const lastMonthTransactions = allTransactions.documents.filter(
        (t: any) => {
          const date = new Date(t.date);
          return date >= lastMonthStart && date < monthAgo;
        }
      );
      const lastMonthRevenue = lastMonthTransactions.reduce(
        (sum: number, t: any) => sum + (parseFloat(t.amount) || 0),
        0
      );
      const revenueChange = lastMonthRevenue > 0 
        ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

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
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
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
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Biznesingizning umumiy ko'rinishi va statistikasi
        </p>
      </div>

      {/* Main Stats Cards - Rangli gradient background va katta rangli iconlar */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Jami Daromad
            </CardTitle>
            <DollarSign className="h-5 w-5 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-white/80 mt-2 flex items-center">
              {stats.revenueChange >= 0 ? (
                <>
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>{Math.abs(stats.revenueChange)}% o'sish</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                  <span>{Math.abs(stats.revenueChange)}% pasayish</span>
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Jami Bizneslar
            </CardTitle>
            <Building2 className="h-5 w-5 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalBusinesses}</div>
            <p className="text-xs text-white/80 mt-2">Faol bizneslar soni</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Mijozlar
            </CardTitle>
            <Users className="h-5 w-5 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-white/80 mt-2">Umumiy mijozlar</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Bugungi Daromad
            </CardTitle>
            <Calendar className="h-5 w-5 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(stats.dailyRevenue)}</div>
            <p className="text-xs text-white/80 mt-2">Bugungi tranzaksiyalar</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown - Har biriga o'ziga xos rangli icon va hover effect */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-3">
              <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              Kunlik Daromad
            </CardTitle>
            <CardDescription>Bugungi daromad ko'rsatkichi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(stats.dailyRevenue)}
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-emerald-600 mr-2" />
              Real vaqtda yangilanadi
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              Haftalik Daromad
            </CardTitle>
            <CardDescription>Oxirgi 7 kunlik ko'rsatkich</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(stats.weeklyRevenue)}
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-blue-600 mr-2" />
              Haftalik o'sish
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-3">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              Oylik Daromad
            </CardTitle>
            <CardDescription>Oxirgi 30 kunlik ko'rsatkich</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(stats.monthlyRevenue)}
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-purple-600 mr-2" />
              Oylik o'sish
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Rangli iconlar va hover effect */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-2xl">Tezkor Amallar</CardTitle>
          <CardDescription>Ko'p ishlatiladigan funksiyalarga tezkor kirish</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href="/businesses"
              className="flex items-center p-6 rounded-xl border border-border hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all group"
            >
              <div className="p-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/50 transition-colors">
                <Store className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="ml-4">
                <div className="font-semibold text-lg">Biznes Qo'shish</div>
                <div className="text-sm text-muted-foreground">Yangi biznes yoki do'kon qo'shing</div>
              </div>
            </a>

            <a
              href="/transactions/new" // Tranzaksiya qo'shish sahifasiga moslang
              className="flex items-center p-6 rounded-xl border border-border hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all group"
            >
              <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                <CreditCard className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <div className="font-semibold text-lg">Tranzaksiya Qo'shish</div>
                <div className="text-sm text-muted-foreground">Yangi daromad yoki xarajat qo'shing</div>
              </div>
            </a>

            <a
              href="/settings"
              className="flex items-center p-6 rounded-xl border border-border hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all group"
            >
              <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                <Settings className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <div className="font-semibold text-lg">Sozlamalar</div>
                <div className="text-sm text-muted-foreground">Hisob va sozlamalarni boshqaring</div>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}