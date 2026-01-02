'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { account } from '@/lib/appwrite';

export function GlobalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');

  useEffect(() => {
    // Don't check auth on auth page
    if (isAuthPage) return;
    
    account.get().catch(() => {
      router.push('/auth');
    });
  }, [pathname, router, isAuthPage]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
      {!isAuthPage && <Navigation />}
      <main className={isAuthPage ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8'}>
        {children}
      </main>
    </div>
  );
}

