"use client"

import { useState, useEffect } from "react"
import { Check, X, Eye, Calendar, MessageSquare, Loader2 } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { DataList, type ColumnDef } from "@/components/data-list/data-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { employees, adminUser, generateSampleLeaveRequests, formatDateRange } from "@/lib/data"

// Types
type LeaveStatus = "pending" | "approved" | "rejected"
type LeaveType = "vacation" | "sick" | "personal" | "bereavement" | "unpaid"

interface Employee {
  id: string
  name: string
  email: string
  department: string
  avatar?: string
}

interface LeaveRequest {
  id: string
  employeeId: string
  employeeName: string
  employeeAvatar?: string
  employeeDepartment: string
  leaveType: LeaveType
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: LeaveStatus
  comments: Comment[]
  createdAt: string
  updatedAt: string
}

interface Comment {
  id: string
  authorId: string
  authorName: string
  authorAvatar?: string
  text: string
  timestamp: string
}

// Sample employees data

// Admin user (for comments)

// Generate sample leave requests

// Format date for display

// Format date range for display

// Get leave type display name
const getLeaveTypeDisplay = (leaveType: LeaveType): string => {
  switch (leaveType) {
    case "vacation":
      return "Vacation"
    case "sick":
      return "Sick Leave"
    case "personal":
      return "Personal Leave"
    case "bereavement":
      return "Bereavement"
    case "unpaid":
      return "Unpaid Leave"
    default:
      return leaveType
  }
}

export default function LeaveRequestManagementPage() {
  const { toast } = useToast()
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [employeeFilter, setEmployeeFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<string>("all")

  // View/action modal states
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [commentText, setCommentText] = useState("")

  // Add a new state for the reject dialog
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)

  // Read URL parameters when component loads
  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get("tab")

    // If tab parameter exists and is valid, set the active tab
    if (tabParam && ["all", "pending", "approved", "rejected", "history"].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [])

  // Load initial data with a simulated delay
  useEffect(() => {
    const timer = setTimeout(() => {
      const data = generateSampleLeaveRequests()
      setLeaveRequests(data)
      setFilteredRequests(data)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Add a function to check if a leave request is historical (end date is in the past)
  const isHistoricalLeave = (request: LeaveRequest) => {
    const endDate = new Date(request.endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Set to beginning of day for accurate comparison
    return endDate < today
  }

  // Apply filters when they change
  useEffect(() => {
    let result = [...leaveRequests]

    // Filter by tab (status or history)
    if (activeTab === "history") {
      result = result.filter((request) => isHistoricalLeave(request))
    } else if (activeTab !== "all") {
      result = result.filter((request) => request.status === activeTab)
    }

    // Filter by employee
    if (employeeFilter !== "all") {
      result = result.filter((request) => request.employeeId === employeeFilter)
    }

    setFilteredRequests(result)
  }, [activeTab, employeeFilter, leaveRequests])

  // Open view dialog
  const openViewDialog = (request: LeaveRequest) => {
    setSelectedRequest(request)
    setCommentText("")
    setViewDialogOpen(true)
  }

  // Add a function to handle quick approval
  const handleQuickApprove = (request: LeaveRequest) => {
    const now = new Date().toISOString()

    const updatedRequest = {
      ...request,
      status: "approved" as LeaveStatus,
      comments: [
        ...request.comments,
        {
          id: `comment-${Date.now()}`,
          authorId: adminUser.id,
          authorName: adminUser.name,
          authorAvatar: adminUser.avatar,
          text: "Request approved.",
          timestamp: now,
        },
      ],
      updatedAt: now,
    }

    const updatedRequests = leaveRequests.map((req) => (req.id === request.id ? updatedRequest : req))

    setLeaveRequests(updatedRequests)

    toast({
      title: "Leave Request Approved",
      description: `${request.employeeName}'s leave request has been approved.`,
    })
  }

  // Handle approve request
  const handleApproveRequest = () => {
    if (!selectedRequest) return

    const now = new Date().toISOString()

    // Create a new comment if there's text
    const newComments = [...selectedRequest.comments]
    if (commentText.trim()) {
      newComments.push({
        id: `comment-${Date.now()}`,
        authorId: adminUser.id,
        authorName: adminUser.name,
        authorAvatar: adminUser.avatar,
        text: commentText.trim(),
        timestamp: now,
      })
    }

    const updatedRequest = {
      ...selectedRequest,
      status: "approved" as LeaveStatus,
      comments: newComments,
      updatedAt: now,
    }

    const updatedRequests = leaveRequests.map((request) =>
      request.id === selectedRequest.id ? updatedRequest : request,
    )

    setLeaveRequests(updatedRequests)
    setViewDialogOpen(false)

    toast({
      title: "Leave Request Approved",
      description: `${selectedRequest.employeeName}'s leave request has been approved.`,
    })
  }

  // Add a function to handle quick rejection
  const handleQuickReject = () => {
    if (!selectedRequest || !commentText.trim()) return

    const now = new Date().toISOString()

    const updatedRequest = {
      ...selectedRequest,
      status: "rejected" as LeaveStatus,
      comments: [
        ...selectedRequest.comments,
        {
          id: `comment-${Date.now()}`,
          authorId: adminUser.id,
          authorName: adminUser.name,
          authorAvatar: adminUser.avatar,
          text: commentText.trim(),
          timestamp: now,
        },
      ],
      updatedAt: now,
    }

    const updatedRequests = leaveRequests.map((req) => (req.id === selectedRequest.id ? updatedRequest : req))

    setLeaveRequests(updatedRequests)
    setRejectDialogOpen(false)

    toast({
      title: "Leave Request Rejected",
      description: `${selectedRequest.employeeName}'s leave request has been rejected.`,
    })
  }

  // Handle reject request
  const handleRejectRequest = () => {
    if (!selectedRequest) return

    // Require a comment for rejection
    if (!commentText.trim()) {
      toast({
        title: "Comment Required",
        description: "Please provide a reason for rejecting this leave request.",
        variant: "destructive",
      })
      return
    }

    const now = new Date().toISOString()

    // Add the rejection comment
    const newComments = [
      ...selectedRequest.comments,
      {
        id: `comment-${Date.now()}`,
        authorId: adminUser.id,
        authorName: adminUser.name,
        authorAvatar: adminUser.avatar,
        text: commentText.trim(),
        timestamp: now,
      },
    ]

    const updatedRequest = {
      ...selectedRequest,
      status: "rejected" as LeaveStatus,
      comments: newComments,
      updatedAt: now,
    }

    const updatedRequests = leaveRequests.map((request) =>
      request.id === selectedRequest.id ? updatedRequest : request,
    )

    setLeaveRequests(updatedRequests)
    setViewDialogOpen(false)

    toast({
      title: "Leave Request Rejected",
      description: `${selectedRequest.employeeName}'s leave request has been rejected.`,
    })
  }

  // Add comment only (without changing status)
  const handleAddComment = () => {
    if (!selectedRequest || !commentText.trim()) return

    const now = new Date().toISOString()

    // Add the comment
    const newComments = [
      ...selectedRequest.comments,
      {
        id: `comment-${Date.now()}`,
        authorId: adminUser.id,
        authorName: adminUser.name,
        authorAvatar: adminUser.avatar,
        text: commentText.trim(),
        timestamp: now,
      },
    ]

    const updatedRequest = {
      ...selectedRequest,
      comments: newComments,
      updatedAt: now,
    }

    const updatedRequests = leaveRequests.map((request) =>
      request.id === selectedRequest.id ? updatedRequest : request,
    )

    setLeaveRequests(updatedRequests)
    setCommentText("")

    toast({
      title: "Comment Added",
      description: "Your comment has been added to the leave request.",
    })

    // Update the selected request to show the new comment
    setSelectedRequest(updatedRequest)
  }

  // Reset filters
  const resetFilters = () => {
    setEmployeeFilter("all")
    setActiveTab("all")
  }

  // Render status badge
  const renderStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
      default:
        return null
    }
  }

  // Render leave type badge
  const renderLeaveTypeBadge = (leaveType: LeaveType) => {
    switch (leaveType) {
      case "vacation":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-700">
            Vacation
          </Badge>
        )
      case "sick":
        return (
          <Badge variant="outline" className="border-purple-500 text-purple-700">
            Sick Leave
          </Badge>
        )
      case "personal":
        return (
          <Badge variant="outline" className="border-teal-500 text-teal-700">
            Personal
          </Badge>
        )
      case "bereavement":
        return (
          <Badge variant="outline" className="border-gray-500 text-gray-700">
            Bereavement
          </Badge>
        )
      case "unpaid":
        return (
          <Badge variant="outline" className="border-orange-500 text-orange-700">
            Unpaid
          </Badge>
        )
      default:
        return null
    }
  }

  // Format timestamp for comments
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  // Define columns for DataList
  const columns: ColumnDef<LeaveRequest>[] = [
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
      id: "leaveType",
      header: "Leave Type",
      accessorKey: "leaveType",
      cell: (row) => renderLeaveTypeBadge(row.leaveType),
    },
    {
      id: "dateRange",
      header: "Date Range",
      accessorKey: (row) => formatDateRange(row.startDate, row.endDate),
      cell: (row) => (
        <div className="flex items-center space-x-1">
          <span>{formatDateRange(row.startDate, row.endDate)}</span>
          <span className="text-xs text-muted-foreground">({row.totalDays} days)</span>
        </div>
      ),
    },
    {
      id: "reason",
      header: "Reason",
      accessorKey: "reason",
      cell: (row) => (
        <div className="max-w-[200px] truncate" title={row.reason}>
          {row.reason}
        </div>
      ),
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
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => openViewDialog(row)}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>

          {row.status === "pending" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => handleQuickApprove(row)}
              >
                <Check className="h-4 w-4" />
                <span className="sr-only">Approve</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  setSelectedRequest(row)
                  setCommentText("")
                  setRejectDialogOpen(true)
                }}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Reject</span>
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Leave Request Management</h1>
          <p className="text-muted-foreground">Review and manage employee leave requests</p>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList>
              <TabsTrigger value="all">All Requests</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by employee" />
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

              <Button variant="outline" size="sm" onClick={resetFilters}>
                <X className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </div>

          <TabsContent value="all" className="mt-4">
            <DataList
              data={filteredRequests}
              columns={columns}
              searchable={true}
              searchFields={["employeeName", "reason", "leaveType"]}
              filterable={true}
              sortable={true}
              pagination={true}
              pageSize={10}
              pageSizeOptions={[10, 20, 50]}
              emptyMessage="No leave requests found"
              isLoading={isLoading}
              loadingComponent={
                <div className="flex justify-center items-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2">Loading leave requests...</span>
                </div>
              }
            />
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <DataList
              data={filteredRequests}
              columns={columns}
              searchable={true}
              searchFields={["employeeName", "reason", "leaveType"]}
              filterable={true}
              sortable={true}
              pagination={true}
              pageSize={10}
              pageSizeOptions={[10, 20, 50]}
              emptyMessage="No pending leave requests found"
              isLoading={isLoading}
              loadingComponent={
                <div className="flex justify-center items-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2">Loading leave requests...</span>
                </div>
              }
            />
          </TabsContent>

          <TabsContent value="approved" className="mt-4">
            <DataList
              data={filteredRequests}
              columns={columns}
              searchable={true}
              searchFields={["employeeName", "reason", "leaveType"]}
              filterable={true}
              sortable={true}
              pagination={true}
              pageSize={10}
              pageSizeOptions={[10, 20, 50]}
              emptyMessage="No approved leave requests found"
              isLoading={isLoading}
              loadingComponent={
                <div className="flex justify-center items-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2">Loading leave requests...</span>
                </div>
              }
            />
          </TabsContent>

          <TabsContent value="rejected" className="mt-4">
            <DataList
              data={filteredRequests}
              columns={columns}
              searchable={true}
              searchFields={["employeeName", "reason", "leaveType"]}
              filterable={true}
              sortable={true}
              pagination={true}
              pageSize={10}
              pageSizeOptions={[10, 20, 50]}
              emptyMessage="No rejected leave requests found"
              isLoading={isLoading}
              loadingComponent={
                <div className="flex justify-center items-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2">Loading leave requests...</span>
                </div>
              }
            />
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <DataList
              data={filteredRequests}
              columns={columns}
              searchable={true}
              searchFields={["employeeName", "reason", "leaveType"]}
              filterable={true}
              sortable={true}
              pagination={true}
              pageSize={10}
              pageSizeOptions={[10, 20, 50]}
              emptyMessage="No historical leave requests found"
              isLoading={isLoading}
              loadingComponent={
                <div className="flex justify-center items-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2">Loading leave requests...</span>
                </div>
              }
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* View/Action Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>Review leave request details and take action</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Request Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedRequest.employeeAvatar} alt={selectedRequest.employeeName} />
                    <AvatarFallback>{selectedRequest.employeeName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-lg">{selectedRequest.employeeName}</div>
                    <div className="text-sm text-muted-foreground">{selectedRequest.employeeDepartment}</div>
                  </div>
                </div>
                <div>{renderStatusBadge(selectedRequest.status)}</div>
              </div>

              {/* Request Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Leave Type</div>
                  <div className="mt-1">{renderLeaveTypeBadge(selectedRequest.leaveType)}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">Duration</div>
                  <div className="mt-1 flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDateRange(selectedRequest.startDate, selectedRequest.endDate)}</span>
                    <span className="text-xs text-muted-foreground">({selectedRequest.totalDays} days)</span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="text-sm font-medium text-muted-foreground">Reason</div>
                  <div className="mt-1">{selectedRequest.reason}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">Requested On</div>
                  <div className="mt-1">{formatTimestamp(selectedRequest.createdAt)}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
                  <div className="mt-1">{formatTimestamp(selectedRequest.updatedAt)}</div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Comments</h3>

                {selectedRequest.comments.length === 0 ? (
                  <div className="text-muted-foreground text-sm italic">No comments yet</div>
                ) : (
                  <div className="space-y-4">
                    {selectedRequest.comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3 bg-muted/30 p-3 rounded-lg">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.authorAvatar} alt={comment.authorName} />
                          <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div className="font-medium">{comment.authorName}</div>
                            <div className="text-xs text-muted-foreground">{formatTimestamp(comment.timestamp)}</div>
                          </div>
                          <div className="text-sm mt-1">{comment.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment */}
                <div className="space-y-2">
                  <Label htmlFor="comment">Add Comment</Label>
                  <Textarea
                    id="comment"
                    placeholder="Enter your comment here..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                  />

                  {selectedRequest.status === "pending" && (
                    <div className="text-sm text-amber-600">
                      <MessageSquare className="h-4 w-4 inline mr-1" />A comment is required when rejecting a request
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={handleAddComment} disabled={!commentText.trim()}>
                      Add Comment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>

            {selectedRequest && selectedRequest.status === "pending" && (
              <>
                <Button variant="destructive" onClick={handleRejectRequest} disabled={!commentText.trim()}>
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button onClick={handleApproveRequest}>
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add the Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this leave request.</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedRequest.employeeAvatar} alt={selectedRequest.employeeName} />
                  <AvatarFallback>{selectedRequest.employeeName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedRequest.employeeName}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDateRange(selectedRequest.startDate, selectedRequest.endDate)} ({selectedRequest.totalDays}{" "}
                    days)
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reject-comment">Rejection Reason</Label>
                <Textarea
                  id="reject-comment"
                  placeholder="Enter reason for rejection..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  required
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleQuickReject} disabled={!commentText.trim()}>
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

