"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Calendar,
  FileText,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type NavItem = {
  title: string
  href: string
  icon: React.ElementType
}

const adminNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Employee Management",
    href: "/admin/employees",
    icon: Users,
  },
  {
    title: "Task Management",
    href: "/admin/tasks",
    icon: CheckSquare,
  },
  {
    title: "Attendance Management",
    href: "/admin/attendance",
    icon: Calendar,
  },
  {
    title: "Leave Requests",
    href: "/admin/leave-requests",
    icon: FileText,
  },
  {
    title: "Performance Tracking",
    href: "/admin/performance",
    icon: BarChart2,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

const employeeNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/employee/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Attendance",
    href: "/employee/attendance",
    icon: Calendar,
  },
  {
    title: "Tasks",
    href: "/employee/tasks",
    icon: CheckSquare,
  },
  {
    title: "Leave Requests",
    href: "/employee/leave-requests",
    icon: FileText,
  },
]

interface SidebarProps {
  userRole: "admin" | "employee"
  userName: string
}

export function Sidebar({ userRole, userName }: SidebarProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const navItems = userRole === "admin" ? adminNavItems : employeeNavItems

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar for desktop and mobile */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out transform lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <h1 className="text-xl font-bold">WorkForce</h1>
          </div>

          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-500">Welcome,</p>
            <p className="font-medium">{userName}</p>
            <p className="text-xs text-gray-500 capitalize">{userRole}</p>
          </div>

          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md group",
                      pathname === item.href ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50",
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center"
              onClick={() => {
                // Clear user data from localStorage
                localStorage.removeItem("wms_user")
                // Redirect to login page
                window.location.href = "/login"
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

