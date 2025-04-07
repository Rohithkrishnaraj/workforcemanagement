"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format, differenceInDays, isAfter, isBefore, isEqual } from "date-fns"
import { CalendarIcon, Search, Upload, CheckCircle, XCircle, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// Types
type LeaveStatus = "Approved" | "Pending" | "Rejected"
type LeaveType =
  | "Annual Leave"
  | "Sick Leave"
  | "Personal Leave"
  | "Maternity/Paternity Leave"
  | "Bereavement Leave"
  | "Unpaid Leave"
  | "Other"

interface LeaveRequest {
  id: string
  type: LeaveType
  startDate: Date
  endDate: Date
  reason: string
  status: LeaveStatus
  documents?: string[]
  submittedOn: Date
  approvedBy?: string
  approvedOn?: Date
  comments?: string
}

// Mock data
const mockLeaveRequests: LeaveRequest[] = [
  {
    id: "leave-1",
    type: "Annual Leave",
    startDate: new Date(2025, 3, 15),
    endDate: new Date(2025, 3, 17),
    reason: "Family vacation",
    status: "Approved",
    submittedOn: new Date(2025, 3, 1),
    approvedBy: "Sarah Williams",
    approvedOn: new Date(2025, 3, 3),
    comments: "Approved. Enjoy your vacation!",
  },
  {
    id: "leave-2",
    type: "Sick Leave",
    startDate: new Date(2025, 4, 5),
    endDate: new Date(2025, 4, 5),
    reason: "Medical appointment",
    status: "Approved",
    submittedOn: new Date(2025, 4, 2),
    approvedBy: "Sarah Williams",
    approvedOn: new Date(2025, 4, 3),
    comments: "Approved. Get well soon!",
  },
  {
    id: "leave-3",
    type: "Personal Leave",
    startDate: new Date(2025, 4, 20),
    endDate: new Date(2025, 4, 22),
    reason: "Personal matters",
    status: "Pending",
    submittedOn: new Date(2025, 4, 10),
  },
  {
    id: "leave-4",
    type: "Unpaid Leave",
    startDate: new Date(2025, 5, 10),
    endDate: new Date(2025, 5, 15),
    reason: "Extended personal time",
    status: "Rejected",
    submittedOn: new Date(2025, 5, 1),
    approvedBy: "Sarah Williams",
    approvedOn: new Date(2025, 5, 3),
    comments: "Rejected due to upcoming project deadlines. Please reschedule.",
  },
]

export default function EmployeeLeaveRequestsPage() {
  // State for leave application form
  const [leaveType, setLeaveType] = useState<LeaveType | "">("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [reason, setReason] = useState("")
  const [documents, setDocuments] = useState<File[]>([])
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // State for leave requests list
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests)
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>(mockLeaveRequests)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  // Add a new state variable for leave type filter after the searchQuery and statusFilter states
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)

  // Apply filters and search
  // Update the useEffect for filtering to include the leave type filter
  useEffect(() => {
    let result = [...leaveRequests]

    // Apply search
    if (searchQuery) {
      result = result.filter(
        (request) =>
          request.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.reason.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((request) => request.status === statusFilter)
    }

    // Apply leave type filter
    if (typeFilter !== "all") {
      result = result.filter((request) => request.type === typeFilter)
    }

    // Sort by submission date (newest first)
    result.sort((a, b) => b.submittedOn.getTime() - a.submittedOn.getTime())

    setFilteredRequests(result)
  }, [leaveRequests, searchQuery, statusFilter, typeFilter])

  // Calculate leave duration
  const calculateDuration = (start?: Date, end?: Date) => {
    if (!start || !end) return 0
    return differenceInDays(end, start) + 1
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const errors: Record<string, string> = {}

    if (!leaveType) {
      errors.leaveType = "Leave type is required"
    }

    if (!startDate) {
      errors.startDate = "Start date is required"
    }

    if (!endDate) {
      errors.endDate = "End date is required"
    }

    if (startDate && endDate && isAfter(startDate, endDate)) {
      errors.dateRange = "End date cannot be before start date"
    }

    if (!reason.trim()) {
      errors.reason = "Reason is required"
    }

    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    // Submit form
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      const newLeaveRequest: LeaveRequest = {
        id: `leave-${Date.now()}`,
        type: leaveType as LeaveType,
        startDate: startDate as Date,
        endDate: endDate as Date,
        reason,
        status: "Pending",
        submittedOn: new Date(),
        documents: documents.length > 0 ? documents.map((doc) => doc.name) : undefined,
      }

      setLeaveRequests((prev) => [newLeaveRequest, ...prev])

      // Reset form
      setLeaveType("")
      setStartDate(undefined)
      setEndDate(undefined)
      setReason("")
      setDocuments([])
      setFormErrors({})
      setIsSubmitting(false)
      setShowSuccess(true)

      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 5000)
    }, 1500)
  }

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files)
      setDocuments((prev) => [...prev, ...fileArray])
    }
  }

  // Remove uploaded file
  const removeFile = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index))
  }

  // Get status color
  const getStatusColor = (status: LeaveStatus) => {
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

  // Get status icon
  const getStatusIcon = (status: LeaveStatus) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="h-4 w-4" />
      case "Pending":
        return <Clock className="h-4 w-4" />
      case "Rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  // Add a function to get unique leave types from the leave requests
  const getUniqueLeaveTypes = () => {
    const types = leaveRequests.map((request) => request.type)
    return [...new Set(types)]
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-6">Leave Requests</h1>

        <Tabs defaultValue="apply" className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="apply">Apply for Leave</TabsTrigger>
            <TabsTrigger value="history">Leave History</TabsTrigger>
          </TabsList>

          <TabsContent value="apply" className="mt-6">
            {showSuccess && (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">Success</AlertTitle>
                <AlertDescription className="text-green-600">
                  Your leave request has been submitted successfully and is pending approval.
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Apply for Leave</CardTitle>
                <CardDescription>
                  Fill out the form below to submit a leave request. All fields marked with * are required.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="leaveType" className="text-base">
                        Leave Type *
                      </Label>
                      <Select value={leaveType} onValueChange={setLeaveType}>
                        <SelectTrigger id="leaveType" className={cn(formErrors.leaveType && "border-red-500")}>
                          <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                          <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                          <SelectItem value="Personal Leave">Personal Leave</SelectItem>
                          <SelectItem value="Maternity/Paternity Leave">Maternity/Paternity Leave</SelectItem>
                          <SelectItem value="Bereavement Leave">Bereavement Leave</SelectItem>
                          <SelectItem value="Unpaid Leave">Unpaid Leave</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.leaveType && <p className="text-sm text-red-500 mt-1">{formErrors.leaveType}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate" className="text-base">
                          Start Date *
                        </Label>
                        <div className="relative">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !startDate && "text-muted-foreground",
                                  formErrors.startDate && "border-red-500",
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? format(startDate, "PPP") : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={startDate}
                                onSelect={setStartDate}
                                initialFocus
                                disabled={(date) => isBefore(date, new Date())}
                              />
                            </PopoverContent>
                          </Popover>
                          {formErrors.startDate && <p className="text-sm text-red-500 mt-1">{formErrors.startDate}</p>}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="endDate" className="text-base">
                          End Date *
                        </Label>
                        <div className="relative">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !endDate && "text-muted-foreground",
                                  formErrors.endDate && "border-red-500",
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endDate ? format(endDate, "PPP") : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={setEndDate}
                                initialFocus
                                disabled={(date) =>
                                  isBefore(date, new Date()) || (startDate ? isBefore(date, startDate) : false)
                                }
                              />
                            </PopoverContent>
                          </Popover>
                          {formErrors.endDate && <p className="text-sm text-red-500 mt-1">{formErrors.endDate}</p>}
                        </div>
                      </div>
                    </div>

                    {formErrors.dateRange && <p className="text-sm text-red-500">{formErrors.dateRange}</p>}

                    {startDate && endDate && isAfter(endDate, startDate) && (
                      <div className="bg-slate-100 p-3 rounded-md">
                        <p className="text-sm">
                          Duration: <span className="font-medium">{calculateDuration(startDate, endDate)} day(s)</span>
                        </p>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="reason" className="text-base">
                        Reason for Leave *
                      </Label>
                      <Textarea
                        id="reason"
                        placeholder="Please provide a reason for your leave request"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className={cn("min-h-[100px]", formErrors.reason && "border-red-500")}
                      />
                      {formErrors.reason && <p className="text-sm text-red-500 mt-1">{formErrors.reason}</p>}
                    </div>

                    <div>
                      <Label htmlFor="documents" className="text-base">
                        Supporting Documents (Optional)
                      </Label>
                      <div className="mt-2">
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="dropzone-file"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-2 text-slate-500" />
                              <p className="mb-2 text-sm text-slate-500">
                                <span className="font-medium">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-slate-500">PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
                            </div>
                            <Input
                              id="dropzone-file"
                              type="file"
                              className="hidden"
                              multiple
                              onChange={handleFileChange}
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                          </label>
                        </div>
                      </div>

                      {documents.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <Label>Uploaded Documents</Label>
                          <ul className="space-y-2">
                            {documents.map((file, index) => (
                              <li key={index} className="flex items-center justify-between p-2 bg-slate-100 rounded-md">
                                <span className="text-sm truncate max-w-[80%]">{file.name}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  className="h-8 w-8 p-0"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <CardFooter className="flex justify-end px-0 pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Leave Request"}
                    </Button>
                  </CardFooter>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <CardTitle>Leave History</CardTitle>
                    <CardDescription>View and track your leave requests</CardDescription>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                      <Input
                        placeholder="Search leave requests..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue placeholder="Leave Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {getUniqueLeaveTypes().map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[140px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted On</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            No leave requests found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>{request.type}</TableCell>
                            <TableCell>{calculateDuration(request.startDate, request.endDate)} day(s)</TableCell>
                            <TableCell>
                              {format(new Date(request.startDate), "MMM d, yyyy")}
                              {!isEqual(request.startDate, request.endDate) &&
                                ` - ${format(new Date(request.endDate), "MMM d, yyyy")}`}
                            </TableCell>
                            <TableCell>
                              <Badge className={`flex items-center gap-1 ${getStatusColor(request.status)}`}>
                                {getStatusIcon(request.status)}
                                {request.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{format(new Date(request.submittedOn), "MMM d, yyyy")}</TableCell>
                            <TableCell className="text-right">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                                    View Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                                  <DialogHeader>
                                    <DialogTitle>Leave Request Details</DialogTitle>
                                    <DialogDescription>Detailed information about your leave request</DialogDescription>
                                  </DialogHeader>

                                  {selectedRequest && (
                                    <div className="space-y-4 mt-2">
                                      <div className="flex justify-between items-center">
                                        <h3 className="font-medium">Status</h3>
                                        <Badge className={`${getStatusColor(selectedRequest.status)}`}>
                                          {selectedRequest.status}
                                        </Badge>
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                          <h3 className="font-medium text-sm">Leave Type</h3>
                                          <p className="text-sm sm:text-base">{selectedRequest.type}</p>
                                        </div>
                                        <div>
                                          <h3 className="font-medium text-sm">Duration</h3>
                                          <p className="text-sm sm:text-base">
                                            {calculateDuration(selectedRequest.startDate, selectedRequest.endDate)}{" "}
                                            day(s)
                                          </p>
                                        </div>
                                        <div>
                                          <h3 className="font-medium text-sm">Start Date</h3>
                                          <p className="text-sm sm:text-base">
                                            {format(new Date(selectedRequest.startDate), "MMM d, yyyy")}
                                          </p>
                                        </div>
                                        <div>
                                          <h3 className="font-medium text-sm">End Date</h3>
                                          <p className="text-sm sm:text-base">
                                            {format(new Date(selectedRequest.endDate), "MMM d, yyyy")}
                                          </p>
                                        </div>
                                      </div>

                                      <div>
                                        <h3 className="font-medium text-sm">Reason</h3>
                                        <p className="text-sm sm:text-base mt-1">{selectedRequest.reason}</p>
                                      </div>

                                      {selectedRequest.documents && selectedRequest.documents.length > 0 && (
                                        <div>
                                          <h3 className="font-medium text-sm">Supporting Documents</h3>
                                          <ul className="text-sm list-disc list-inside mt-1">
                                            {selectedRequest.documents.map((doc, index) => (
                                              <li key={index} className="truncate">
                                                {doc}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}

                                      <div>
                                        <h3 className="font-medium text-sm">Submitted On</h3>
                                        <p className="text-sm sm:text-base">
                                          {format(new Date(selectedRequest.submittedOn), "MMM d, yyyy")}
                                        </p>
                                      </div>

                                      {selectedRequest.approvedBy && (
                                        <div>
                                          <h3 className="font-medium text-sm">
                                            {selectedRequest.status === "Approved" ? "Approved By" : "Reviewed By"}
                                          </h3>
                                          <p className="text-sm sm:text-base">{selectedRequest.approvedBy}</p>
                                        </div>
                                      )}

                                      {selectedRequest.approvedOn && (
                                        <div>
                                          <h3 className="font-medium text-sm">
                                            {selectedRequest.status === "Approved" ? "Approved On" : "Reviewed On"}
                                          </h3>
                                          <p className="text-sm sm:text-base">
                                            {format(new Date(selectedRequest.approvedOn), "MMM d, yyyy")}
                                          </p>
                                        </div>
                                      )}

                                      {selectedRequest.comments && (
                                        <div>
                                          <h3 className="font-medium text-sm">Comments</h3>
                                          <p className="text-sm sm:text-base mt-1">{selectedRequest.comments}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  <DialogFooter className="mt-6 sm:mt-8">
                                    {selectedRequest && selectedRequest.status === "Pending" && (
                                      <Button
                                        variant="outline"
                                        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 w-full sm:w-auto"
                                        onClick={() => {
                                          if (selectedRequest) {
                                            setLeaveRequests((prev) =>
                                              prev.filter((req) => req.id !== selectedRequest.id),
                                            )
                                            setSelectedRequest(null)
                                          }
                                        }}
                                      >
                                        Cancel Request
                                      </Button>
                                    )}
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

