"use client"

import { useState } from "react"
import { DataList, type ColumnDef } from "@/components/data-list"
import { Badge } from "@/components/ui/badge"

// Example data type
interface User {
  id: number
  name: string
  email: string
  role: string
  status: "active" | "inactive" | "pending"
  joinDate: string
}

// Sample data
const sampleUsers: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Admin",
    status: "active",
    joinDate: "2023-01-15",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "User",
    status: "active",
    joinDate: "2023-02-20",
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    role: "Editor",
    status: "inactive",
    joinDate: "2023-03-10",
  },
  {
    id: 4,
    name: "Alice Brown",
    email: "alice.brown@example.com",
    role: "User",
    status: "pending",
    joinDate: "2023-04-05",
  },
  {
    id: 5,
    name: "Charlie Wilson",
    email: "charlie.wilson@example.com",
    role: "Admin",
    status: "active",
    joinDate: "2023-05-12",
  },
]

export default function DataListExample() {
  const [users] = useState<User[]>(sampleUsers)

  // Define columns
  const columns: ColumnDef<User>[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
    },
    {
      id: "email",
      header: "Email",
      accessorKey: "email",
    },
    {
      id: "role",
      header: "Role",
      accessorKey: "role",
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: (row) => {
        const status = row.status
        return (
          <Badge
            className={
              status === "active"
                ? "bg-green-100 text-green-800 hover:bg-green-100"
                : status === "inactive"
                  ? "bg-gray-100 text-gray-800 hover:bg-gray-100"
                  : "bg-amber-100 text-amber-800 hover:bg-amber-100"
            }
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      },
    },
    {
      id: "joinDate",
      header: "Join Date",
      accessorKey: "joinDate",
      cell: (row) => new Date(row.joinDate).toLocaleDateString(),
    },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Data List Example</h1>
      <DataList
        data={users}
        columns={columns}
        searchable={true}
        searchFields={["name", "email", "role"]}
        filterable={true}
        sortable={true}
        pagination={true}
        pageSize={2}
        pageSizeOptions={[2, 5, 10]}
        emptyMessage="No users found"
        onRowClick={(row) => console.log("Row clicked:", row)}
      />
    </div>
  )
}

