"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  CalendarCheck,
  CheckSquare,
  FileText,
  Trophy,
  TrendingUp,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { getDashboardData, formatTimestamp } from "@/lib/data"

// Sample data for the dashboard
interface DashboardData {
  totalEmployees: number
  todayAttendance: {
    present: number
    absent: number
    late: number
    total: number
  }
  pendingTasks: number
  pendingLeaveRequests: number
  starPerformer: {
    id: string
    name: string
    department: string
    avatar?: string
    performanceScore: number
    completedTasks: number
  }
  recentActivities: Array<{
    id: string
    type: "task" | "leave" | "attendance" | "employee"
    description: string
    timestamp: string
  }>
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load dashboard data
  useEffect(() => {
    // Simulate API call to fetch dashboard data
    const fetchData = async () => {
      try {
        // In a real app, you would fetch data from an API
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay
        setDashboardData(getDashboardData())
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Navigation handlers
  const navigateToEmployees = () => {
    router.push("/admin/employees")
  }

  const navigateToAttendance = () => {
    router.push("/admin/attendance")
  }

  const navigateToTasks = () => {
    router.push("/admin/tasks?status=pending")
  }

  const navigateToLeaveRequests = () => {
    router.push("/admin/leave-requests?tab=pending")
  }

  const navigateToPerformance = () => {
    router.push("/admin/performance")
  }

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-[calc(100vh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Welcome back to your workforce management dashboard
        </p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Employees Card */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={navigateToEmployees}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <h2 className="text-2xl md:text-3xl font-bold">{dashboardData?.totalEmployees}</h2>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <span>View all employees</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        {/* Today's Attendance Card */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={navigateToAttendance}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Attendance</p>
                <h2 className="text-2xl md:text-3xl font-bold">
                  {dashboardData?.todayAttendance.present} / {dashboardData?.todayAttendance.total}
                </h2>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CalendarCheck className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2">
              <Progress
                value={
                  ((dashboardData?.todayAttendance.present || 0) / (dashboardData?.todayAttendance.total || 1)) * 100
                }
                className="h-2"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-2 justify-between text-xs">
              <div>
                <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                  Present: {dashboardData?.todayAttendance.present}
                </Badge>
              </div>
              <div>
                <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                  Absent: {dashboardData?.todayAttendance.absent}
                </Badge>
              </div>
              <div>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                  Late: {dashboardData?.todayAttendance.late}
                </Badge>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <span>View attendance details</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks Card */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={navigateToTasks}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Tasks</p>
                <h2 className="text-2xl md:text-3xl font-bold">{dashboardData?.pendingTasks}</h2>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <CheckSquare className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <span>View pending tasks</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Leave Requests Card */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={navigateToLeaveRequests}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Leave Requests</p>
                <h2 className="text-2xl md:text-3xl font-bold">{dashboardData?.pendingLeaveRequests}</h2>
              </div>
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <FileText className="h-5 w-5 md:h-6 md:w-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <span>View leave requests</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Star Performer and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Star Performer Card */}
        <Card
          className="lg:col-span-1 hover:shadow-md transition-shadow cursor-pointer"
          onClick={navigateToPerformance}
        >
          <CardHeader className="p-4 sm:p-6 pb-0 sm:pb-0">
            <CardTitle className="flex items-center text-lg">
              <Trophy className="h-5 w-5 mr-2 text-amber-500" />
              Star Performer
            </CardTitle>
            <CardDescription>Employee of the Month</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center">
            <Avatar className="h-16 w-16 md:h-20 md:w-20 mb-4">
              <AvatarImage src={dashboardData?.starPerformer.avatar} alt={dashboardData?.starPerformer.name} />
              <AvatarFallback>{dashboardData?.starPerformer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h3 className="text-lg md:text-xl font-bold">{dashboardData?.starPerformer.name}</h3>
            <p className="text-muted-foreground text-sm">{dashboardData?.starPerformer.department}</p>
            <div className="mt-2 flex items-center">
              <span className="text-xl md:text-2xl font-bold mr-2">
                {dashboardData?.starPerformer.performanceScore}
              </span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 w-full text-sm">
              <div className="bg-muted rounded-md p-2">
                <div className="font-medium">{dashboardData?.starPerformer.completedTasks}</div>
                <div className="text-xs text-muted-foreground">Tasks Completed</div>
              </div>
              <div className="bg-muted rounded-md p-2">
                <div className="flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="font-medium">High</span>
                </div>
                <div className="text-xs text-muted-foreground">Performance</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 sm:p-6 pt-0 sm:pt-0">
            <Button variant="outline" className="w-full" onClick={navigateToPerformance}>
              View Performance Details
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Activities Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="p-4 sm:p-6 pb-0 sm:pb-0">
            <CardTitle className="text-lg">Recent Activities</CardTitle>
            <CardDescription>Latest updates and activities</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              {dashboardData?.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {activity.type === "task" && (
                      <div className="bg-purple-100 p-2 rounded-full">
                        <CheckSquare className="h-4 w-4 text-purple-600" />
                      </div>
                    )}
                    {activity.type === "leave" && (
                      <div className="bg-amber-100 p-2 rounded-full">
                        <FileText className="h-4 w-4 text-amber-600" />
                      </div>
                    )}
                    {activity.type === "attendance" && (
                      <div className="bg-green-100 p-2 rounded-full">
                        <Clock className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                    {activity.type === "employee" && (
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm break-words">{activity.description}</p>
                    <p className="text-xs text-muted-foreground whitespace-normal">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

