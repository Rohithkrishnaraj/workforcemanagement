"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState("")
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', user.id)
            .single()

          if (data) {
            setUserName(data.first_name 
              ? `${data.first_name} ${data.last_name || ''}`
              : user.email || 'Admin User')
          }
        }
      } catch (error) {
        console.error('Profile fetch error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getProfile()
  }, [supabase])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar userRole="admin" userName={userName} />
      <div className="lg:pl-64">
        <main>{children}</main>
      </div>
    </div>
  )
}

