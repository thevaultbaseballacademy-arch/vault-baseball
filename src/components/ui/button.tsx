import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { hapticImpact } from "@/lib/haptics";

const buttonVariants = cva(
  "tap-highlight-transparent inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold uppercase tracking-wider ring-offset-background transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md border border-primary",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border",
        ghost: "hover:bg-secondary hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-primary text-primary-foreground font-bold border-2 border-primary hover:bg-transparent hover:text-primary transition-all duration-300",
        heroOutline: "border-2 border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background transition-all duration-300",
        vault: "bg-[#181818] text-white font-bold border-2 border-[#181818] hover:bg-transparent hover:text-[#181818] transition-all duration-200",
        vaultOutline: "border-2 border-[#4A4A4A] bg-transparent text-foreground hover:bg-[#181818] hover:text-white hover:border-[#181818] transition-all duration-200",
        metallic: "bg-gradient-to-r from-[#B9B9B9] via-[#D4D4D4] to-[#B9B9B9] text-[#181818] font-bold border border-[#4A4A4A] hover:opacity-90 transition-all duration-200",
        activate: "bg-[#181818] text-white font-bold border-2 border-[#181818] relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-500",
      },
      size: {
        default: "min-h-11 px-6 py-2",
        sm: "min-h-11 px-4",
        lg: "min-h-12 px-8 text-base",
        xl: "min-h-14 px-10 text-lg",
        icon: "min-h-11 min-w-11 h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const PRIMARY_VARIANTS = new Set(["default", "hero", "vault", "metallic", "activate", "destructive"]);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        // Fire haptic on native; safe no-op on web
        const intensity = PRIMARY_VARIANTS.has(variant ?? "default") ? "Medium" : "Light";
        void hapticImpact(intensity);
        onClick?.(e);
      },
      [onClick, variant],
    );

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
