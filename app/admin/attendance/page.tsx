"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Edit, FileDown, Calendar, Clock, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { DataList, type ColumnDef } from "@/components/data-list/data-list"
import { Card, CardContent } from "@/components/ui/card"
import { employees, generateSampleAttendanceData, formatTime, formatDate } from "@/lib/data"

// Types
type AttendanceStatus = "present" | "absent" | "late"

interface Employee {
  id: string
  name: string
  email: string
  department: string
  avatar?: string
}

interface AttendanceRecord {
  id: string
  employeeId: string
  employeeName: string
  employeeAvatar?: string
  date: string
  clockIn: string | null
  clockOut: string | null
  totalHours: number | null
  status: AttendanceStatus
}

export default function AttendanceManagementPage() {
  const { toast } = useToast()
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filter states
  const [employeeFilter, setEmployeeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })

  // Edit modal state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    clockIn: "",
    clockOut: "",
    status: "present" as AttendanceStatus,
  })

  // PDF export ref
  const tableRef = useRef<HTMLDivElement>(null)

  // Load initial data with a simulated delay
  useEffect(() => {
    const timer = setTimeout(() => {
      const data = generateSampleAttendanceData()
      setAttendanceRecords(data)
      setFilteredRecords(data)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Apply filters when they change
  useEffect(() => {
    let result = [...attendanceRecords]

    // Filter by employee
    if (employeeFilter !== "all") {
      result = result.filter((record) => record.employeeId === employeeFilter)
    }

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((record) => record.status === statusFilter)
    }

    // Filter by date range
    if (dateRange.from) {
      result = result.filter((record) => {
        const recordDate = new Date(record.date)
        return recordDate >= dateRange.from!
      })
    }

    if (dateRange.to) {
      result = result.filter((record) => {
        const recordDate = new Date(record.date)
        return recordDate <= dateRange.to!
      })
    }

    setFilteredRecords(result)
  }, [employeeFilter, statusFilter, dateRange, attendanceRecords])

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Calculate total hours based on clock in and clock out
  const calculateTotalHours = (clockIn: string, clockOut: string): number | null => {
    if (!clockIn || !clockOut) return null

    const [inHours, inMinutes] = clockIn.split(":").map(Number)
    const [outHours, outMinutes] = clockOut.split(":").map(Number)

    const totalMinutes = outHours * 60 + outMinutes - (inHours * 60 + inMinutes)
    return Number.parseFloat((totalMinutes / 60).toFixed(2))
  }

  // Open edit dialog and populate form
  const openEditDialog = (record: AttendanceRecord) => {
    setSelectedRecord(record)
    setFormData({
      clockIn: record.clockIn || "",
      clockOut: record.clockOut || "",
      status: record.status,
    })
    setEditDialogOpen(true)
  }

  // Update attendance record
  const handleUpdateAttendance = () => {
    if (!selectedRecord) return

    const totalHours =
      formData.clockIn && formData.clockOut ? calculateTotalHours(formData.clockIn, formData.clockOut) : null

    const updatedRecord = {
      ...selectedRecord,
      clockIn: formData.clockIn || null,
      clockOut: formData.clockOut || null,
      totalHours,
      status: formData.status,
    }

    const updatedRecords = attendanceRecords.map((record) => (record.id === selectedRecord.id ? updatedRecord : record))

    setAttendanceRecords(updatedRecords)
    setEditDialogOpen(false)

    toast({
      title: "Attendance Updated",
      description: `Attendance record for ${selectedRecord.employeeName} on ${formatDate(selectedRecord.date)} has been updated.`,
    })
  }

  // Export to PDF
  const handleExportPDF = () => {
    toast({
      title: "Export Started",
      description: "Attendance data is being exported to PDF.",
    })

    // In a real implementation, you would use a library like jsPDF or html2pdf
    // to generate a PDF from the table data
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Attendance data has been exported to PDF successfully.",
      })
    }, 1500)
  }

  // Reset filters
  const resetFilters = () => {
    setEmployeeFilter("all")
    setStatusFilter("all")
    setDateRange({ from: undefined, to: undefined })
  }

  // Render status badge
  const renderStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Present</Badge>
      case "absent":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Absent</Badge>
      case "late":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Late</Badge>
      default:
        return null
    }
  }

  // Define columns for DataList
  const columns: ColumnDef<AttendanceRecord>[] = [
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
          </div>
        </div>
      ),
    },
    {
      id: "date",
      header: "Date",
      accessorKey: "date",
      cell: (row) => (
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(row.date)}</span>
        </div>
      ),
    },
    {
      id: "clockIn",
      header: "Clock In",
      accessorKey: "clockIn",
      cell: (row) => (
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{formatTime(row.clockIn)}</span>
        </div>
      ),
    },
    {
      id: "clockOut",
      header: "Clock Out",
      accessorKey: "clockOut",
      cell: (row) => (
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{formatTime(row.clockOut)}</span>
        </div>
      ),
    },
    {
      id: "totalHours",
      header: "Total Hours",
      accessorKey: "totalHours",
      cell: (row) => <span>{row.totalHours !== null ? `${row.totalHours} hrs` : "—"}</span>,
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: (row) => renderStatusBadge(row.status),
    },
    {
      id: "actions",
      header: "Actions",
      accessorKey: "id",
      enableSorting: false,
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" onClick={() => openEditDialog(row)}>
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Attendance Management</h1>
          <p className="text-muted-foreground">Track and manage employee attendance records</p>
        </div>
        <Button onClick={handleExportPDF} className="transition-all hover:scale-105">
          <FileDown className="mr-2 h-4 w-4" />
          Export to PDF
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee-filter">Employee</Label>
              <Select value={employeeFilter} onValueChange={(value) => setEmployeeFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full" onClick={resetFilters}>
                <X className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records Table */}
      <div ref={tableRef}>
        <DataList
          data={filteredRecords}
          columns={columns}
          searchable={true}
          searchFields={["employeeName", "date"]}
          filterable={true}
          sortable={true}
          pagination={true}
          pageSize={10}
          pageSizeOptions={[10, 20, 50, 100]}
          emptyMessage="No attendance records found"
          isLoading={isLoading}
          loadingComponent={
            <div className="flex justify-center items-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Loading attendance records...</span>
            </div>
          }
        />
      </div>

      {/* Edit Attendance Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Attendance Record</DialogTitle>
            <DialogDescription>
              Update the attendance record for {selectedRecord?.employeeName} on{" "}
              {selectedRecord ? formatDate(selectedRecord.date) : ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clockIn">Clock In Time</Label>
                <Input id="clockIn" name="clockIn" type="time" value={formData.clockIn} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clockOut">Clock Out Time</Label>
                <Input
                  id="clockOut"
                  name="clockOut"
                  type="time"
                  value={formData.clockOut}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: AttendanceStatus) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.status === "absent" && (
              <div className="rounded-md bg-amber-50 p-4 text-sm text-amber-800">
                <p>When marking as absent, clock in and clock out times will be cleared.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAttendance}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

