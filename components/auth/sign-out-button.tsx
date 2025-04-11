'use client'

import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function SignOutButton() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    try {
      // Clear any existing session
      await supabase.auth.signOut()
      
      // Clear any local storage items
      localStorage.clear()
      
      // Force a hard refresh to clear any cached state
      window.location.href = '/login'
    } catch (error) {
      console.error('Error signing out:', error)
      // Even if there's an error, redirect to login
      window.location.href = '/login'
    }
  }

  return (
    <Button
      variant="ghost"
      onClick={handleSignOut}
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </Button>
  )
} 