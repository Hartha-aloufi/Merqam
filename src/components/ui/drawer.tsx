// src/components/ui/drawer.tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Drawer = ({
  shouldScaleBackground = false,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  shouldScaleBackground?: boolean
}) => {
  return (
    <div className={cn("fixed inset-0 z-50", className)} {...props}>
      {children}
    </div>
  )
}

const DrawerTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button ref={ref} className={className} {...props} />
))
DrawerTrigger.displayName = "DrawerTrigger"

const DrawerContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed inset-y-0 left-0 z-50 h-full w-[300px] border-r bg-background transition-transform duration-300 translate-x-[-100%] data-[state=open]:translate-x-0",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
DrawerContent.displayName = "DrawerContent"

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("p-4 border-b", className)}
    {...props}
  />
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
DrawerTitle.displayName = "DrawerTitle"

export {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
}