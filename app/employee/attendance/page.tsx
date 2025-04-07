"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Clock,
  LogIn,
  LogOut,
  Calendar,
  BarChart2,
  Timer,
  CalendarDays,
  ClipboardCheck,
  ClockIcon,
  FileText,
  AlertCircle,
  CalendarRange,
  ArrowRightLeft,
} from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  differenceInHours,
  isToday,
} from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Types
type AttendanceStatus = "Present" | "Absent" | "Late" | "Half-Day"
type LeaveStatus = "Approved" | "Pending" | "Rejected"

interface AttendanceRecord {
  date: Date
  status: AttendanceStatus
  clockIn?: Date
  clockOut?: Date
  hoursWorked: number
  notes?: string
}

interface LeaveRequest {
  id: string
  startDate: Date
  endDate: Date
  reason: string
  status: LeaveStatus
  type: string
}

// Mock data
const generateMockAttendance = (): AttendanceRecord[] => {
  const today = new Date()
  const startDate = startOfMonth(today)
  const endDate = new Date() // Today

  const days = eachDayOfInterval({ start: startDate, end: endDate })

  return days.map((day) => {
    // Skip weekends
    if (day.getDay() === 0 || day.getDay() === 6) {
      return {
        date: day,
        status: "Absent",
        hoursWorked: 0,
        notes: "Weekend",
      }
    }

    // Random status
    const statuses: AttendanceStatus[] = ["Present", "Present", "Present", "Present", "Late", "Half-Day", "Absent"]
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

    // Generate clock in/out times based on status
    let clockIn,
      clockOut,
      hoursWorked = 0,
      notes

    if (randomStatus === "Present") {
      clockIn = new Date(day)
      clockIn.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 30), 0)

      clockOut = new Date(day)
      clockOut.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 30), 0)

      hoursWorked = differenceInHours(clockOut, clockIn)
    } else if (randomStatus === "Late") {
      clockIn = new Date(day)
      clockIn.setHours(10 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 30), 0)

      clockOut = new Date(day)
      clockOut.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 30), 0)

      hoursWorked = differenceInHours(clockOut, clockIn)
      notes = "Arrived late"
    } else if (randomStatus === "Half-Day") {
      clockIn = new Date(day)
      clockIn.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 30), 0)

      clockOut = new Date(day)
      clockOut.setHours(12 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 30), 0)

      hoursWorked = differenceInHours(clockOut, clockIn)
      notes = "Half day - Personal reasons"
    } else if (randomStatus === "Absent") {
      notes = "Sick leave"
    }

    return {
      date: day,
      status: randomStatus,
      clockIn,
      clockOut,
      hoursWorked,
      notes,
    }
  })
}

const mockLeaveRequests: LeaveRequest[] = [
  {
    id: "leave-1",
    startDate: new Date(2025, 3, 15),
    endDate: new Date(2025, 3, 17),
    reason: "Family vacation",
    status: "Approved",
    type: "Annual Leave",
  },
  {
    id: "leave-2",
    startDate: new Date(2025, 4, 5),
    endDate: new Date(2025, 4, 5),
    reason: "Medical appointment",
    status: "Approved",
    type: "Sick Leave",
  },
  {
    id: "leave-3",
    startDate: new Date(2025, 4, 20),
    endDate: new Date(2025, 4, 22),
    reason: "Personal matters",
    status: "Pending",
    type: "Personal Leave",
  },
]

export default function EmployeeAttendancePage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(generateMockAttendance())
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests)
  const [clockedIn, setClockedIn] = useState(false)
  const [lastClockIn, setLastClockIn] = useState<Date | null>(null)
  const [lastClockOut, setLastClockOut] = useState<Date | null>(null)
  const [todayHours, setTodayHours] = useState(0)
  const [viewMode, setViewMode] = useState("monthly")

  // Check if already clocked in today
  useEffect(() => {
    const todayRecord = attendanceRecords.find((record) => isToday(record.date))
    if (todayRecord && todayRecord.clockIn && !todayRecord.clockOut) {
      setClockedIn(true)
      setLastClockIn(todayRecord.clockIn)
    } else if (todayRecord && todayRecord.clockIn && todayRecord.clockOut) {
      setClockedIn(false)
      setLastClockIn(todayRecord.clockIn)
      setLastClockOut(todayRecord.clockOut)
      setTodayHours(todayRecord.hoursWorked)
    }
  }, [attendanceRecords])

  // Handle clock in/out
  const handleClockInOut = () => {
    const now = new Date()

    if (!clockedIn) {
      // Clock in
      setClockedIn(true)
      setLastClockIn(now)

      // Update attendance records
      const todayRecord = attendanceRecords.find((record) => isToday(record.date))

      if (todayRecord) {
        setAttendanceRecords((records) =>
          records.map((record) => (isToday(record.date) ? { ...record, clockIn: now, status: "Present" } : record)),
        )
      } else {
        setAttendanceRecords((records) => [
          ...records,
          {
            date: now,
            status: "Present",
            clockIn: now,
            hoursWorked: 0,
          },
        ])
      }
    } else {
      // Clock out
      setClockedIn(false)
      setLastClockOut(now)

      // Update attendance records
      setAttendanceRecords((records) =>
        records.map((record) => {
          if (isToday(record.date) && record.clockIn) {
            const hours = differenceInHours(now, record.clockIn)
            setTodayHours(hours)
            return {
              ...record,
              clockOut: now,
              hoursWorked: hours,
              status: hours < 4 ? "Half-Day" : hours < 8 ? "Present" : "Present",
            }
          }
          return record
        }),
      )
    }
  }

  // Calculate work hours summary
  const calculateWorkHours = () => {
    const today = new Date()

    // Daily (today)
    const dailyHours = todayHours

    // Weekly (current week)
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())

    const weeklyHours = attendanceRecords
      .filter((record) => {
        const recordDate = new Date(record.date)
        return recordDate >= startOfWeek && recordDate <= today
      })
      .reduce((total, record) => total + record.hoursWorked, 0)

    // Monthly (current month)
    const monthlyHours = attendanceRecords
      .filter((record) => {
        const recordDate = new Date(record.date)
        return recordDate.getMonth() === today.getMonth() && recordDate.getFullYear() === today.getFullYear()
      })
      .reduce((total, record) => total + record.hoursWorked, 0)

    return { dailyHours, weeklyHours, monthlyHours }
  }

  const { dailyHours, weeklyHours, monthlyHours } = calculateWorkHours()

  // Get status color
  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case "Present":
        return "bg-green-500"
      case "Absent":
        return "bg-red-500"
      case "Late":
        return "bg-amber-500"
      case "Half-Day":
        return "bg-blue-500"
      default:
        return "bg-slate-500"
    }
  }

  // Get leave status color
  const getLeaveStatusColor = (status: LeaveStatus) => {
    switch (status) {
      case "Approved":
        return "bg-green-500 text-white"
      case "Pending":
        return "bg-amber-500 text-white"
      case "Rejected":
        return "bg-red-500 text-white"
      default:
        return "bg-slate-500 text-white"
    }
  }

  // Navigate months
  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentDate(subMonths(currentDate, 1))
    } else {
      setCurrentDate(addMonths(currentDate, 1))
    }
  }

  // Filter records based on view mode
  const getFilteredRecords = () => {
    const today = new Date()

    if (viewMode === "weekly") {
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())

      const endOfWeek = new Date(today)
      endOfWeek.setDate(startOfWeek.getDate() + 6)

      return attendanceRecords.filter((record) => {
        const recordDate = new Date(record.date)
        return recordDate >= startOfWeek && recordDate <= endOfWeek
      })
    } else if (viewMode === "biweekly") {
      const startOfBiWeek = new Date(today)
      startOfBiWeek.setDate(today.getDate() - today.getDay() - 7)

      const endOfBiWeek = new Date(today)
      endOfBiWeek.setDate(startOfBiWeek.getDate() + 13)

      return attendanceRecords.filter((record) => {
        const recordDate = new Date(record.date)
        return recordDate >= startOfBiWeek && recordDate <= endOfBiWeek
      })
    } else {
      // Monthly view
      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(currentDate)

      return attendanceRecords.filter((record) => {
        const recordDate = new Date(record.date)
        return recordDate >= monthStart && recordDate <= monthEnd
      })
    }
  }

  const filteredRecords = getFilteredRecords()

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <CalendarDays className="mr-2 h-6 w-6 text-primary" />
          My Attendance
        </h1>

        {/* Clock In/Out Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClockIcon className="mr-2 h-5 w-5 text-primary" />
              Clock In/Out
            </CardTitle>
            <CardDescription>Track your daily attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1 w-full">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-slate-500" />
                    <span className="text-sm text-slate-500">Last Clock In:</span>
                    <span className="font-medium">
                      {lastClockIn ? format(lastClockIn, "h:mm a, MMM d, yyyy") : "Not clocked in yet today"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-slate-500" />
                    <span className="text-sm text-slate-500">Last Clock Out:</span>
                    <span className="font-medium">
                      {lastClockOut ? format(lastClockOut, "h:mm a, MMM d, yyyy") : "Not clocked out yet today"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-slate-500" />
                    <span className="text-sm text-slate-500">Today's Hours:</span>
                    <span className="font-medium">{todayHours.toFixed(1)} hours</span>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className={`${clockedIn ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"} w-full md:w-auto flex items-center justify-center gap-2`}
                onClick={handleClockInOut}
              >
                {clockedIn ? (
                  <>
                    <LogOut className="h-5 w-5" />
                    Clock Out
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    Clock In
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Work Hours Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Timer className="mr-2 h-5 w-5 text-primary" />
                Daily Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dailyHours.toFixed(1)}</div>
              <p className="text-sm text-slate-500">Hours worked today</p>
              <Progress value={(dailyHours / 8) * 100} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-primary" />
                Weekly Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{weeklyHours.toFixed(1)}</div>
              <p className="text-sm text-slate-500">Hours worked this week</p>
              <Progress value={(weeklyHours / 40) * 100} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <BarChart2 className="mr-2 h-5 w-5 text-primary" />
                Monthly Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{monthlyHours.toFixed(1)}</div>
              <p className="text-sm text-slate-500">Hours worked this month</p>
              <Progress value={(monthlyHours / 160) * 100} className="h-2 mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Attendance Overview */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 justify-between items-start md:items-center">
              <div>
                <CardTitle className="flex items-center">
                  <ClipboardCheck className="mr-2 h-5 w-5 text-primary" />
                  Attendance Overview
                </CardTitle>
                <CardDescription>View and track your attendance records</CardDescription>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                <Select value={viewMode} onValueChange={setViewMode}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="View Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly View</SelectItem>
                    <SelectItem value="weekly">Weekly View</SelectItem>
                    <SelectItem value="biweekly">Bi-Weekly View</SelectItem>
                  </SelectContent>
                </Select>

                {viewMode === "monthly" && (
                  <div className="flex items-center gap-2 mt-2 sm:mt-0 w-full justify-between sm:w-auto sm:justify-start">
                    <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
                      <ChevronLeftIcon className="h-4 w-4" />
                    </Button>
                    <div className="font-medium flex items-center">
                      <Calendar className="mr-1 h-4 w-4 text-slate-500" />
                      {format(currentDate, "MMMM yyyy")}
                    </div>
                    <Button variant="outline" size="icon" onClick={() => navigateMonth("next")}>
                      <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4 text-slate-500" />
                        Date
                      </div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <div className="flex items-center">
                        <AlertCircle className="mr-1 h-4 w-4 text-slate-500" />
                        Status
                      </div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <div className="flex items-center">
                        <LogIn className="mr-1 h-4 w-4 text-slate-500" />
                        Clock In
                      </div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <div className="flex items-center">
                        <LogOut className="mr-1 h-4 w-4 text-slate-500" />
                        Clock Out
                      </div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <div className="flex items-center">
                        <Timer className="mr-1 h-4 w-4 text-slate-500" />
                        Hours
                      </div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="mr-1 h-4 w-4 text-slate-500" />
                        Notes
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No attendance records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell>{format(new Date(record.date), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(record.status)} text-white`}>{record.status}</Badge>
                        </TableCell>
                        <TableCell>{record.clockIn ? format(new Date(record.clockIn), "h:mm a") : "-"}</TableCell>
                        <TableCell>{record.clockOut ? format(new Date(record.clockOut), "h:mm a") : "-"}</TableCell>
                        <TableCell>{record.hoursWorked.toFixed(1)}</TableCell>
                        <TableCell>{record.notes || "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Leave & Absence Record */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarRange className="mr-2 h-5 w-5 text-primary" />
              Leave & Absence Record
            </CardTitle>
            <CardDescription>View your leave requests and absences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="mr-1 h-4 w-4 text-slate-500" />
                        Type
                      </div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4 text-slate-500" />
                        From
                      </div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4 text-slate-500" />
                        To
                      </div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <div className="flex items-center">
                        <ArrowRightLeft className="mr-1 h-4 w-4 text-slate-500" />
                        Days
                      </div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="mr-1 h-4 w-4 text-slate-500" />
                        Reason
                      </div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      <div className="flex items-center">
                        <AlertCircle className="mr-1 h-4 w-4 text-slate-500" />
                        Status
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No leave requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    leaveRequests.map((leave) => (
                      <TableRow key={leave.id}>
                        <TableCell>{leave.type}</TableCell>
                        <TableCell>{format(new Date(leave.startDate), "MMM d, yyyy")}</TableCell>
                        <TableCell>{format(new Date(leave.endDate), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          {Math.ceil(
                            (new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) /
                              (1000 * 60 * 60 * 24),
                          ) + 1}
                        </TableCell>
                        <TableCell>{leave.reason}</TableCell>
                        <TableCell>
                          <Badge className={getLeaveStatusColor(leave.status)}>{leave.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

// Icons
function ChevronLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

