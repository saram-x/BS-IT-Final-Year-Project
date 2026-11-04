import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * SIMPLE SIDEBAR COMPONENTS
 * Lightweight sidebar components for admin panel
 * Replaces complex shadcn sidebar that was causing issues
 */

const SidebarProvider = ({ children, ...props }) => (
  <div {...props}>{children}</div>
)

const Sidebar = React.forwardRef(({ className, ...props }, ref) => (
  <aside
    ref={ref}
    className={cn("w-72 border-r border-gray-600/30 bg-transparent/10 backdrop-blur-sm", className)}
    {...props}
  />
))
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 border-b border-gray-600/20 bg-transparent", className)}
    {...props}
  />
))
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-4", className)}
    {...props}
  />
))
SidebarContent.displayName = "SidebarContent"

const SidebarMenu = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-2", className)}
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const SidebarMenuButton = React.forwardRef(({ className, isActive, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
      isActive 
        ? "bg-blue-600/20 text-blue-300 border border-blue-400/30 shadow-sm" 
        : "text-gray-300 hover:bg-gray-700/20 hover:text-white",
      className
    )}
    {...props}
  />
))
SidebarMenuButton.displayName = "SidebarMenuButton"

export {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
}
