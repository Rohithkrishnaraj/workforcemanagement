"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated as admin
    const checkAuth = () => {
      const user = localStorage.getItem("wms_user")

      if (!user) {
        router.push("/login")
        return
      }

      try {
        const userData = JSON.parse(user)
        if (userData.role !== "admin") {
          router.push("/login")
          return
        }

        setIsLoading(false)
      } catch (error) {
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar userRole="admin" userName="Admin User" />
      <div className="lg:pl-64">
        <main>{children}</main>
      </div>
    </div>
  )
}

