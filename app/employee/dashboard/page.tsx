"use client"

import { useState, useEffect } from "react"
import { format, isToday, differenceInHours } from "date-fns"
import { Clock, Calendar, BarChart2, CheckSquare, ClipboardList, ArrowRight, Timer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Types
type TaskStatus = "Not Started" | "In Progress" | "Completed"
type TaskPriority = "High" | "Medium" | "Low"
type LeaveStatus = "Approved" | "Pending" | "Rejected"
type AttendanceStatus = "Present" | "Absent" | "Late" | "Half-Day"

interface Task {
  id: string
  name: string
  description: string
  deadline: Date
  priority: TaskPriority
  status: TaskStatus
  progress: number
  assignedBy: {
    name: string
    initials: string
  }
}

interface LeaveRequest {
  id: string
  type: string
  startDate: Date
  endDate: Date
  status: LeaveStatus
}

interface AttendanceSummary {
  present: number
  absent: number
  late: number
  halfDay: number
  totalHours: number
  averageHoursPerDay: number
}

// Mock data
const mockTasks: Task[] = [
  {
    id: "task-1",
    name: "Complete quarterly report",
    description: "Prepare and finalize the Q2 financial report",
    deadline: new Date(2025, 4, 15, 17, 0),
    priority: "High",
    status: "In Progress",
    progress: 65,
    assignedBy: { name: "Michael Johnson", initials: "MJ" },
  },
  {
    id: "task-2",
    name: "Update employee handbook",
    description: "Review and update the employee handbook with new policies",
    deadline: new Date(2025, 4, 20, 12, 0),
    priority: "Medium",
    status: "Not Started",
    progress: 0,
    assignedBy: { name: "Sarah Williams", initials: "SW" },
  },
  {
    id: "task-3",
    name: "Prepare client presentation",
    description: "Create slides for the upcoming client meeting",
    deadline: new Date(2025, 4, 12, 15, 30),
    priority: "High",
    status: "In Progress",
    progress: 30,
    assignedBy: { name: "Robert Chen", initials: "RC" },
  },
  {
    id: "task-4",
    name: "Conduct team training",
    description: "Organize and conduct training session on new software",
    deadline: new Date(2025, 4, 8, 10, 0),
    priority: "Medium",
    status: "Completed",
    progress: 100,
    assignedBy: { name: "Sarah Williams", initials: "SW" },
  },
  {
    id: "task-5",
    name: "Review budget proposal",
    description: "Review and approve department budget proposals for next quarter",
    deadline: new Date(),
    priority: "Low",
    status: "Not Started",
    progress: 0,
    assignedBy: { name: "Michael Johnson", initials: "MJ" },
  },
  {
    id: "task-6",
    name: "Update project timeline",
    description: "Revise project timeline based on recent changes",
    deadline: new Date(),
    priority: "Medium",
    status: "Not Started",
    progress: 0,
    assignedBy: { name: "Robert Chen", initials: "RC" },
  },
]

const mockLeaveRequests: LeaveRequest[] = [
  {
    id: "leave-1",
    type: "Annual Leave",
    startDate: new Date(2025, 4, 15),
    endDate: new Date(2025, 4, 17),
    status: "Approved",
  },
  {
    id: "leave-2",
    type: "Sick Leave",
    startDate: new Date(2025, 4, 5),
    endDate: new Date(2025, 4, 5),
    status: "Approved",
  },
  {
    id: "leave-3",
    type: "Personal Leave",
    startDate: new Date(2025, 4, 20),
    endDate: new Date(2025, 4, 22),
    status: "Pending",
  },
]

const mockAttendanceSummary = {
  monthly: {
    present: 18,
    absent: 2,
    late: 3,
    halfDay: 1,
    totalHours: 168,
    averageHoursPerDay: 7.6,
  },
  weekly: {
    present: 4,
    absent: 0,
    late: 1,
    halfDay: 0,
    totalHours: 38,
    averageHoursPerDay: 7.6,
  },
  biWeekly: {
    present: 8,
    absent: 1,
    late: 1,
    halfDay: 0,
    totalHours: 76,
    averageHoursPerDay: 7.6,
  },
}

const mockLeaveBalance = {
  annual: {
    total: 21,
    used: 7,
    remaining: 14,
  },
  sick: {
    total: 10,
    used: 3,
    remaining: 7,
  },
  personal: {
    total: 5,
    used: 2,
    remaining: 3,
  },
}

export default function EmployeeDashboardPage() {
  const [clockedIn, setClockedIn] = useState(false)
  const [lastClockIn, setLastClockIn] = useState<Date | null>(null)
  const [lastClockOut, setLastClockOut] = useState<Date | null>(null)
  const [todayHours, setTodayHours] = useState(0)
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [attendanceSummary, setAttendanceSummary] = useState<Record<string, AttendanceSummary>>(mockAttendanceSummary)
  const [leaveBalance, setLeaveBalance] = useState(mockLeaveBalance)
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests)
  const [attendancePeriod, setAttendancePeriod] = useState<"weekly" | "biWeekly" | "monthly">("weekly")

  // Check if already clocked in today (simulated)
  useEffect(() => {
    // Simulate retrieving clock in status from localStorage or API
    const storedClockIn = localStorage.getItem("clockIn")
    const storedClockOut = localStorage.getItem("clockOut")

    if (storedClockIn) {
      const clockInTime = new Date(storedClockIn)
      setLastClockIn(clockInTime)
      setClockedIn(storedClockOut ? false : true)

      if (storedClockOut) {
        const clockOutTime = new Date(storedClockOut)
        setLastClockOut(clockOutTime)

        // Calculate hours worked
        const hours = differenceInHours(clockOutTime, clockInTime)
        setTodayHours(hours)
      }
    }
  }, [])

  // Handle clock in/out
  const handleClockInOut = () => {
    const now = new Date()

    if (!clockedIn) {
      // Clock in
      setClockedIn(true)
      setLastClockIn(now)
      localStorage.setItem("clockIn", now.toISOString())
      localStorage.removeItem("clockOut")
    } else {
      // Clock out
      setClockedIn(false)
      setLastClockOut(now)
      localStorage.setItem("clockOut", now.toISOString())

      // Calculate hours worked if there was a clock in
      if (lastClockIn) {
        const hours = differenceInHours(now, lastClockIn)
        setTodayHours(hours)
      }
    }
  }

  // Get today's tasks
  const todaysTasks = tasks.filter((task) => isToday(new Date(task.deadline)))

  // Calculate task statistics
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((task) => task.status === "Completed").length,
    inProgress: tasks.filter((task) => task.status === "In Progress").length,
    notStarted: tasks.filter((task) => task.status === "Not Started").length,
  }

  // Calculate overall task completion percentage
  const overallTaskCompletion =
    tasks.length > 0
      ? Math.round((tasks.reduce((sum, task) => sum + task.progress, 0) / (tasks.length * 100)) * 100)
      : 0

  // Get upcoming leave requests (future dates and approved/pending status)
  const upcomingLeaves = leaveRequests
    .filter(
      (leave) => new Date(leave.startDate) > new Date() && (leave.status === "Approved" || leave.status === "Pending"),
    )
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

  // Get status color
  const getStatusColor = (status: TaskStatus | LeaveStatus) => {
    switch (status) {
      case "Completed":
      case "Approved":
        return "bg-green-500 text-white"
      case "In Progress":
      case "Pending":
        return "bg-amber-500 text-white"
      case "Not Started":
      case "Rejected":
        return "bg-red-500 text-white"
      default:
        return "bg-slate-500 text-white"
    }
  }

  // Get priority color
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "High":
        return "text-red-500"
      case "Medium":
        return "text-amber-500"
      case "Low":
        return "text-green-500"
      default:
        return "text-slate-500"
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-6">Employee Dashboard</h1>

        {/* Quick Stats Section - Improve grid responsiveness */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
          {/* Task Status Card - Adjust internal spacing */}
          <Card className="h-full">
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="text-base md:text-lg flex items-center">
                <CheckSquare className="mr-2 h-4 w-4 md:h-5 md:w-5 text-primary" />
                Task Status
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col items-center justify-center p-2 bg-green-50 rounded-md">
                  <span className="text-xl md:text-2xl font-bold text-green-600">{taskStats.completed}</span>
                  <span className="text-xs text-green-600">Completed</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 bg-amber-50 rounded-md">
                  <span className="text-xl md:text-2xl font-bold text-amber-600">{taskStats.inProgress}</span>
                  <span className="text-xs text-amber-600">In Progress</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 bg-red-50 rounded-md">
                  <span className="text-xl md:text-2xl font-bold text-red-600">{taskStats.notStarted}</span>
                  <span className="text-xs text-red-600">Not Started</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-md border border-slate-200">
                  <span className="text-xl md:text-2xl font-bold text-slate-600">{taskStats.total}</span>
                  <span className="text-xs text-slate-600">Total</span>
                </div>
              </div>
              <div className="mt-3 md:mt-4">
                <div className="flex justify-between text-xs md:text-sm mb-1">
                  <span>Overall Completion</span>
                  <span>{overallTaskCompletion}%</span>
                </div>
                <Progress value={overallTaskCompletion} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Attendance Summary Card - Improve tabs for mobile */}
          <Card className="h-full">
            <CardHeader className="pb-2 px-4 pt-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <CardTitle className="text-base md:text-lg flex items-center">
                  <BarChart2 className="mr-2 h-4 w-4 md:h-5 md:w-5 text-primary" />
                  Attendance Summary
                </CardTitle>
                <Tabs
                  value={attendancePeriod}
                  onValueChange={(v) => setAttendancePeriod(v as "weekly" | "biWeekly" | "monthly")}
                  className="w-full sm:w-auto"
                >
                  <TabsList className="h-7 p-0 w-full sm:w-auto grid grid-cols-3 sm:flex">
                    <TabsTrigger value="weekly" className="text-xs px-1 md:px-2 h-7">
                      Weekly
                    </TabsTrigger>
                    <TabsTrigger value="biWeekly" className="text-xs px-1 md:px-2 h-7">
                      Bi-Weekly
                    </TabsTrigger>
                    <TabsTrigger value="monthly" className="text-xs px-1 md:px-2 h-7">
                      Monthly
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="flex flex-col">
                  <span className="text-xs md:text-sm text-slate-500">Present Days</span>
                  <span className="text-lg md:text-xl font-bold">{attendanceSummary[attendancePeriod].present}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs md:text-sm text-slate-500">Total Hours</span>
                  <span className="text-lg md:text-xl font-bold">{attendanceSummary[attendancePeriod].totalHours}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs md:text-sm bg-slate-100 p-2 rounded-md">
                <span>Average Hours/Day</span>
                <span className="font-medium">{attendanceSummary[attendancePeriod].averageHoursPerDay}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs">Present: {attendanceSummary[attendancePeriod].present}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-amber-500"></div>
                  <span className="text-xs">Late: {attendanceSummary[attendancePeriod].late}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs">Absent: {attendanceSummary[attendancePeriod].absent}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leave Balance Card - Adjust spacing */}
          <Card className="h-full sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="text-base md:text-lg flex items-center">
                <Calendar className="mr-2 h-4 w-4 md:h-5 md:w-5 text-primary" />
                Leave Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs md:text-sm mb-1">
                    <span>Annual Leave</span>
                    <span>
                      {leaveBalance.annual.remaining} / {leaveBalance.annual.total} days
                    </span>
                  </div>
                  <Progress value={(leaveBalance.annual.used / leaveBalance.annual.total) * 100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-xs md:text-sm mb-1">
                    <span>Sick Leave</span>
                    <span>
                      {leaveBalance.sick.remaining} / {leaveBalance.sick.total} days
                    </span>
                  </div>
                  <Progress value={(leaveBalance.sick.used / leaveBalance.sick.total) * 100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-xs md:text-sm mb-1">
                    <span>Personal Leave</span>
                    <span>
                      {leaveBalance.personal.remaining} / {leaveBalance.personal.total} days
                    </span>
                  </div>
                  <Progress value={(leaveBalance.personal.used / leaveBalance.personal.total) * 100} className="h-2" />
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full mt-3 md:mt-4 text-xs md:text-sm" asChild>
                <a href="/employee/leave-requests">
                  Request Leave
                  <ArrowRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Clock In/Out Section - Improve mobile layout */}
        <Card className="mb-4 md:mb-6">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-base md:text-lg flex items-center">
              <Clock className="mr-2 h-4 w-4 md:h-5 md:w-5 text-primary" />
              Clock In/Out
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Track your daily attendance</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
              <div className="flex-1 w-full">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 md:h-5 md:w-5 text-slate-500" />
                    <span className="text-xs md:text-sm text-slate-500">Last Clock In:</span>
                    <span className="text-xs md:text-sm font-medium">
                      {lastClockIn ? format(lastClockIn, "h:mm a, MMM d, yyyy") : "Not clocked in yet today"}
                    </span>
                  </div>

                  {lastClockOut && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 md:h-5 md:w-5 text-slate-500" />
                      <span className="text-xs md:text-sm text-slate-500">Last Clock Out:</span>
                      <span className="text-xs md:text-sm font-medium">
                        {format(lastClockOut, "h:mm a, MMM d, yyyy")}
                      </span>
                    </div>
                  )}

                  {todayHours > 0 && (
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 md:h-5 md:w-5 text-slate-500" />
                      <span className="text-xs md:text-sm text-slate-500">Today's Hours:</span>
                      <span className="text-xs md:text-sm font-medium">{todayHours.toFixed(1)} hours</span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                size="default"
                className={`${clockedIn ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"} w-full md:w-auto mt-2 md:mt-0`}
                onClick={handleClockInOut}
              >
                {clockedIn ? "Clock Out" : "Clock In"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Today's Tasks Overview - Improve card layout */}
        <Card className="mb-4 md:mb-6">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-base md:text-lg flex items-center">
              <ClipboardList className="mr-2 h-4 w-4 md:h-5 md:w-5 text-primary" />
              Today's Tasks
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Tasks due today</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {todaysTasks.length === 0 ? (
              <div className="text-center py-4 md:py-6">
                <p className="text-slate-500 text-sm">No tasks due today</p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {todaysTasks.map((task) => (
                  <div key={task.id} className="p-3 border rounded-md">
                    <div className="flex justify-between items-start mb-2">
                      <div className="pr-2">
                        <h3 className="font-medium text-sm md:text-base">{task.name}</h3>
                        <p className="text-xs md:text-sm text-slate-500 line-clamp-2">{task.description}</p>
                      </div>
                      <Badge className={`${getStatusColor(task.status)} text-xs whitespace-nowrap`}>
                        {task.status}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center text-xs md:text-sm mb-1">
                      <div className="flex items-center gap-1">
                        <Timer className="h-3 w-3 md:h-4 md:w-4 text-slate-500" />
                        <span>Due: {format(new Date(task.deadline), "h:mm a")}</span>
                      </div>
                      <span className={`font-medium ${getPriorityColor(task.priority)} text-xs`}>
                        {task.priority} Priority
                      </span>
                    </div>

                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="h-1.5" />
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-5 w-5 md:h-6 md:w-6">
                          <AvatarFallback className="text-xs">{task.assignedBy.initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-slate-500 hidden sm:inline">
                          Assigned by {task.assignedBy.name}
                        </span>
                        <span className="text-xs text-slate-500 sm:hidden">By {task.assignedBy.initials}</span>
                      </div>

                      <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                        <a href={`/employee/tasks?id=${task.id}`}>View</a>
                      </Button>
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full text-xs md:text-sm" asChild>
                  <a href="/employee/tasks">
                    View All Tasks
                    <ArrowRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Leaves - Improve card layout */}
        <Card>
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-base md:text-lg flex items-center">
              <Calendar className="mr-2 h-4 w-4 md:h-5 md:w-5 text-primary" />
              Upcoming Leaves
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Your approved and pending leave requests</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {upcomingLeaves.length === 0 ? (
              <div className="text-center py-4 md:py-6">
                <p className="text-slate-500 text-sm">No upcoming leave requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingLeaves.map((leave) => (
                  <div key={leave.id} className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <h3 className="font-medium text-sm md:text-base">{leave.type}</h3>
                      <p className="text-xs md:text-sm text-slate-500">
                        {format(new Date(leave.startDate), "MMM d, yyyy")}
                        {leave.startDate.toDateString() !== leave.endDate.toDateString() &&
                          ` - ${format(new Date(leave.endDate), "MMM d, yyyy")}`}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(leave.status)} text-xs`}>{leave.status}</Badge>
                  </div>
                ))}

                <Button variant="outline" className="w-full text-xs md:text-sm" asChild>
                  <a href="/employee/leave-requests">
                    Manage Leave Requests
                    <ArrowRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

