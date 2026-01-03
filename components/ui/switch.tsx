"use client";

import * as React from "react";
import { motion } from "framer-motion";

// Interfeysni kengaytiramiz
interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const Switch = ({
  checked,
  onCheckedChange,
  id,
  className,
  disabled,
  ...props // Qolgan barcha standart prop'larni qabul qiladi (id, name, tabIndex va h.k.)
}: SwitchProps) => {
  return (
    <button
      type="button"
      role="switch"
      id={id} // Endi TS xato bermaydi
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full 
        transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
        ${checked ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-700"}
        ${className}
      `}
      {...props}
    >
      <motion.span
        initial={false}
        animate={{ x: checked ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0"
      />
    </button>
  );
};
