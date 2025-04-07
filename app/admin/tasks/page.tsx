"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Eye, Edit, Trash2, Loader2, Calendar, Clock } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { DataList, type ColumnDef } from "@/components/data-list/data-list"
import { employees, formatDate, generateId } from "@/lib/data"

// Types
type TaskPriority = "high" | "medium" | "low"
type TaskStatus = "pending" | "in-progress" | "completed"

interface Task {
  id: string
  title: string
  description: string
  category: string
  dueDate: string
  assignedTo: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  priority: TaskPriority
  status: TaskStatus
  createdAt: string
  updatedAt: string
}

interface TaskCategory {
  id: string
  name: string
  description: string
  isTemplate: boolean
}

// Sample task categories
const initialTaskCategories: TaskCategory[] = [
  {
    id: "cat1",
    name: "Development",
    description: "Software development tasks",
    isTemplate: true,
  },
  {
    id: "cat2",
    name: "Design",
    description: "UI/UX design tasks",
    isTemplate: true,
  },
  {
    id: "cat3",
    name: "Marketing",
    description: "Marketing campaign tasks",
    isTemplate: true,
  },
  {
    id: "cat4",
    name: "HR",
    description: "Human resources tasks",
    isTemplate: true,
  },
  {
    id: "cat5",
    name: "Custom",
    description: "Custom tasks",
    isTemplate: false,
  },
]

// Sample tasks data
const initialTasks: Task[] = [
  {
    id: "task1",
    title: "Implement login functionality",
    description: "Create login page with authentication",
    category: "Development",
    dueDate: "2023-08-15",
    assignedTo: employees[0],
    priority: "high",
    status: "in-progress",
    createdAt: "2023-07-20T10:30:00Z",
    updatedAt: "2023-07-25T14:20:00Z",
  },
  {
    id: "task2",
    title: "Design homepage mockup",
    description: "Create mockup for the new homepage design",
    category: "Design",
    dueDate: "2023-08-10",
    assignedTo: employees[1],
    priority: "medium",
    status: "pending",
    createdAt: "2023-07-18T09:15:00Z",
    updatedAt: "2023-07-18T09:15:00Z",
  },
  {
    id: "task3",
    title: "Prepare Q3 marketing campaign",
    description: "Plan and prepare materials for Q3 marketing campaign",
    category: "Marketing",
    dueDate: "2023-09-01",
    assignedTo: employees[2],
    priority: "high",
    status: "pending",
    createdAt: "2023-07-15T11:45:00Z",
    updatedAt: "2023-07-15T11:45:00Z",
  },
  {
    id: "task4",
    title: "Conduct employee performance reviews",
    description: "Schedule and conduct performance reviews for the engineering team",
    category: "HR",
    dueDate: "2023-08-30",
    assignedTo: employees[3],
    priority: "medium",
    status: "pending",
    createdAt: "2023-07-10T13:20:00Z",
    updatedAt: "2023-07-10T13:20:00Z",
  },
  {
    id: "task5",
    title: "Fix navigation bug",
    description: "Fix the navigation bug on mobile devices",
    category: "Development",
    dueDate: "2023-08-05",
    assignedTo: employees[0],
    priority: "high",
    status: "completed",
    createdAt: "2023-07-05T15:30:00Z",
    updatedAt: "2023-08-01T10:15:00Z",
  },
  {
    id: "task6",
    title: "Update privacy policy",
    description: "Review and update the privacy policy to comply with new regulations",
    category: "Custom",
    dueDate: "2023-08-20",
    assignedTo: employees[4],
    priority: "low",
    status: "in-progress",
    createdAt: "2023-07-12T09:45:00Z",
    updatedAt: "2023-07-28T11:30:00Z",
  },
  {
    id: "task7",
    title: "Create onboarding presentation",
    description: "Prepare presentation for new employee onboarding",
    category: "HR",
    dueDate: "2023-08-25",
    assignedTo: employees[3],
    priority: "medium",
    status: "in-progress",
    createdAt: "2023-07-14T14:10:00Z",
    updatedAt: "2023-07-22T16:05:00Z",
  },
  {
    id: "task8",
    title: "Optimize database queries",
    description: "Improve performance of slow database queries",
    category: "Development",
    dueDate: "2023-08-18",
    assignedTo: employees[0],
    priority: "high",
    status: "pending",
    createdAt: "2023-07-17T08:30:00Z",
    updatedAt: "2023-07-17T08:30:00Z",
  },
  {
    id: "task9",
    title: "Design email templates",
    description: "Create new email templates for marketing campaigns",
    category: "Design",
    dueDate: "2023-08-12",
    assignedTo: employees[1],
    priority: "low",
    status: "completed",
    createdAt: "2023-07-08T11:20:00Z",
    updatedAt: "2023-08-02T09:45:00Z",
  },
  {
    id: "task10",
    title: "Prepare monthly analytics report",
    description: "Compile and analyze website traffic and conversion data",
    category: "Marketing",
    dueDate: "2023-08-05",
    assignedTo: employees[2],
    priority: "medium",
    status: "completed",
    createdAt: "2023-07-25T13:15:00Z",
    updatedAt: "2023-08-03T10:30:00Z",
  },
]

export default function TaskManagementPage() {
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskCategories, setTaskCategories] = useState<TaskCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])

  // Modal states
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false)
  const [editTaskDialogOpen, setEditTaskDialogOpen] = useState(false)
  const [viewTaskDialogOpen, setViewTaskDialogOpen] = useState(false)
  const [deleteTaskDialogOpen, setDeleteTaskDialogOpen] = useState(false)
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Form states
  const [taskFormData, setTaskFormData] = useState<Omit<Task, "id" | "createdAt" | "updatedAt">>({
    title: "",
    description: "",
    category: "",
    dueDate: new Date().toISOString().split("T")[0],
    assignedTo: employees[0],
    priority: "medium",
    status: "pending",
  })

  const [categoryFormData, setCategoryFormData] = useState<Omit<TaskCategory, "id">>({
    name: "",
    description: "",
    isTemplate: false,
  })

  // Load initial data with a simulated delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setTasks(initialTasks)
      setTaskCategories(initialTaskCategories)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Read URL parameters when component loads
  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const statusParam = urlParams.get("status")

    // If status parameter exists, set the status filter
    if (statusParam && ["pending", "in-progress", "completed"].includes(statusParam)) {
      setStatusFilter(statusParam as string)
    }
  }, [])

  // Filter tasks when statusFilter changes
  useEffect(() => {
    if (tasks.length > 0) {
      let filtered = [...tasks]

      // Apply status filter if not "all"
      if (statusFilter !== "all") {
        filtered = filtered.filter((task) => task.status === statusFilter)
      }

      // Apply category filter if not "all"
      if (activeCategory !== "all") {
        filtered = filtered.filter((task) => task.category === activeCategory)
      }

      setFilteredTasks(filtered)
    }
  }, [statusFilter, activeCategory, tasks])

  // Filter tasks by category
  const filteredByCategory = activeCategory === "all" ? tasks : tasks.filter((task) => task.category === activeCategory)

  // Handle task form input changes
  const handleTaskInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTaskFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle task select changes
  const handleTaskSelectChange = (name: string, value: string) => {
    if (name === "assignedTo") {
      const selectedEmployee = employees.find((emp) => emp.id === value)
      if (selectedEmployee) {
        setTaskFormData((prev) => ({ ...prev, assignedTo: selectedEmployee }))
      }
    } else {
      setTaskFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  // Handle category form input changes
  const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCategoryFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Reset task form data
  const resetTaskFormData = () => {
    setTaskFormData({
      title: "",
      description: "",
      category: "",
      dueDate: new Date().toISOString().split("T")[0],
      assignedTo: employees[0],
      priority: "medium",
      status: "pending",
    })
  }

  // Reset category form data
  const resetCategoryFormData = () => {
    setCategoryFormData({
      name: "",
      description: "",
      isTemplate: false,
    })
  }

  // Add new task
  const handleAddTask = () => {
    const now = new Date().toISOString()
    const newTask: Task = {
      id: generateId(),
      ...taskFormData,
      createdAt: now,
      updatedAt: now,
    }

    setTasks((prev) => [...prev, newTask])
    resetTaskFormData()
    setAddTaskDialogOpen(false)

    toast({
      title: "Task Added",
      description: `"${newTask.title}" has been added successfully.`,
    })
  }

  // Edit task
  const handleEditTask = () => {
    if (!selectedTask) return

    const now = new Date().toISOString()
    const updatedTasks = tasks.map((task) =>
      task.id === selectedTask.id
        ? {
            ...task,
            ...taskFormData,
            updatedAt: now,
          }
        : task,
    )

    setTasks(updatedTasks)
    resetTaskFormData()
    setEditTaskDialogOpen(false)

    toast({
      title: "Task Updated",
      description: `"${taskFormData.title}" has been updated successfully.`,
    })
  }

  // Delete task
  const handleDeleteTask = () => {
    if (!selectedTask) return

    const updatedTasks = tasks.filter((task) => task.id !== selectedTask.id)
    setTasks(updatedTasks)
    setDeleteTaskDialogOpen(false)

    toast({
      title: "Task Deleted",
      description: `"${selectedTask.title}" has been deleted.`,
      variant: "destructive",
    })
  }

  // Add new category
  const handleAddCategory = () => {
    const newCategory: TaskCategory = {
      id: generateId(),
      ...categoryFormData,
    }

    setTaskCategories((prev) => [...prev, newCategory])
    resetCategoryFormData()
    setAddCategoryDialogOpen(false)

    toast({
      title: "Category Added",
      description: `"${newCategory.name}" category has been added successfully.`,
    })
  }

  // Open edit task dialog and populate form
  const openEditTaskDialog = (task: Task) => {
    setSelectedTask(task)
    setTaskFormData({
      title: task.title,
      description: task.description,
      category: task.category,
      dueDate: task.dueDate,
      assignedTo: task.assignedTo,
      priority: task.priority,
      status: task.status,
    })
    setEditTaskDialogOpen(true)
  }

  // Open view task dialog
  const openViewTaskDialog = (task: Task) => {
    setSelectedTask(task)
    setViewTaskDialogOpen(true)
  }

  // Open delete task dialog
  const openDeleteTaskDialog = (task: Task) => {
    setSelectedTask(task)
    setDeleteTaskDialogOpen(true)
  }

  // Render priority badge
  const renderPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High</Badge>
      case "medium":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Medium</Badge>
      case "low":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low</Badge>
      default:
        return null
    }
  }

  // Render status badge
  const renderStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-700">
            Pending
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-700">
            In Progress
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="border-green-500 text-green-700">
            Completed
          </Badge>
        )
      default:
        return null
    }
  }

  // Define columns for DataList
  const columns: ColumnDef<Task>[] = [
    {
      id: "category",
      header: "Category",
      accessorKey: "category",
      cell: (row) => <Badge variant="secondary">{row.category}</Badge>,
    },
    {
      id: "title",
      header: "Title",
      accessorKey: "title",
      cell: (row) => (
        <div>
          <div className="font-medium">{row.title}</div>
          <div className="text-xs text-muted-foreground truncate max-w-[200px]">{row.description}</div>
        </div>
      ),
    },
    {
      id: "assignedTo",
      header: "Assigned To",
      accessorKey: (row) => row.assignedTo.name,
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={row.assignedTo.avatar} alt={row.assignedTo.name} />
            <AvatarFallback>{row.assignedTo.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-sm">{row.assignedTo.name}</div>
        </div>
      ),
    },
    {
      id: "dueDate",
      header: "Due Date",
      accessorKey: "dueDate",
      cell: (row) => (
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(row.dueDate)}</span>
        </div>
      ),
    },
    {
      id: "priority",
      header: "Priority",
      accessorKey: "priority",
      cell: (row) => renderPriorityBadge(row.priority),
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
          <Button variant="ghost" size="icon" onClick={() => openViewTaskDialog(row)}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => openEditTaskDialog(row)}>
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => openDeleteTaskDialog(row)}>
            <Trash2 className="h-4 w-4 text-red-500" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Task Management</h1>
          <p className="text-muted-foreground">Manage and track tasks across your organization</p>
        </div>
        <Button
          onClick={() => {
            resetTaskFormData()
            setAddTaskDialogOpen(true)
          }}
          className="transition-all hover:scale-105"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h2 className="text-lg font-semibold">Categories</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              resetCategoryFormData()
              setAddCategoryDialogOpen(true)
            }}
          >
            <Plus className="mr-2 h-3 w-3" />
            Add Category
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge
            variant={activeCategory === "all" ? "default" : "outline"}
            className="cursor-pointer px-3 py-1 text-sm"
            onClick={() => setActiveCategory("all")}
          >
            All Tasks
          </Badge>

          {taskCategories.map((category) => (
            <Badge
              key={category.id}
              variant={activeCategory === category.name ? "default" : "outline"}
              className="cursor-pointer px-3 py-1 text-sm"
              onClick={() => setActiveCategory(category.name)}
            >
              {category.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Task List */}
      <DataList
        data={filteredTasks}
        columns={columns}
        searchable={true}
        searchFields={["title", "description", "category", "assignedTo.name"]}
        filterable={true}
        sortable={true}
        pagination={true}
        pageSize={5}
        pageSizeOptions={[5, 10, 20, 50]}
        emptyMessage="No tasks found"
        isLoading={isLoading}
        loadingComponent={
          <div className="flex justify-center items-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading tasks...</span>
          </div>
        }
      />

      {/* Add Task Dialog */}
      <Dialog open={addTaskDialogOpen} onOpenChange={setAddTaskDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>Fill in the details to create a new task.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter task title"
                  value={taskFormData.title}
                  onChange={handleTaskInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter task description"
                  value={taskFormData.description}
                  onChange={handleTaskInputChange}
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={taskFormData.category}
                  onValueChange={(value) => handleTaskSelectChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskCategories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={taskFormData.dueDate}
                  onChange={handleTaskInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Select
                  value={taskFormData.assignedTo.id}
                  onValueChange={(value) => handleTaskSelectChange("assignedTo", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={taskFormData.priority}
                  onValueChange={(value: TaskPriority) => handleTaskSelectChange("priority", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={taskFormData.status}
                onValueChange={(value: TaskStatus) => handleTaskSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={editTaskDialogOpen} onOpenChange={setEditTaskDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update the task details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Task Title</Label>
                <Input id="edit-title" name="title" value={taskFormData.title} onChange={handleTaskInputChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={taskFormData.description}
                  onChange={handleTaskInputChange}
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={taskFormData.category}
                  onValueChange={(value) => handleTaskSelectChange("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskCategories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-dueDate">Due Date</Label>
                <Input
                  id="edit-dueDate"
                  name="dueDate"
                  type="date"
                  value={taskFormData.dueDate}
                  onChange={handleTaskInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-assignedTo">Assigned To</Label>
                <Select
                  value={taskFormData.assignedTo.id}
                  onValueChange={(value) => handleTaskSelectChange("assignedTo", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <Select
                  value={taskFormData.priority}
                  onValueChange={(value: TaskPriority) => handleTaskSelectChange("priority", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={taskFormData.status}
                onValueChange={(value: TaskStatus) => handleTaskSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTask}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Task Dialog */}
      <Dialog open={viewTaskDialogOpen} onOpenChange={setViewTaskDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold">{selectedTask.title}</h3>
                <Badge variant="secondary" className="mt-2">
                  {selectedTask.category}
                </Badge>
                <div className="flex items-center mt-2 space-x-2">
                  {renderStatusBadge(selectedTask.status)}
                  {renderPriorityBadge(selectedTask.priority)}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                  <p className="mt-1">{selectedTask.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Assigned To</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedTask.assignedTo.avatar} alt={selectedTask.assignedTo.name} />
                        <AvatarFallback>{selectedTask.assignedTo.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{selectedTask.assignedTo.name}</div>
                        <div className="text-xs text-muted-foreground">{selectedTask.assignedTo.email}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Due Date</h4>
                    <div className="flex items-center space-x-1 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(selectedTask.dueDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
                    <div className="flex items-center space-x-1 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(selectedTask.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Last Updated</h4>
                    <div className="flex items-center space-x-1 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(selectedTask.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewTaskDialogOpen(false)}>
              Close
            </Button>
            {selectedTask && (
              <Button
                onClick={() => {
                  setViewTaskDialogOpen(false)
                  openEditTaskDialog(selectedTask)
                }}
              >
                Edit Task
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Task Dialog */}
      <Dialog open={deleteTaskDialogOpen} onOpenChange={setDeleteTaskDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedTask && (
              <div className="space-y-2">
                <p className="font-medium">{selectedTask.title}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{selectedTask.category}</Badge>
                  {renderPriorityBadge(selectedTask.priority)}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={addCategoryDialogOpen} onOpenChange={setAddCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>Create a new category for organizing tasks.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                name="name"
                placeholder="Enter category name"
                value={categoryFormData.name}
                onChange={handleCategoryInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-description">Description</Label>
              <Textarea
                id="category-description"
                name="description"
                placeholder="Enter category description"
                value={categoryFormData.description}
                onChange={handleCategoryInputChange}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

