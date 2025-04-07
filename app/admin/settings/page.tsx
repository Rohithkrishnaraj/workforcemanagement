"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, Upload, Key } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Types
interface AdminProfile {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  role: string
  department: string
  joinDate: string
  bio: string
}

// Sample data
const initialAdminProfile: AdminProfile = {
  id: "admin1",
  name: "Admin User",
  email: "admin@gmail.com",
  phone: "123-456-7890",
  avatar: "",
  role: "System Administrator",
  department: "Administration",
  joinDate: "2022-01-15",
  bio: "Experienced system administrator with a background in HR and workforce management systems.",
}

// Format date for display
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // State for settings
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(initialAdminProfile)

  // Dialog states
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordError, setPasswordError] = useState("")

  // Load initial data with a simulated delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setAdminProfile((prev) => ({ ...prev, [name]: value }))
  }

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
    setPasswordError("")
  }

  // Save profile changes
  const saveProfileChanges = () => {
    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })
    }, 1000)
  }

  // Handle password update
  const handlePasswordUpdate = () => {
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match")
      return
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long")
      return
    }

    // For demo purposes, check if current password is "admin123"
    if (passwordData.currentPassword !== "admin123") {
      setPasswordError("Current password is incorrect")
      return
    }

    setIsSaving(true)

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      setChangePasswordDialogOpen(false)
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      })
    }, 1000)
  }

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-[calc(100vh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading profile settings...</span>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your personal information and preferences</p>
      </div>

      <Card>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center justify-center space-y-4 p-2">
              <div className="relative group cursor-pointer">
                <Avatar className="h-24 w-24 transition-opacity group-hover:opacity-80">
                  <AvatarImage src={adminProfile.avatar} alt={adminProfile.name} />
                  <AvatarFallback>{adminProfile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Upload className="h-6 w-6 text-white drop-shadow-md" />
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      // Handle file upload here
                      const reader = new FileReader()
                      reader.onload = (e) => {
                        setAdminProfile(prev => ({
                          ...prev,
                          avatar: e.target?.result as string
                        }))
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  id="avatar-upload"
                />
                <label htmlFor="avatar-upload" className="absolute inset-0 cursor-pointer" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">{adminProfile.role}</p>
                <p className="text-xs text-muted-foreground">Joined {formatDate(adminProfile.joinDate)}</p>
              </div>
            </div>

            <div className="flex-1 space-y-4 p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" value={adminProfile.name} onChange={handleProfileChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={adminProfile.email}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" value={adminProfile.phone} onChange={handleProfileChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    name="department"
                    value={adminProfile.department}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" name="bio" value={adminProfile.bio} onChange={handleProfileChange} rows={4} />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Security</h3>
            <Button variant="outline" className="flex items-center" onClick={() => setChangePasswordDialogOpen(true)}>
              <Key className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={saveProfileChanges} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordDialogOpen} onOpenChange={setChangePasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and a new password to update your credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
              />
            </div>
            {passwordError && <div className="text-sm text-red-500">{passwordError}</div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordUpdate} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

