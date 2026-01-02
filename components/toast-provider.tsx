'use client';

import { useToast } from '@/components/ui/toast';
import { ToastContainer } from '@/components/ui/toast';

export function ToastProvider() {
  const { toasts, removeToast } = useToast();

  return <ToastContainer toasts={toasts} onClose={removeToast} />;
}

