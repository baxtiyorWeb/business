'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Settings as SettingsIcon, 
  Lock, 
  Bell, 
  Globe,
  Moon,
  Sun,
  Save
} from 'lucide-react';
import { account } from '@/lib/appwrite';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/toast';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    // Load saved preferences from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const checkAuth = async () => {
    try {
      await account.get();
    } catch (error) {
      router.push('/auth');
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Yangi parollar mos kelmaydi');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Parol kamida 8 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    try {
      await account.updatePassword(passwordData.newPassword, passwordData.oldPassword);
      toast.success('Parol muvaffaqiyatli o\'zgartirildi');
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Xatolik yuz berdi');
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
          Sozlamalar
        </h1>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Ilova sozlamalarini boshqaring
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        {/* Password Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Lock className="h-5 w-5 mr-2 text-slate-600 dark:text-slate-400" />
              <CardTitle>Parol</CardTitle>
            </div>
            <CardDescription>
              Parolingizni o'zgartiring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="oldPassword">Joriy Parol</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  required
                  placeholder="Joriy parolingizni kiriting"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">Yangi Parol</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  minLength={8}
                  placeholder="Yangi parol (min 8 belgi)"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Yangi Parolni Tasdiqlash</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  placeholder="Yangi parolni qayta kiriting"
                />
              </div>
              <Button type="submit" className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Parolni O'zgartirish
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 mr-2 text-slate-600 dark:text-slate-400" />
              ) : theme === 'light' ? (
                <Sun className="h-5 w-5 mr-2 text-slate-600 dark:text-slate-400" />
              ) : (
                <SettingsIcon className="h-5 w-5 mr-2 text-slate-600 dark:text-slate-400" />
              )}
              <CardTitle>Tema</CardTitle>
            </div>
            <CardDescription>
              Ilova ko'rinishini tanlang
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button
                onClick={() => handleThemeChange('light')}
                className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  theme === 'light'
                    ? 'border-slate-900 dark:border-slate-50 bg-slate-100 dark:bg-slate-800'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center">
                  <Sun className="h-5 w-5 mr-3 text-slate-600 dark:text-slate-400" />
                  <span className="font-medium text-slate-900 dark:text-slate-50">Yorug'</span>
                </div>
                {theme === 'light' && (
                  <div className="h-2 w-2 rounded-full bg-slate-900 dark:bg-slate-50"></div>
                )}
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'border-slate-900 dark:border-slate-50 bg-slate-100 dark:bg-slate-800'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center">
                  <Moon className="h-5 w-5 mr-3 text-slate-600 dark:text-slate-400" />
                  <span className="font-medium text-slate-900 dark:text-slate-50">Qorong'u</span>
                </div>
                {theme === 'dark' && (
                  <div className="h-2 w-2 rounded-full bg-slate-900 dark:bg-slate-50"></div>
                )}
              </button>
              <button
                onClick={() => handleThemeChange('system')}
                className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  theme === 'system'
                    ? 'border-slate-900 dark:border-slate-50 bg-slate-100 dark:bg-slate-800'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center">
                  <SettingsIcon className="h-5 w-5 mr-3 text-slate-600 dark:text-slate-400" />
                  <span className="font-medium text-slate-900 dark:text-slate-50">Tizim</span>
                </div>
                {theme === 'system' && (
                  <div className="h-2 w-2 rounded-full bg-slate-900 dark:bg-slate-50"></div>
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Bell className="h-5 w-5 mr-2 text-slate-600 dark:text-slate-400" />
              <CardTitle>Bildirishnomalar</CardTitle>
            </div>
            <CardDescription>
              Bildirishnomalar sozlamalari
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-50">Email bildirishnomalari</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Email orqali yangilanishlar haqida xabar oling
                  </p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.email ? 'bg-slate-900 dark:bg-slate-50' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.email ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-50">Push bildirishnomalari</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Brauzer push bildirishnomalari
                  </p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, push: !notifications.push })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.push ? 'bg-slate-900 dark:bg-slate-50' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.push ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-50">SMS bildirishnomalari</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    SMS orqali muhim xabarlar
                  </p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, sms: !notifications.sms })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.sms ? 'bg-slate-900 dark:bg-slate-50' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.sms ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Globe className="h-5 w-5 mr-2 text-slate-600 dark:text-slate-400" />
              <CardTitle>Til</CardTitle>
            </div>
            <CardDescription>
              Ilova tilini tanlang
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <span className="font-medium text-slate-900 dark:text-slate-50">O'zbekcha</span>
                <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">(Tanlangan)</span>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors opacity-50">
                <span className="font-medium text-slate-900 dark:text-slate-50">English</span>
                <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">(Tez orada)</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

