"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Eye, Edit, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { DataList, type ColumnDef } from "@/components/data-list/data-list"
import { employees as initialEmployees, generateId } from "@/lib/data"

// Types
type EmployeeStatus = "active" | "inactive" | "on-leave"

interface Employee {
  id: string
  name: string
  email: string
  phone: string
  department: string
  role: string
  status: EmployeeStatus
  joinDate: string
  avatar?: string
  address?: string
  emergencyContact?: string
  skills?: string[]
}

// First, let's extract the departments into a constant array at the top of the file, after the initialEmployees declaration
const departments = ["Engineering", "Design", "Marketing", "HR", "Finance", "Sales", "Operations"]

// Sample data
// const initialEmployees: Employee[] = [
//   {
//     id: "1",
//     name: "John Doe",
//     email: "john.doe@example.com",
//     phone: "123-456-7890",
//     department: "Engineering",
//     role: "Senior Developer",
//     status: "active",
//     joinDate: "2022-01-15",
//     avatar: "/placeholder.svg?height=40&width=40",
//     address: "123 Main St, City, Country",
//     emergencyContact: "Jane Doe (Wife) - 987-654-3210",
//     skills: ["React", "TypeScript", "Node.js"],
//   },
//   {
//     id: "2",
//     name: "Jane Smith",
//     email: "jane.smith@example.com",
//     phone: "234-567-8901",
//     department: "Design",
//     role: "UI/UX Designer",
//     status: "active",
//     joinDate: "2022-03-10",
//     avatar: "/placeholder.svg?height=40&width=40",
//     address: "456 Oak St, City, Country",
//     emergencyContact: "John Smith (Husband) - 876-543-2109",
//     skills: ["Figma", "Adobe XD", "Sketch"],
//   },
//   {
//     id: "3",
//     name: "Michael Johnson",
//     email: "michael.johnson@example.com",
//     phone: "345-678-9012",
//     department: "Marketing",
//     role: "Marketing Manager",
//     status: "on-leave",
//     joinDate: "2021-11-05",
//     avatar: "/placeholder.svg?height=40&width=40",
//     address: "789 Pine St, City, Country",
//     emergencyContact: "Sarah Johnson (Wife) - 765-432-1098",
//     skills: ["SEO", "Content Marketing", "Social Media"],
//   },
//   {
//     id: "4",
//     name: "Emily Davis",
//     email: "emily.davis@example.com",
//     phone: "456-789-0123",
//     department: "HR",
//     role: "HR Specialist",
//     status: "active",
//     joinDate: "2022-05-20",
//     avatar: "/placeholder.svg?height=40&width=40",
//     address: "101 Elm St, City, Country",
//     emergencyContact: "Robert Davis (Brother) - 654-321-0987",
//     skills: ["Recruitment", "Employee Relations", "Training"],
//   },
//   {
//     id: "5",
//     name: "David Wilson",
//     email: "david.wilson@example.com",
//     phone: "567-890-1234",
//     department: "Finance",
//     role: "Financial Analyst",
//     status: "inactive",
//     joinDate: "2021-08-15",
//     avatar: "/placeholder.svg?height=40&width=40",
//     address: "202 Maple St, City, Country",
//     emergencyContact: "Linda Wilson (Mother) - 543-210-9876",
//     skills: ["Financial Modeling", "Data Analysis", "Forecasting"],
//   },
//   {
//     id: "6",
//     name: "Sarah Brown",
//     email: "sarah.brown@example.com",
//     phone: "678-901-2345",
//     department: "Engineering",
//     role: "Frontend Developer",
//     status: "active",
//     joinDate: "2022-02-10",
//     avatar: "/placeholder.svg?height=40&width=40",
//     address: "303 Cedar St, City, Country",
//     emergencyContact: "Mark Brown (Husband) - 432-109-8765",
//     skills: ["React", "CSS", "JavaScript"],
//   },
//   {
//     id: "7",
//     name: "James Miller",
//     email: "james.miller@example.com",
//     phone: "789-012-3456",
//     department: "Engineering",
//     role: "Backend Developer",
//     status: "active",
//     joinDate: "2021-12-01",
//     avatar: "/placeholder.svg?height=40&width=40",
//     address: "404 Birch St, City, Country",
//     emergencyContact: "Emma Miller (Wife) - 321-098-7654",
//     skills: ["Node.js", "Python", "MongoDB"],
//   },
//   {
//     id: "8",
//     name: "Jessica Taylor",
//     email: "jessica.taylor@example.com",
//     phone: "890-123-4567",
//     department: "Sales",
//     role: "Sales Representative",
//     status: "active",
//     joinDate: "2022-04-15",
//     avatar: "/placeholder.svg?height=40&width=40",
//     address: "505 Walnut St, City, Country",
//     emergencyContact: "Thomas Taylor (Father) - 210-987-6543",
//     skills: ["Negotiation", "CRM", "Client Relations"],
//   },
//   {
//     id: "9",
//     name: "Robert Anderson",
//     email: "robert.anderson@example.com",
//     phone: "901-234-5678",
//     department: "Operations",
//     role: "Operations Manager",
//     status: "on-leave",
//     joinDate: "2021-10-10",
//     avatar: "/placeholder.svg?height=40&width=40",
//     address: "606 Pineapple St, City, Country",
//     emergencyContact: "Jennifer Anderson (Wife) - 109-876-5432",
//     skills: ["Project Management", "Process Optimization", "Team Leadership"],
//   },
//   {
//     id: "10",
//     name: "Jennifer White",
//     email: "jennifer.white@example.com",
//     phone: "012-345-6789",
//     department: "Customer Support",
//     role: "Support Specialist",
//     status: "active",
//     joinDate: "2022-06-01",
//     avatar: "/placeholder.svg?height=40&width=40",
//     address: "707 Cherry St, City, Country",
//     emergencyContact: "Michael White (Brother) - 098-765-4321",
//     skills: ["Customer Service", "Problem Solving", "Communication"],
//   },
//   {
//     id: "11",
//     name: "Thomas Harris",
//     email: "thomas.harris@example.com",
//     phone: "123-456-7891",
//     department: "IT",
//     role: "System Administrator",
//     status: "active",
//     joinDate: "2021-09-15",
//     avatar: "/placeholder.svg?height=40&width=40",
//     address: "808 Grape St, City, Country",
//     emergencyContact: "Laura Harris (Wife) - 987-654-3211",
//     skills: ["Linux", "Networking", "Security"],
//   },
//   {
//     id: "12",
//     name: "Elizabeth Clark",
//     email: "elizabeth.clark@example.com",
//     phone: "234-567-8902",
//     department: "Finance",
//     role: "Accountant",
//     status: "inactive",
//     joinDate: "2021-07-20",
//     avatar: "/placeholder.svg?height=40&width=40",
//     address: "909 Peach St, City, Country",
//     emergencyContact: "William Clark (Husband) - 876-543-2100",
//     skills: ["Accounting", "Budgeting", "Financial Reporting"],
//   },
// ]

// Helper function to generate a unique ID
// const generateId = () => {
//   return Math.random().toString(36).substring(2, 9)
// }

export default function EmployeeManagementPage() {
  const { toast } = useToast()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Add a state variable for activeDepartment after the other state declarations
  const [activeDepartment, setActiveDepartment] = useState<string>("all")

  // Now let's modify the DataList to use filtered employees
  // First, add a filteredEmployees state
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])

  // Modal states
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  // Form state
  const [formData, setFormData] = useState<Omit<Employee, "id">>({
    name: "",
    email: "",
    phone: "",
    department: "",
    role: "",
    status: "active",
    joinDate: new Date().toISOString().split("T")[0],
    address: "",
    emergencyContact: "",
    skills: [],
  })

  // Update the useEffect that loads initial data
  useEffect(() => {
    const timer = setTimeout(() => {
      setEmployees(initialEmployees)
      setFilteredEmployees(initialEmployees)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Add a new useEffect to handle filtering
  useEffect(() => {
    if (employees.length > 0) {
      let filtered = [...employees]

      // Apply department filter if not "all"
      if (activeDepartment !== "all") {
        filtered = filtered.filter((employee) => employee.department === activeDepartment)
      }

      setFilteredEmployees(filtered)
    }
  }, [activeDepartment, employees])

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Reset form data
  const resetFormData = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      department: "",
      role: "",
      status: "active",
      joinDate: new Date().toISOString().split("T")[0],
      address: "",
      emergencyContact: "",
      skills: [],
    })
  }

  // Add new employee
  const handleAddEmployee = () => {
    const newEmployee: Employee = {
      id: generateId(),
      ...formData,
      avatar: "/placeholder.svg?height=40&width=40",
    }

    setEmployees((prev) => [...prev, newEmployee])
    setFilteredEmployees((prev) => [...prev, newEmployee])
    resetFormData()
    setAddDialogOpen(false)

    toast({
      title: "Employee Added",
      description: `${newEmployee.name} has been added successfully.`,
    })
  }

  // Edit employee
  const handleEditEmployee = () => {
    if (!selectedEmployee) return

    const updatedEmployees = employees.map((emp) => (emp.id === selectedEmployee.id ? { ...emp, ...formData } : emp))
    const updatedFilteredEmployees = filteredEmployees.map((emp) =>
      emp.id === selectedEmployee.id ? { ...emp, ...formData } : emp,
    )

    setEmployees(updatedEmployees)
    setFilteredEmployees(updatedFilteredEmployees)
    resetFormData()
    setEditDialogOpen(false)

    toast({
      title: "Employee Updated",
      description: `${formData.name} has been updated successfully.`,
    })
  }

  // Delete employee
  const handleDeleteEmployee = () => {
    if (!selectedEmployee) return

    const updatedEmployees = employees.filter((emp) => emp.id !== selectedEmployee.id)
    const updatedFilteredEmployees = filteredEmployees.filter((emp) => emp.id !== selectedEmployee.id)

    setEmployees(updatedEmployees)
    setFilteredEmployees(updatedFilteredEmployees)
    setDeleteDialogOpen(false)

    toast({
      title: "Employee Deleted",
      description: `${selectedEmployee.name} has been deleted.`,
      variant: "destructive",
    })
  }

  // Open edit dialog and populate form
  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee)
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      department: employee.department,
      role: employee.role,
      status: employee.status,
      joinDate: employee.joinDate,
      address: employee.address || "",
      emergencyContact: employee.emergencyContact || "",
      skills: employee.skills || [],
    })
    setEditDialogOpen(true)
  }

  // Open view dialog
  const openViewDialog = (employee: Employee) => {
    setSelectedEmployee(employee)
    setViewDialogOpen(true)
  }

  // Open delete dialog
  const openDeleteDialog = (employee: Employee) => {
    setSelectedEmployee(employee)
    setDeleteDialogOpen(true)
  }

  // Render status badge
  const renderStatusBadge = (status: EmployeeStatus) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "inactive":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Inactive
          </Badge>
        )
      case "on-leave":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">On Leave</Badge>
      default:
        return null
    }
  }

  // Define columns for DataList
  const columns: ColumnDef<Employee>[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.avatar} alt={row.name} />
            <AvatarFallback>{row.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.name}</div>
            <div className="text-xs text-muted-foreground">{row.email}</div>
          </div>
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
      id: "department",
      header: "Department",
      accessorKey: "department",
      className: "hidden md:table-cell",
    },
    {
      id: "role",
      header: "Role",
      accessorKey: "role",
      className: "hidden md:table-cell",
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
          <Button variant="ghost" size="icon" onClick={() => openEditDialog(row)}>
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(row)}>
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
          <h1 className="text-2xl font-bold">Employee Management</h1>
          <p className="text-muted-foreground">Manage your organization's employees</p>
        </div>
        <Button
          onClick={() => {
            resetFormData()
            setAddDialogOpen(true)
          }}
          className="transition-all hover:scale-105"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* Add the department filter UI after the "Add Employee" button */}
      {/* Add this right before the DataList component */}
      <div className="space-y-4 mt-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h2 className="text-lg font-semibold">Departments</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge
            variant={activeDepartment === "all" ? "default" : "outline"}
            className="cursor-pointer px-3 py-1 text-sm"
            onClick={() => setActiveDepartment("all")}
          >
            All Departments
          </Badge>

          {departments.map((department) => (
            <Badge
              key={department}
              variant={activeDepartment === department ? "default" : "outline"}
              className="cursor-pointer px-3 py-1 text-sm"
              onClick={() => setActiveDepartment(department)}
            >
              {department}
            </Badge>
          ))}
        </div>
      </div>

      {/* Update the DataList to use filtered employees instead of employees */}
      <DataList
        data={filteredEmployees}
        columns={columns}
        searchable={true}
        searchFields={["name", "email", "department", "role"]}
        filterable={true}
        sortable={true}
        pagination={true}
        pageSize={5}
        pageSizeOptions={[5, 10, 20, 50]}
        emptyMessage="No employees found"
        isLoading={isLoading}
        loadingComponent={
          <div className="flex justify-center items-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading employees...</span>
          </div>
        }
      />

      {/* Add Employee Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>Fill in the details to add a new employee to your organization.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="123-456-7890"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="joinDate">Join Date</Label>
                <Input
                  id="joinDate"
                  name="joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={formData.department} onValueChange={(value) => handleSelectChange("department", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  name="role"
                  placeholder="Software Developer"
                  value={formData.role}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: EmployeeStatus) => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on-leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="123 Main St, City, Country"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                name="emergencyContact"
                placeholder="Jane Doe (Wife) - 987-654-3210"
                value={formData.emergencyContact}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEmployee}>Add Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>Update the employee information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input id="edit-name" name="name" value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input id="edit-phone" name="phone" value={formData.phone} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-joinDate">Join Date</Label>
                <Input
                  id="edit-joinDate"
                  name="joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Select value={formData.department} onValueChange={(value) => handleSelectChange("department", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Input id="edit-role" name="role" value={formData.role} onChange={handleInputChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: EmployeeStatus) => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on-leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input id="edit-address" name="address" value={formData.address} onChange={handleInputChange} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-emergencyContact">Emergency Contact</Label>
              <Input
                id="edit-emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditEmployee}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Employee Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedEmployee.avatar} alt={selectedEmployee.name} />
                  <AvatarFallback className="text-2xl">{selectedEmployee.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-bold">{selectedEmployee.name}</h3>
                  <p className="text-muted-foreground">{selectedEmployee.role}</p>
                  <div className="mt-2">{renderStatusBadge(selectedEmployee.status)}</div>
                </div>
              </div>

              <Tabs defaultValue="personal">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="employment">Employment</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4 animate-fadeIn">
                  <Card>
                    <CardContent className="pt-6">
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                          <dd className="mt-1">{selectedEmployee.email}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                          <dd className="mt-1">{selectedEmployee.phone}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-muted-foreground">Address</dt>
                          <dd className="mt-1">{selectedEmployee.address || "Not provided"}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-muted-foreground">Emergency Contact</dt>
                          <dd className="mt-1">{selectedEmployee.emergencyContact || "Not provided"}</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="employment" className="space-y-4 animate-fadeIn">
                  <Card>
                    <CardContent className="pt-6">
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Department</dt>
                          <dd className="mt-1">{selectedEmployee.department}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Role</dt>
                          <dd className="mt-1">{selectedEmployee.role}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Join Date</dt>
                          <dd className="mt-1">{new Date(selectedEmployee.joinDate).toLocaleDateString()}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                          <dd className="mt-1">{renderStatusBadge(selectedEmployee.status)}</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="skills" className="space-y-4 animate-fadeIn">
                  <Card>
                    <CardContent className="pt-6">
                      {selectedEmployee.skills && selectedEmployee.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedEmployee.skills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="px-3 py-1">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No skills listed</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this employee? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedEmployee && (
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedEmployee.avatar} alt={selectedEmployee.name} />
                  <AvatarFallback>{selectedEmployee.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedEmployee.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedEmployee.email}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEmployee}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

