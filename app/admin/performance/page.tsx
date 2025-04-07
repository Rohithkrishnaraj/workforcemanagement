"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { DataList, type ColumnDef } from "@/components/data-list/data-list"
import { Loader2, Trophy, TrendingUp, CheckCircle, AlertCircle, Clock, X } from "lucide-react"
import { subMonths } from "date-fns"
import { employees, generateSampleTasks, calculatePerformanceMetrics } from "@/lib/data"

// Types
type TaskPriority = "high" | "medium" | "low"
type TaskStatus = "pending" | "in-progress" | "completed"
type PerformanceRating = "excellent" | "good" | "average" | "needs-improvement"

interface Employee {
  id: string
  name: string
  email: string
  department: string
  avatar?: string
}

interface Task {
  id: string
  title: string
  assignedTo: string
  priority: TaskPriority
  status: TaskStatus
  dueDate: string
  completedDate?: string
  category: string
}

interface EmployeePerformance {
  id: string
  employeeId: string
  employeeName: string
  employeeAvatar?: string
  employeeDepartment: string
  tasksCompleted: number
  highPriorityCompleted: number
  mediumPriorityCompleted: number
  lowPriorityCompleted: number
  onTimeCompletion: number
  lateCompletion: number
  averageCompletionTime: number // in days
  performanceScore: number // 0-100
  performanceRating: PerformanceRating
  month: string // "YYYY-MM"
}

// Format date for display
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

export default function PerformanceTrackingPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [performanceData, setPerformanceData] = useState<EmployeePerformance[]>([])
  const [filteredPerformance, setFilteredPerformance] = useState<EmployeePerformance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  // Filter states
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  })

  // Load initial data with a simulated delay
  useEffect(() => {
    const timer = setTimeout(() => {
      const taskData = generateSampleTasks()
      setTasks(taskData)

      const performanceMetrics = calculatePerformanceMetrics(taskData)
      setPerformanceData(performanceMetrics)
      setFilteredPerformance(performanceMetrics)

      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Apply filters when they change
  useEffect(() => {
    let result = [...performanceData]

    // Filter by department
    if (departmentFilter !== "all") {
      result = result.filter((item) => item.employeeDepartment === departmentFilter)
    }

    // Sort by performance score (highest first)
    result.sort((a, b) => b.performanceScore - a.performanceScore)

    setFilteredPerformance(result)
  }, [departmentFilter, performanceData])

  // Reset filters
  const resetFilters = () => {
    setDepartmentFilter("all")
  }

  // Get top performer
  const getTopPerformer = () => {
    if (filteredPerformance.length === 0) return null
    return filteredPerformance[0]
  }

  // Get department list
  const getDepartments = () => {
    const departments = new Set<string>()
    employees.forEach((employee) => departments.add(employee.department))
    return Array.from(departments)
  }

  // Render performance rating badge
  const renderPerformanceRatingBadge = (rating: PerformanceRating) => {
    switch (rating) {
      case "excellent":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Excellent</Badge>
      case "good":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Good</Badge>
      case "average":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Average</Badge>
      case "needs-improvement":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Needs Improvement</Badge>
      default:
        return null
    }
  }

  // Prepare chart data
  const getEmployeeComparisonData = () => {
    return filteredPerformance.slice(0, 5).map((employee) => ({
      name: employee.employeeName,
      score: employee.performanceScore,
      highPriority: employee.highPriorityCompleted,
      mediumPriority: employee.mediumPriorityCompleted,
      lowPriority: employee.lowPriorityCompleted,
    }))
  }

  const getPriorityDistributionData = () => {
    const totalHigh = filteredPerformance.reduce((sum, emp) => sum + emp.highPriorityCompleted, 0)
    const totalMedium = filteredPerformance.reduce((sum, emp) => sum + emp.mediumPriorityCompleted, 0)
    const totalLow = filteredPerformance.reduce((sum, emp) => sum + emp.lowPriorityCompleted, 0)

    return [
      { name: "High", value: totalHigh, color: "#ef4444" },
      { name: "Medium", value: totalMedium, color: "#f59e0b" },
      { name: "Low", value: totalLow, color: "#10b981" },
    ]
  }

  const getCompletionRateData = () => {
    const onTime = filteredPerformance.reduce((sum, emp) => sum + emp.onTimeCompletion, 0)
    const late = filteredPerformance.reduce((sum, emp) => sum + emp.lateCompletion, 0)

    return [
      { name: "On Time", value: onTime, color: "#10b981" },
      { name: "Late", value: late, color: "#ef4444" },
    ]
  }

  // Define columns for DataList
  const columns: ColumnDef<EmployeePerformance>[] = [
    {
      id: "employee",
      header: "Employee",
      accessorKey: "employeeName",
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.employeeAvatar} alt={row.employeeName} />
            <AvatarFallback>{row.employeeName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.employeeName}</div>
            <div className="text-xs text-muted-foreground">{row.employeeDepartment}</div>
          </div>
        </div>
      ),
    },
    {
      id: "tasksCompleted",
      header: "Tasks Completed",
      accessorKey: "tasksCompleted",
      cell: (row) => (
        <div className="font-medium">
          {row.tasksCompleted}
          <div className="text-xs text-muted-foreground">
            {row.highPriorityCompleted} high, {row.mediumPriorityCompleted} med, {row.lowPriorityCompleted} low
          </div>
        </div>
      ),
    },
    {
      id: "completionRate",
      header: "Completion Rate",
      accessorKey: (row) => (row.onTimeCompletion / (row.onTimeCompletion + row.lateCompletion)) * 100 || 0,
      cell: (row) => {
        const total = row.onTimeCompletion + row.lateCompletion
        const rate = total > 0 ? ((row.onTimeCompletion / total) * 100).toFixed(0) : "0"
        return (
          <div className="font-medium">
            {rate}%
            <div className="text-xs text-muted-foreground">
              {row.onTimeCompletion} on time, {row.lateCompletion} late
            </div>
          </div>
        )
      },
    },
    {
      id: "avgCompletionTime",
      header: "Avg. Completion Time",
      accessorKey: "averageCompletionTime",
      cell: (row) => (
        <div className="font-medium flex items-center">
          <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
          {row.averageCompletionTime > 0
            ? `${row.averageCompletionTime} days`
            : row.averageCompletionTime < 0
              ? `${Math.abs(row.averageCompletionTime)} days early`
              : "On time"}
        </div>
      ),
    },
    {
      id: "performanceScore",
      header: "Performance Score",
      accessorKey: "performanceScore",
      cell: (row) => (
        <div className="font-medium">
          {row.performanceScore}/100
          <div className="mt-1">{renderPerformanceRatingBadge(row.performanceRating)}</div>
        </div>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Performance Tracking</h1>
          <p className="text-muted-foreground">Monitor and analyze employee performance metrics</p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {getDepartments().map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={resetFilters} title="Reset filters">
            <X className="h-4 w-4" />
            <span className="sr-only">Reset filters</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employee Rankings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading performance data...</span>
            </div>
          ) : (
            <>
              {/* Top Performer Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center text-lg">
                      <Trophy className="h-5 w-5 mr-2 text-amber-500" />
                      Top Performer
                    </CardTitle>
                    <CardDescription>Employee of the Month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getTopPerformer() && (
                      <div className="flex flex-col items-center text-center">
                        <Avatar className="h-20 w-20 mb-4">
                          <AvatarImage src={getTopPerformer()?.employeeAvatar} alt={getTopPerformer()?.employeeName} />
                          <AvatarFallback>{getTopPerformer()?.employeeName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-bold">{getTopPerformer()?.employeeName}</h3>
                        <p className="text-muted-foreground">{getTopPerformer()?.employeeDepartment}</p>
                        <div className="mt-2 flex items-center">
                          <span className="text-2xl font-bold mr-2">{getTopPerformer()?.performanceScore}</span>
                          <span className="text-sm text-muted-foreground">/ 100</span>
                        </div>
                        <div className="mt-2">
                          {renderPerformanceRatingBadge(getTopPerformer()?.performanceRating || "average")}
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2 w-full text-sm">
                          <div className="bg-muted rounded-md p-2">
                            <div className="font-medium">{getTopPerformer()?.tasksCompleted}</div>
                            <div className="text-xs text-muted-foreground">Tasks Completed</div>
                          </div>
                          <div className="bg-muted rounded-md p-2">
                            <div className="font-medium">{getTopPerformer()?.highPriorityCompleted}</div>
                            <div className="text-xs text-muted-foreground">High Priority</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Summary Stats */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Performance Summary</CardTitle>
                    <CardDescription>Key metrics across all employees</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 rounded-lg p-4 flex flex-col">
                        <div className="text-muted-foreground text-sm mb-1">Total Tasks</div>
                        <div className="text-2xl font-bold">{tasks.filter((t) => t.status === "completed").length}</div>
                        <div className="mt-2 text-xs flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                          Completed
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-4 flex flex-col">
                        <div className="text-muted-foreground text-sm mb-1">High Priority</div>
                        <div className="text-2xl font-bold">
                          {filteredPerformance.reduce((sum, emp) => sum + emp.highPriorityCompleted, 0)}
                        </div>
                        <div className="mt-2 text-xs flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1 text-red-500" />
                          Completed
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-4 flex flex-col">
                        <div className="text-muted-foreground text-sm mb-1">On-Time Rate</div>
                        <div className="text-2xl font-bold">
                          {(() => {
                            const onTime = filteredPerformance.reduce((sum, emp) => sum + emp.onTimeCompletion, 0)
                            const total = onTime + filteredPerformance.reduce((sum, emp) => sum + emp.lateCompletion, 0)
                            return total > 0 ? `${Math.round((onTime / total) * 100)}%` : "0%"
                          })()}
                        </div>
                        <div className="mt-2 text-xs flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-blue-500" />
                          Completion rate
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-4 flex flex-col">
                        <div className="text-muted-foreground text-sm mb-1">Avg. Score</div>
                        <div className="text-2xl font-bold">
                          {filteredPerformance.length > 0
                            ? Math.round(
                                filteredPerformance.reduce((sum, emp) => sum + emp.performanceScore, 0) /
                                  filteredPerformance.length,
                              )
                            : 0}
                        </div>
                        <div className="mt-2 text-xs flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                          Performance
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Performers Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Performers</CardTitle>
                  <CardDescription>Employees ranked by performance score</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left font-medium p-2 pl-0">Rank</th>
                          <th className="text-left font-medium p-2">Employee</th>
                          <th className="text-left font-medium p-2">Department</th>
                          <th className="text-left font-medium p-2">High Priority</th>
                          <th className="text-left font-medium p-2">Score</th>
                          <th className="text-left font-medium p-2">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPerformance.slice(0, 5).map((employee, index) => (
                          <tr key={employee.id} className="border-b last:border-0">
                            <td className="p-2 pl-0">
                              <Badge variant={index === 0 ? "default" : "outline"} className="px-2 py-1">
                                #{index + 1}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={employee.employeeAvatar} alt={employee.employeeName} />
                                  <AvatarFallback>{employee.employeeName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{employee.employeeName}</span>
                              </div>
                            </td>
                            <td className="p-2">{employee.employeeDepartment}</td>
                            <td className="p-2">{employee.highPriorityCompleted}</td>
                            <td className="p-2 font-medium">{employee.performanceScore}/100</td>
                            <td className="p-2">{renderPerformanceRatingBadge(employee.performanceRating)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Employee Rankings Tab */}
        <TabsContent value="employees">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading employee data...</span>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Employee Performance Rankings</CardTitle>
                <CardDescription>Detailed performance metrics for all employees</CardDescription>
              </CardHeader>
              <CardContent>
                <DataList
                  data={filteredPerformance}
                  columns={columns}
                  searchable={true}
                  searchFields={["employeeName", "employeeDepartment"]}
                  filterable={true}
                  sortable={true}
                  pagination={true}
                  pageSize={10}
                  pageSizeOptions={[5, 10, 20]}
                  emptyMessage="No performance data available"
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

