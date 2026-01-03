"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Crown,
  Check,
  Zap,
  TrendingUp,
  Shield,
  Users,
  BarChart3,
  Database,
  Cloud,
  Lock,
  Sparkles,
  Rocket,
  Star,
  InfinityIcon,
} from "lucide-react";

interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  popular?: boolean;
  recommended?: boolean;
  icon: any;
  gradient: string;
  features: string[];
}

const plans: PricingPlan[] = [
  {
    id: "free",
    name: "Bepul",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Yangi boshlovchilar uchun",
    icon: Sparkles,
    gradient: "from-slate-400 to-slate-500",
    features: [
      "1 ta biznes profil",
      "Oylik 50 ta tranzaksiya",
      "Asosiy hisobotlar",
      "1 ta foydalanuvchi",
      "Telegram bot (asosiy)",
    ],
  },
  {
    id: "startup",
    name: "Startup",
    monthlyPrice: 19000,
    yearlyPrice: 180000, // ~20% chegirma
    description: "Kichik jamoalar uchun",
    icon: Zap,
    gradient: "from-blue-500 to-indigo-500",
    features: [
      "3 ta biznes profil",
      "Cheksiz tranzaksiyalar",
      "Kengaytirilgan tahlil",
      "3 ta foydalanuvchi",
      "Excelga eksport qilish",
      "Support (Email)",
    ],
  },
  {
    id: "business",
    name: "Biznes",
    monthlyPrice: 45000,
    yearlyPrice: 430000,
    popular: true,
    recommended: true,
    description: "Kengayish bosqichidagilar uchun",
    icon: Crown,
    gradient: "from-amber-500 to-orange-500",
    features: [
      "10 ta biznes profil",
      "AI tahliliy prognozlar",
      "Cheksiz foydalanuvchilar",
      "Buxgalteriya integratsiyasi",
      "Telegram bot (Premium)",
      "24/7 Qo'llab-quvvatlash",
    ],
  },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  const handleSubscribe = (planId: string) => {
    console.log("Plan selected:", planId, isYearly ? "Yearly" : "Monthly");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            Oddiy va shaffof narxlar
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">
            Biznesingiz hajmidan qat'iy nazar, bizda siz uchun mos yechim bor.
          </p>

          {/* Billing Switch */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Label
              htmlFor="billing-mode"
              className={!isYearly ? "font-bold" : "opacity-50"}
            >
              Oylik
            </Label>
            <Switch
              id="billing-mode"
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <Label
              htmlFor="billing-mode"
              className={isYearly ? "font-bold" : "opacity-50"}
            >
              Yillik <span className="text-green-500 text-xs ml-1">(-20%)</span>
            </Label>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;

            return (
              <Card
                key={plan.id}
                className={`relative transition-all duration-300 border-none shadow-lg ${
                  plan.recommended
                    ? "ring-2 ring-amber-500 scale-105 z-10 bg-white dark:bg-slate-900"
                    : "bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm"
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
                    Eng optimal tanlov
                  </div>
                )}

                <CardHeader className="text-center pt-8">
                  <div
                    className={`mx-auto p-3 rounded-2xl bg-gradient-to-br ${plan.gradient} w-fit shadow-md mb-4`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold">
                    {plan.name}
                  </CardTitle>
                  <div className="mt-4 flex flex-col items-center">
                    <span className="text-4xl font-black">
                      {price === 0 ? "Bepul" : `${price.toLocaleString()} so'm`}
                    </span>
                    <span className="text-sm text-muted-foreground mt-1">
                      {price === 0
                        ? "Cheklovlar bilan"
                        : isYearly
                        ? "/yiliga"
                        : "/oyiga"}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="px-8 pb-8 mt-4">
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 text-sm"
                      >
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-0.5 rounded-full">
                          <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    className={`w-full h-11 text-base font-semibold transition-all ${
                      plan.recommended
                        ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200 dark:shadow-none shadow-lg"
                        : "bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600"
                    }`}
                  >
                    {plan.id === "free" ? "Hozirgi tarif" : "Boshlash"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Minimalist Trust Section */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-slate-200 dark:border-slate-800 pt-12">
          <div className="flex gap-4 items-center justify-center sm:justify-start">
            <Shield className="h-10 w-10 text-slate-400" />
            <div>
              <h4 className="font-bold text-sm">Xavfsiz to'lov</h4>
              <p className="text-xs text-muted-foreground text-nowrap">
                Payme va Click orqali
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-center justify-center">
            <Rocket className="h-10 w-10 text-slate-400" />
            <div>
              <h4 className="font-bold text-sm">Tezkor sozlash</h4>
              <p className="text-xs text-muted-foreground text-nowrap">
                1 daqiqada ishga tushadi
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-center justify-center sm:justify-end">
            <Star className="h-10 w-10 text-slate-400" />
            <div>
              <h4 className="font-bold text-sm">7 kun bepul</h4>
              <p className="text-xs text-muted-foreground text-nowrap">
                Premium sinov muddati
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
