"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { account } from "@/lib/appwrite";
import { useState, useEffect } from "react";

// Navigatsiya elementlari va ularning ranglari
const navigation = [
  { name: "Asosiy", href: "/", icon: LayoutDashboard, color: "text-blue-500" },
  {
    name: "Bizneslar",
    href: "/businesses",
    icon: Store,
    color: "text-emerald-500",
  },
  { name: "Profil", href: "/profile", icon: User, color: "text-purple-500" },
  {
    name: "Sozlamalar",
    href: "/settings",
    icon: Settings,
    color: "text-amber-500",
  },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  // Theme management
  useEffect(() => {
    const savedTheme =
      (localStorage.getItem("theme") as "light" | "dark" | "system") ||
      "system";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: "light" | "dark" | "system") => {
    if (newTheme === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    } else {
      document.documentElement.classList.toggle("dark", newTheme === "dark");
    }
  };

  const toggleTheme = () => {
    const newTheme =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      router.push("/auth");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      {/* --- DESKTOP TOP NAVIGATION --- */}
      <nav className="hidden md:block sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className="font-bold text-xl text-slate-900 dark:text-slate-50"
              >
                Business App
              </Link>
              <div className="flex items-center space-x-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname?.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                          : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Icon
                        className={`mr-2 h-4 w-4 ${isActive ? item.color : ""}`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="dark:text-slate-400"
              >
                {theme === "dark" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <LogOut className="mr-2 h-4 w-4" /> Chiqish
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 min-w-0 py-1"
              >
                <div
                  className={`p-1.5 rounded-xl transition-all duration-300 ${
                    isActive ? `bg-slate-100 dark:bg-slate-800 scale-110` : ""
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 ${
                      isActive
                        ? item.color
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  />
                </div>
                <span
                  className={`text-[10px] mt-1 font-medium transition-colors ${
                    isActive
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-500"
                  }`}
                >
                  {item.name}
                </span>
                {isActive && (
                  <div
                    className={`h-1 w-1 rounded-full mt-0.5 ${item.color.replace(
                      "text",
                      "bg"
                    )}`}
                  />
                )}
              </Link>
            );
          })}

          {/* Mobil uchun Theme va Chiqish tugmasini Profil yoki Settings ichiga qo'shish tavsiya etiladi, 
              lekin bu yerda ham bitta qo'shimcha "Menu" sifatida qoldirish mumkin */}
          <button
            onClick={toggleTheme}
            className="flex flex-col items-center justify-center flex-1 py-1"
          >
            <div className="p-1.5">
              {theme === "dark" ? (
                <Moon className="h-6 w-6 text-slate-400" />
              ) : (
                <Sun className="h-6 w-6 text-slate-400" />
              )}
            </div>
            <span className="text-[10px] text-slate-500">Mavzu</span>
          </button>
        </div>
      </nav>

      {/* Mobile Top Header (Faqat Logo va Chiqish uchun) */}
      <header className="md:hidden sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 h-14 flex items-center justify-between px-4">
        <span className="font-bold text-slate-900 dark:text-white">
          Business App
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-slate-400"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </header>
    </>
  );
}
