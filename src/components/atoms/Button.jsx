import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Button = forwardRef(({ className, variant = "primary", size = "md", children, ...props }, ref) => {
  const variants = {
    primary: "bg-gradient-to-r from-primary to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl",
    secondary: "bg-gradient-to-r from-secondary to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white shadow-md hover:shadow-lg",
    accent: "bg-gradient-to-r from-accent to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white shadow-md hover:shadow-lg",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white bg-white",
    ghost: "text-secondary hover:bg-slate-100 hover:text-primary"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";
export default Button;