"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Plus, Eye, Pencil, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { DataList } from "@/components/ui/data-list"
import { ColumnDef } from "@tanstack/react-table"
import { Task, getStatusVariant, getPriorityVariant, formatDate, getInitials } from "@/types/task"
import { Database } from "@/types/supabase"

type User = Database["public"]["Tables"]["users"]["Row"]

export default function TaskManagementPage() {
  const { toast } = useToast()
  const supabase = createClientComponentClient<Database>()
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTasks()
    loadUsers()
  }, [])

  async function loadTasks() {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      toast({
        title: "Error loading tasks",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function loadUsers() {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      toast({
        title: "Error loading users",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    }
  }

  const handleViewTask = (task: Task) => {
    // TODO: Implement view task dialog
    console.log("View task:", task)
  }

  const handleEditTask = (task: Task) => {
    // TODO: Implement edit task dialog
    console.log("Edit task:", task)
  }

  const handleDeleteTask = async (task: Task) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", task.id)

      if (error) throw error

    toast({
        title: "Success",
        description: "Task deleted successfully",
      })

      loadTasks()
    } catch (error) {
      console.error("Error deleting task:", error)
    toast({
        title: "Error",
        description: "Failed to delete task",
      variant: "destructive",
    })
    }
  }

  const columns: ColumnDef<Task>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => row.original.title,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => row.original.description,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => row.original.status,
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => row.original.priority,
    },
    {
      accessorKey: "due_date",
      header: "Due Date",
      cell: ({ row }) => new Date(row.original.due_date).toLocaleDateString(),
    },
    {
      accessorKey: "assigned_to",
      header: "Assigned To",
      cell: ({ row }) => {
        const user = users.find((u) => u.id === row.original.assigned_to)
        return user ? `${user.first_name} ${user.last_name}` : "Unassigned"
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewTask(row.original)}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditTask(row.original)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteTask(row.original)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      <DataList
        data={tasks}
        columns={columns}
        searchable
        searchFields={["title", "description"]}
        filterable
        sortable
        pagination
        pageSize={10}
        isLoading={isLoading}
        loadingComponent={
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      />
    </div>
  )
}

