"use client"

import { useState, useEffect } from "react"
import { Plus, Eye, Edit, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { DataList, type ColumnDef } from "@/components/data-list/data-list"
import { useSupabaseCrud } from "@/hooks/use-supabase-crud"
import { EmployeeForm } from "@/components/employee/employee-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Database } from '@/types/supabase'

type Employee = Database['public']['Tables']['employees']['Row']

export default function EmployeeManagementPage() {
  const { toast } = useToast()
  const [activeDepartment, setActiveDepartment] = useState<string>("all")
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  
  const {
    data: employees,
    isLoading,
    error: crudError,
    fetchAll,
    create,
    update,
    remove
  } = useSupabaseCrud<'employees'>({
    table: 'employees',
    select: '*',
    autoFetch: true
  })

  // Filter employees by department
  useEffect(() => {
    if (employees) {
      if (activeDepartment === "all") {
        setFilteredEmployees(employees)
      } else {
        setFilteredEmployees(employees.filter(emp => emp.department === activeDepartment))
      }
    }
  }, [activeDepartment, employees])

  // Show error toast if there's a CRUD error
  useEffect(() => {
    if (crudError) {
      toast({
        title: "Error",
        description: crudError,
        variant: "destructive",
      })
    }
  }, [crudError, toast])

  // Handle add employee
  const handleAddEmployee = async (employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => {
    const { error } = await create(employeeData)
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Employee added successfully",
      })
      setIsAddDialogOpen(false)
    }
  }

  // Handle update employee
  const handleUpdateEmployee = async (id: string, updates: Partial<Employee>) => {
    const { error } = await update(id, updates)
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Employee updated successfully",
      })
    }
  }

  // Handle delete employee
  const handleDeleteEmployee = async (id: string) => {
    const { error } = await remove(id)
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
    } else {
    toast({
        title: "Success",
        description: "Employee deleted successfully",
      })
    }
  }

  // Define columns
  const columns: ColumnDef<Employee>[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "first_name",
      cell: (row) => `${row.first_name} ${row.last_name}`,
    },
    {
      id: "email",
      header: "Email",
      accessorKey: "email",
    },
    {
      id: "department",
      header: "Department",
      accessorKey: "department",
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
    },
  ]

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Employee Management</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <DataList
        data={filteredEmployees}
        columns={columns}
        searchable={true}
        searchFields={["first_name", "email", "department", "role"]}
        filterable={true}
        sortable={true}
        pagination={true}
        pageSize={5}
        pageSizeOptions={[5, 10, 20, 50]}
        emptyMessage="No employees found"
        isLoading={isLoading}
        loadingComponent={
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading employees...</span>
          </div>
        }
      />

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <EmployeeForm
            onSuccess={() => {
              setIsAddDialogOpen(false)
              fetchAll()
            }}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

