export type TaskPriority = "high" | "medium" | "low"
export type TaskStatus = "pending" | "in-progress" | "completed"

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  due_date: string
  assigned_to: string | null
  assignee?: {
    id: string
    first_name: string
    last_name: string
    email: string
    avatar_url?: string
  }
}

export function getStatusVariant(status: TaskStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "pending":
      return "secondary"
    case "in-progress":
      return "default"
    case "completed":
      return "outline"
    default:
      return "default"
  }
}

export function getPriorityVariant(priority: TaskPriority): "default" | "secondary" | "destructive" | "outline" {
  switch (priority) {
    case "high":
      return "destructive"
    case "medium":
      return "default"
    case "low":
      return "outline"
    default:
      return "default"
  }
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}

export function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`
} 