import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer shadow-sm hover:shadow-md active:scale-95 font-inter",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 hover:shadow-lg transform hover:-translate-y-0.5",
        destructive:
          "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 hover:shadow-lg transform hover:-translate-y-0.5",
        outline:
          "border-2 border-green-600 bg-white text-green-700 hover:bg-green-50 hover:border-green-700 hover:text-green-800 transform hover:-translate-y-0.5",
        secondary:
          "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 hover:from-gray-200 hover:to-gray-300 hover:text-gray-900 transform hover:-translate-y-0.5",
        ghost: "text-green-700 hover:bg-green-50 hover:text-green-800 rounded-md",
        link: "text-green-600 underline-offset-4 hover:underline hover:text-green-700",
        success: "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 hover:shadow-lg transform hover:-translate-y-0.5",
        premium: "bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 text-white hover:from-green-700 hover:via-green-600 hover:to-emerald-700 hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 shadow-lg",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-md px-4 py-2 text-sm",
        lg: "h-12 rounded-lg px-8 py-3 text-base",
        xl: "h-14 rounded-lg px-10 py-4 text-lg font-bold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
