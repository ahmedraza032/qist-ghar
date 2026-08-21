import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base transition-all duration-200 file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-muted-foreground hover:border-[#205EA3]/65 hover:shadow-[0_0_0_3px_rgba(32,94,163,0.12)] focus-visible:outline-none focus-visible:border-[#205EA3] focus-visible:ring-2 focus-visible:ring-[#205EA3]/20 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
