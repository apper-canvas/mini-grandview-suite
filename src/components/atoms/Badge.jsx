import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Badge = forwardRef(({ className, variant = "default", children, ...props }, ref) => {
const variants = {
    default: "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border border-slate-300",
    primary: "bg-gradient-to-r from-primary/10 to-blue-100 text-primary border border-primary/20",
    success: "bg-gradient-to-r from-success/10 to-emerald-100 text-success border border-success/20",
    warning: "bg-gradient-to-r from-warning/10 to-yellow-100 text-warning border border-warning/20",
    error: "bg-gradient-to-r from-error/10 to-red-100 text-error border border-error/20",
    high: "bg-gradient-to-r from-error/20 to-red-200 text-red-700 border border-red-300",
    medium: "bg-gradient-to-r from-warning/20 to-yellow-200 text-yellow-700 border border-yellow-300",
    low: "bg-gradient-to-r from-success/20 to-green-200 text-green-700 border border-green-300",
    available: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-300",
    occupied: "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-300",
    maintenance: "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-300",
    cleaning: "bg-gradient-to-r from-blue-100 to-sky-100 text-blue-700 border border-blue-300"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200",
        variants[variant],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = "Badge";
export default Badge;