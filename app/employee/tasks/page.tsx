"use client"

import { useState, useEffect } from "react"
import { Search, Clock, ArrowUpCircle, MoreHorizontal, MessageSquare, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Types
type TaskStatus = "Not Started" | "In Progress" | "Completed"
type TaskPriority = "High" | "Medium" | "Low"

interface StatusUpdate {
  status: TaskStatus
  timestamp: Date
  comment?: string
}

interface Comment {
  id: string
  user: {
    name: string
    avatar: string
    initials: string
  }
  text: string
  timestamp: Date
}

interface Task {
  id: string
  name: string
  description: string
  deadline: Date
  priority: TaskPriority
  status: TaskStatus
  progress: number
  statusHistory: StatusUpdate[]
  comments: Comment[]
  assignedBy: {
    name: string
    avatar: string
    initials: string
  }
}

// Mock data
const mockTasks: Task[] = [
  {
    id: "task-1",
    name: "Complete quarterly report",
    description: "Prepare and finalize the Q2 financial report with all department inputs",
    deadline: new Date(2025, 4, 15),
    priority: "High",
    status: "In Progress",
    progress: 65,
    statusHistory: [
      { status: "Not Started", timestamp: new Date(2025, 4, 1) },
      { status: "In Progress", timestamp: new Date(2025, 4, 5), comment: "Started working on the financial section" },
    ],
    comments: [
      {
        id: "comment-1",
        user: { name: "Jane Smith", avatar: "", initials: "JS" },
        text: "Please include the marketing department's expenses in the report.",
        timestamp: new Date(2025, 4, 7),
      },
      {
        id: "comment-2",
        user: { name: "John Doe", avatar: "", initials: "JD" },
        text: "I've uploaded the sales figures to the shared drive.",
        timestamp: new Date(2025, 4, 10),
      },
    ],
    assignedBy: { name: "Michael Johnson", avatar: "", initials: "MJ" },
  },
  {
    id: "task-2",
    name: "Update employee handbook",
    description: "Review and update the employee handbook with new policies",
    deadline: new Date(2025, 4, 20),
    priority: "Medium",
    status: "Not Started",
    progress: 0,
    statusHistory: [{ status: "Not Started", timestamp: new Date(2025, 4, 3) }],
    comments: [],
    assignedBy: { name: "Sarah Williams", avatar: "", initials: "SW" },
  },
  {
    id: "task-3",
    name: "Prepare client presentation",
    description: "Create slides for the upcoming client meeting",
    deadline: new Date(2025, 4, 12),
    priority: "High",
    status: "In Progress",
    progress: 30,
    statusHistory: [
      { status: "Not Started", timestamp: new Date(2025, 4, 2) },
      { status: "In Progress", timestamp: new Date(2025, 4, 8) },
    ],
    comments: [
      {
        id: "comment-3",
        user: { name: "Alex Brown", avatar: "", initials: "AB" },
        text: "I've shared some reference materials in the project folder.",
        timestamp: new Date(2025, 4, 9),
      },
    ],
    assignedBy: { name: "Robert Chen", avatar: "", initials: "RC" },
  },
  {
    id: "task-4",
    name: "Conduct team training",
    description: "Organize and conduct training session on new software",
    deadline: new Date(2025, 4, 8),
    priority: "Medium",
    status: "Completed",
    progress: 100,
    statusHistory: [
      { status: "Not Started", timestamp: new Date(2025, 4, 1) },
      { status: "In Progress", timestamp: new Date(2025, 4, 3) },
      {
        status: "Completed",
        timestamp: new Date(2025, 4, 7),
        comment: "Training completed successfully with 15 participants",
      },
    ],
    comments: [
      {
        id: "comment-4",
        user: { name: "Emily Davis", avatar: "", initials: "ED" },
        text: "Great session! The team found it very helpful.",
        timestamp: new Date(2025, 4, 7),
      },
    ],
    assignedBy: { name: "Sarah Williams", avatar: "", initials: "SW" },
  },
  {
    id: "task-5",
    name: "Review budget proposal",
    description: "Review and approve department budget proposals for next quarter",
    deadline: new Date(2025, 4, 25),
    priority: "Low",
    status: "Not Started",
    progress: 0,
    statusHistory: [{ status: "Not Started", timestamp: new Date(2025, 4, 5) }],
    comments: [],
    assignedBy: { name: "Michael Johnson", avatar: "", initials: "MJ" },
  },
]

export default function EmployeeTasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(mockTasks)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [newComment, setNewComment] = useState("")
  const [newStatus, setNewStatus] = useState<TaskStatus | "">("")

  // Apply filters and search
  useEffect(() => {
    let result = [...tasks]

    // Apply search
    if (searchQuery) {
      result = result.filter((task) => task.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((task) => task.status === statusFilter)
    }

    // Apply priority filter
    if (priorityFilter !== "all") {
      result = result.filter((task) => task.priority === priorityFilter)
    }

    setFilteredTasks(result)
  }, [tasks, searchQuery, statusFilter, priorityFilter])

  // Format date to readable string
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Calculate days remaining
  const getDaysRemaining = (deadline: Date) => {
    const today = new Date()
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Get status color
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "Not Started":
        return "bg-slate-500"
      case "In Progress":
        return "bg-blue-500"
      case "Completed":
        return "bg-green-500"
      default:
        return "bg-slate-500"
    }
  }

  // Get priority badge variant
  const getPriorityVariant = (priority: TaskPriority) => {
    switch (priority) {
      case "High":
        return "destructive"
      case "Medium":
        return "default"
      case "Low":
        return "secondary"
      default:
        return "default"
    }
  }

  // Handle status update
  const handleStatusUpdate = (taskId: string) => {
    if (!newStatus) return

    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          const updatedTask = {
            ...task,
            status: newStatus,
            progress: newStatus === "Completed" ? 100 : newStatus === "In Progress" ? Math.max(task.progress, 10) : 0,
            statusHistory: [
              ...task.statusHistory,
              {
                status: newStatus,
                timestamp: new Date(),
                comment: "",
              },
            ],
          }
          return updatedTask
        }
        return task
      }),
    )

    // Close the dialog by resetting the selected task if we're in the details view
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(null)
    }

    setNewStatus("")
  }

  // Handle adding a comment
  const handleAddComment = (taskId: string) => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      user: { name: "John Doe", avatar: "", initials: "JD" }, // Current user
      text: newComment,
      timestamp: new Date(),
    }

    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            comments: [...task.comments, comment],
          }
        }
        return task
      }),
    )

    setNewComment("")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-6 mt-2">My Tasks</h1>

        {/* Search and filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="Search tasks..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Task list */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No tasks found matching your filters</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <Card key={task.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="capitalize">{task.name}</CardTitle>
                      <CardDescription className="mt-1">{task.description}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedTask(task)}>View Details</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={getPriorityVariant(task.priority)}>{task.priority} Priority</Badge>
                      <Badge variant="outline" className={`${getStatusColor(task.status)} text-white`}>
                        {task.status}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(task.deadline)}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-500 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {getDaysRemaining(task.deadline) > 0
                        ? `${getDaysRemaining(task.deadline)} days remaining`
                        : "Overdue"}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{task.progress}%</span>
                    </div>
                    <Progress value={task.progress} className="h-2" />
                  </div>

                  {/* Task actions */}
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center text-sm text-slate-500">
                      <span>Assigned by: {task.assignedBy.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span className="hidden sm:inline">Comment</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Comment</DialogTitle>
                            <DialogDescription>Add a comment to this task</DialogDescription>
                          </DialogHeader>
                          <Textarea
                            placeholder="Type your comment here..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="min-h-[100px]"
                          />
                          <DialogFooter>
                            <Button onClick={() => handleAddComment(task.id)}>Add Comment</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="default" size="sm" className="flex items-center gap-1">
                            <ArrowUpCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Update Status</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Task Status</DialogTitle>
                            <DialogDescription>Change the current status of this task</DialogDescription>
                          </DialogHeader>
                          <Select value={newStatus} onValueChange={(value) => setNewStatus(value as TaskStatus)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select new status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Not Started">Not Started</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                          <DialogFooter>
                            <Button
                              onClick={() => {
                                handleStatusUpdate(task.id)
                                // Close the dialog by forcing the DialogContent to unmount
                                const closeEvent = new CustomEvent("close-dialog")
                                document.dispatchEvent(closeEvent)
                              }}
                            >
                              Update Status
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Task details dialog */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="capitalize">{selectedTask.name}</DialogTitle>
              <DialogDescription>{selectedTask.description}</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="history">Status History</TabsTrigger>
                <TabsTrigger value="comments">Comments ({selectedTask.comments.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-500">Deadline</h4>
                    <p>{formatDate(selectedTask.deadline)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500">Priority</h4>
                    <Badge variant={getPriorityVariant(selectedTask.priority)} className="mt-1">
                      {selectedTask.priority}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500">Current Status</h4>
                    <Badge variant="outline" className={`${getStatusColor(selectedTask.status)} text-white mt-1`}>
                      {selectedTask.status}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500">Assigned By</h4>
                    <p>{selectedTask.assignedBy.name}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Progress</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Completion</span>
                      <span>{selectedTask.progress}%</span>
                    </div>
                    <Progress value={selectedTask.progress} className="h-2" />
                  </div>
                </div>

                <div className="pt-4">
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Update Task Status</h4>
                  <div className="flex gap-2">
                    <Select value={newStatus} onValueChange={(value) => setNewStatus(value as TaskStatus)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Not Started">Not Started</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => {
                        handleStatusUpdate(selectedTask.id)
                        // The dialog will close automatically because we reset selectedTask in handleStatusUpdate
                      }}
                    >
                      Update
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" className="pt-4">
                <div className="space-y-4">
                  {selectedTask.statusHistory.length === 0 ? (
                    <p className="text-slate-500">No status updates yet</p>
                  ) : (
                    <div className="relative pl-6 border-l border-slate-200">
                      {selectedTask.statusHistory.map((update, index) => (
                        <div key={index} className="mb-6 relative">
                          <div className="absolute -left-[25px] p-1 rounded-full bg-white">
                            <div className={`h-4 w-4 rounded-full ${getStatusColor(update.status)}`}></div>
                          </div>
                          <div className="mb-1">
                            <Badge variant="outline" className={`${getStatusColor(update.status)} text-white`}>
                              {update.status}
                            </Badge>
                            <span className="text-sm text-slate-500 ml-2">
                              {new Date(update.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {update.comment && <p className="text-sm">{update.comment}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="comments" className="pt-4">
                <div className="space-y-4">
                  {selectedTask.comments.length === 0 ? (
                    <p className="text-slate-500">No comments yet</p>
                  ) : (
                    selectedTask.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 pb-4 border-b border-slate-100 last:border-0">
                        <Avatar>
                          <AvatarFallback>{comment.user.initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <p className="font-medium">{comment.user.name}</p>
                            <span className="text-xs text-slate-500">
                              {new Date(comment.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm">{comment.text}</p>
                        </div>
                      </div>
                    ))
                  )}

                  <div className="pt-4">
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Add Comment</h4>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Type your comment here..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={() => handleAddComment(selectedTask.id)}>Post</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

