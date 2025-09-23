import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Card = forwardRef(({ className, children, hover = true, ...props }, ref) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-sm border border-slate-200/50 backdrop-blur-sm",
        hover && "card-hover",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

const CardHeader = forwardRef(({ className, children, ...props }, ref) => (
  <div className={cn("p-6 pb-3", className)} ref={ref} {...props}>
    {children}
  </div>
));
CardHeader.displayName = "CardHeader";

const CardContent = forwardRef(({ className, children, ...props }, ref) => (
  <div className={cn("p-6 pt-3", className)} ref={ref} {...props}>
    {children}
  </div>
));
CardContent.displayName = "CardContent";

const CardFooter = forwardRef(({ className, children, ...props }, ref) => (
  <div className={cn("p-6 pt-3", className)} ref={ref} {...props}>
    {children}
  </div>
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardContent, CardFooter };