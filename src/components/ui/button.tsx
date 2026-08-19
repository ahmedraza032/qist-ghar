"use client";
import * as React from "react";
import { motion } from "motion/react";
import { cva, type VariantProps } from "@/lib/cva";
import { cn } from "@/lib/utils";
import { TextShimmerWave } from "@/components/core/text-shimmer-wave";

const buttonVariants = cva(
  "group inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:animate-press-spring motion-reduce:transition-none motion-reduce:hover:transform-none motion-reduce:active:animate-none [&_svg.lucide-plus]:transition-transform [&_svg.lucide-plus]:duration-200 [&_svg.lucide-plus]:ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:[&_svg.lucide-plus]:rotate-90",
  {
    variants: {
      variant: {
        default:
          "bg-[#205EA3] text-primary-foreground hover:bg-[#174571] hover:-translate-y-[1px] shadow-[0_1px_2px_rgba(20,24,31,0.04)] hover:shadow-[0_1px_3px_rgba(20,24,31,0.06),0_1px_2px_rgba(20,24,31,0.04)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        whileHover="hover"
        initial="initial"
        {...props}
      >
        <TextShimmerWave>{children}</TextShimmerWave>
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
