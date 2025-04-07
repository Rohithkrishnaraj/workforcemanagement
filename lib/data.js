import { format, addDays } from "date-fns"

// Types (for reference - these are defined in the components that use them)
// type TaskPriority = "high" | "medium" | "low"
// type TaskStatus = "pending" | "in-progress" | "completed"
// type PerformanceRating = "excellent" | "good" | "average" | "needs-improvement"
// type LeaveStatus = "pending" | "approved" | "rejected"
// type LeaveType = "vacation" | "sick" | "personal" | "bereavement" | "unpaid"
// type AttendanceStatus = "present" | "absent" | "late"

// Sample employees data
export const employees = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "123-456-7890",
    department: "Engineering",
    role: "Senior Developer",
    status: "active",
    joinDate: "2022-01-15",
    avatar:
      "https://images.unsplash.com/photo-1649433658557-54cf58577c68?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fG1hbGUlMjBwcm9maWxlfGVufDB8fDB8fHww",
    address: "123 Main St, City, Country",
    emergencyContact: "Jane Doe (Wife) - 987-654-3210",
    skills: ["React", "TypeScript", "Node.js"],
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "234-567-8901",
    department: "Design",
    role: "UI/UX Designer",
    status: "active",
    joinDate: "2022-03-10",
    avatar: "https://t4.ftcdn.net/jpg/08/04/36/29/360_F_804362990_0n7bGLz9clMBi5ajG52k8OAUQTneMbj4.jpg",
    address: "456 Oak St, City, Country",
    emergencyContact: "John Smith (Husband) - 876-543-2109",
    skills: ["Figma", "Adobe XD", "Sketch"],
  },
  {
    id: "3",
    name: "Michael Johnson",
    email: "michael.johnson@example.com",
    phone: "345-678-9012",
    department: "Marketing",
    role: "Marketing Manager",
    status: "on-leave",
    joinDate: "2021-11-05",
    avatar: "https://wallpapers.com/images/hd/professional-profile-pictures-1080-x-1080-460wjhrkbwdcp1ig.jpg",
    address: "789 Pine St, City, Country",
    emergencyContact: "Sarah Johnson (Wife) - 765-432-1098",
    skills: ["SEO", "Content Marketing", "Social Media"],
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    phone: "456-789-0123",
    department: "HR",
    role: "HR Specialist",
    status: "active",
    joinDate: "2022-05-20",
    avatar: "https://c1.wallpaperflare.com/preview/711/14/431/smile-profile-face-male.jpg",
    address: "101 Elm St, City, Country",
    emergencyContact: "Robert Davis (Brother) - 654-321-0987",
    skills: ["Recruitment", "Employee Relations", "Training"],
  },
  {
    id: "5",
    name: "David Wilson",
    email: "david.wilson@example.com",
    phone: "567-890-1234",
    department: "Finance",
    role: "Financial Analyst",
    status: "inactive",
    joinDate: "2021-08-15",
    avatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmVzc2lvbmFsJTIwbWFufGVufDB8fDB8fHww",
    address: "202 Maple St, City, Country",
    emergencyContact: "Linda Wilson (Mother) - 543-210-9876",
    skills: ["Financial Modeling", "Data Analysis", "Forecasting"],
  },
]

// Admin user (for comments)
export const adminUser = {
  id: "admin1",
  name: "Admin User",
  avatar:
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmVzc2lvbmFsJTIwbWFufGVufDB8fDB8fHww",
}

// Generate sample tasks
export const generateSampleTasks = () => {
  const tasks = []
  const categories = ["Development", "Design", "Marketing", "HR", "Finance", "Custom"]
  const statuses = ["pending", "in-progress", "completed"]
  const priorities = ["high", "medium", "low"]

  // Generate 100 random tasks
  for (let i = 0; i < 100; i++) {
    const employeeId = employees[Math.floor(Math.random() * employees.length)].id
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const priority = priorities[Math.floor(Math.random() * priorities.length)]
    const category = categories[Math.floor(Math.random() * categories.length)]

    // Generate random dates
    const today = new Date()
    const dueDate = new Date(today)
    dueDate.setDate(today.getDate() - Math.floor(Math.random() * 60) + 30) // -30 to +30 days from today

    let completedDate
    if (status === "completed") {
      completedDate = new Date(dueDate)
      // 70% chance of completing on time, 30% chance of being late
      const onTime = Math.random() < 0.7
      if (onTime) {
        completedDate.setDate(dueDate.getDate() - Math.floor(Math.random() * 5)) // 0-5 days early
      } else {
        completedDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 7) + 1) // 1-7 days late
      }
    }

    tasks.push({
      id: `task-${i + 1}`,
      title: `Task ${i + 1}`,
      assignedTo: employeeId,
      priority,
      status,
      dueDate: dueDate.toISOString().split("T")[0],
      completedDate: completedDate ? completedDate.toISOString().split("T")[0] : undefined,
      category,
    })
  }

  return tasks
}

// Calculate performance metrics for each employee
export const calculatePerformanceMetrics = (tasks) => {
  const performanceMap = new Map()
  const currentMonth = format(new Date(), "yyyy-MM")

  // Initialize performance data for each employee
  employees.forEach((employee) => {
    performanceMap.set(employee.id, {
      id: `perf-${employee.id}-${currentMonth}`,
      employeeId: employee.id,
      employeeName: employee.name,
      employeeAvatar: employee.avatar,
      employeeDepartment: employee.department,
      tasksCompleted: 0,
      highPriorityCompleted: 0,
      mediumPriorityCompleted: 0,
      lowPriorityCompleted: 0,
      onTimeCompletion: 0,
      lateCompletion: 0,
      averageCompletionTime: 0,
      performanceScore: 0,
      performanceRating: "average",
      month: currentMonth,
    })
  })

  // Filter completed tasks for the current month
  const completedTasks = tasks.filter(
    (task) => task.status === "completed" && task.completedDate?.startsWith(currentMonth.substring(0, 7)),
  )

  // Calculate completion times and count metrics
  const completionTimes = new Map()

  completedTasks.forEach((task) => {
    const employeeId = task.assignedTo
    const performance = performanceMap.get(employeeId)

    if (performance) {
      // Increment task counts
      performance.tasksCompleted++

      // Count by priority
      if (task.priority === "high") {
        performance.highPriorityCompleted++
      } else if (task.priority === "medium") {
        performance.mediumPriorityCompleted++
      } else {
        performance.lowPriorityCompleted++
      }

      // Calculate if completed on time
      if (task.completedDate && task.dueDate) {
        const completedDate = new Date(task.completedDate)
        const dueDate = new Date(task.dueDate)

        if (completedDate <= dueDate) {
          performance.onTimeCompletion++
        } else {
          performance.lateCompletion++
        }

        // Track completion time for average calculation
        const completionTime = Math.round((completedDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
        if (!completionTimes.has(employeeId)) {
          completionTimes.set(employeeId, [])
        }
        completionTimes.get(employeeId)?.push(completionTime)
      }

      performanceMap.set(employeeId, performance)
    }
  })

  // Calculate averages and scores
  performanceMap.forEach((performance, employeeId) => {
    const times = completionTimes.get(employeeId) || []

    // Calculate average completion time
    if (times.length > 0) {
      performance.averageCompletionTime = Number((times.reduce((sum, time) => sum + time, 0) / times.length).toFixed(1))
    }

    // Calculate performance score (0-100)
    // Weighted formula:
    // 50% - high priority tasks (more is better)
    // 30% - on-time completion rate
    // 20% - total tasks completed

    const totalTasks = performance.tasksCompleted
    const onTimeRate = totalTasks > 0 ? performance.onTimeCompletion / totalTasks : 0

    // Normalize high priority tasks (assuming 10 is excellent)
    const normalizedHighPriority = Math.min(performance.highPriorityCompleted / 10, 1)

    // Calculate score
    performance.performanceScore = Math.round(
      normalizedHighPriority * 50 + onTimeRate * 30 + Math.min(totalTasks / 20, 1) * 20,
    )

    // Determine rating
    if (performance.performanceScore >= 85) {
      performance.performanceRating = "excellent"
    } else if (performance.performanceScore >= 70) {
      performance.performanceRating = "good"
    } else if (performance.performanceScore >= 50) {
      performance.performanceRating = "average"
    } else {
      performance.performanceRating = "needs-improvement"
    }
  })

  return Array.from(performanceMap.values())
}

// Generate sample attendance data for the past 30 days
export const generateSampleAttendanceData = () => {
  const records = []
  const today = new Date()

  // For each employee
  employees.forEach((employee) => {
    // For each of the past 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(today.getDate() - i)

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue

      const dateStr = date.toISOString().split("T")[0]

      // Randomly determine status
      const randomStatus = Math.random()
      let status
      let clockIn = null
      let clockOut = null
      let totalHours = null

      if (randomStatus < 0.1) {
        // 10% chance of being absent
        status = "absent"
      } else if (randomStatus < 0.2) {
        // 10% chance of being late
        status = "late"
        // Late arrival (after 9:00 AM)
        const lateMinutes = Math.floor(Math.random() * 60) + 1
        const hours = 9
        const minutes = lateMinutes
        clockIn = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`

        // Random clock out time between 5:00 PM and 6:00 PM
        const clockOutHour = 17 + Math.floor(Math.random() * 2)
        const clockOutMinute = Math.floor(Math.random() * 60)
        clockOut = `${clockOutHour.toString().padStart(2, "0")}:${clockOutMinute.toString().padStart(2, "0")}`

        // Calculate total hours
        const totalMinutes = clockOutHour * 60 + clockOutMinute - (hours * 60 + minutes)
        totalHours = Number.parseFloat((totalMinutes / 60).toFixed(2))
      } else {
        // 80% chance of being present
        status = "present"
        // Random clock in time between 8:30 AM and 9:00 AM
        const clockInMinute = 30 + Math.floor(Math.random() * 30)
        clockIn = `08:${clockInMinute.toString().padStart(2, "0")}`

        // Random clock out time between 5:00 PM and 6:00 PM
        const clockOutHour = 17 + Math.floor(Math.random() * 2)
        const clockOutMinute = Math.floor(Math.random() * 60)
        clockOut = `${clockOutHour.toString().padStart(2, "0")}:${clockOutMinute.toString().padStart(2, "0")}`

        // Calculate total hours
        const totalMinutes = clockOutHour * 60 + clockOutMinute - (8 * 60 + clockInMinute)
        totalHours = Number.parseFloat((totalMinutes / 60).toFixed(2))
      }

      records.push({
        id: `${employee.id}-${dateStr}`,
        employeeId: employee.id,
        employeeName: employee.name,
        employeeAvatar: employee.avatar,
        date: dateStr,
        clockIn,
        clockOut,
        totalHours,
        status,
      })
    }
  })

  // Sort by date (newest first)
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Generate sample leave requests
export const generateSampleLeaveRequests = () => {
  const leaveTypes = ["vacation", "sick", "personal", "bereavement", "unpaid"]
  const statuses = ["pending", "approved", "rejected"]

  const requests = [
    {
      id: "leave1",
      employeeId: "1",
      employeeName: "John Doe",
      employeeAvatar:
        "https://images.unsplash.com/photo-1649433658557-54cf58577c68?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fG1hbGUlMjBwcm9maWxlfGVufDB8fDB8fHww",
      employeeDepartment: "Engineering",
      leaveType: "vacation",
      startDate: "2023-08-15",
      endDate: "2023-08-20",
      totalDays: 6,
      reason: "Family vacation to Hawaii",
      status: "approved",
      comments: [
        {
          id: "comment1",
          authorId: "admin1",
          authorName: "Admin User",
          authorAvatar:
            "https://images.unsplash.com/photo-1560250097-0b93528c311a?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmVzc2lvbmFsJTIwbWFufGVufDB8fDB8fHww",
          text: "Approved. Enjoy your vacation!",
          timestamp: "2023-08-01T10:30:00Z",
        },
      ],
      createdAt: "2023-07-20T09:15:00Z",
      updatedAt: "2023-08-01T10:30:00Z",
    },
    {
      id: "leave2",
      employeeId: "2",
      employeeName: "Jane Smith",
      employeeAvatar: "https://t4.ftcdn.net/jpg/08/04/36/29/360_F_804362990_0n7bGLz9clMBi5ajG52k8OAUQTneMbj4.jpg",
      employeeDepartment: "Design",
      leaveType: "sick",
      startDate: "2023-08-10",
      endDate: "2023-08-12",
      totalDays: 3,
      reason: "Flu and fever",
      status: "approved",
      comments: [
        {
          id: "comment2",
          authorId: "admin1",
          authorName: "Admin User",
          authorAvatar:
            "https://images.unsplash.com/photo-1560250097-0b93528c311a?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmVzc2lvbmFsJTIwbWFufGVufDB8fDB8fHww",
          text: "Approved. Get well soon!",
          timestamp: "2023-08-05T11:20:00Z",
        },
      ],
      createdAt: "2023-08-05T08:30:00Z",
      updatedAt: "2023-08-05T11:20:00Z",
    },
    {
      id: "leave3",
      employeeId: "3",
      employeeName: "Michael Johnson",
      employeeAvatar: "https://wallpapers.com/images/hd/professional-profile-pictures-1080-x-1080-460wjhrkbwdcp1ig.jpg",
      employeeDepartment: "Marketing",
      leaveType: "personal",
      startDate: "2023-08-25",
      endDate: "2023-08-25",
      totalDays: 1,
      reason: "Personal appointment",
      status: "pending",
      comments: [],
      createdAt: "2023-08-10T14:45:00Z",
      updatedAt: "2023-08-10T14:45:00Z",
    },
    {
      id: "leave4",
      employeeId: "4",
      employeeName: "Emily Davis",
      employeeAvatar: "https://c1.wallpaperflare.com/preview/711/14/431/smile-profile-face-male.jpg",
      employeeDepartment: "HR",
      leaveType: "bereavement",
      startDate: "2023-08-05",
      endDate: "2023-08-09",
      totalDays: 5,
      reason: "Family emergency",
      status: "approved",
      comments: [
        {
          id: "comment3",
          authorId: "admin1",
          authorName: "Admin User",
          authorAvatar:
            "https://images.unsplash.com/photo-1560250097-0b93528c311a?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmVzc2lvbmFsJTIwbWFufGVufDB8fDB8fHww",
          text: "Approved. Our condolences for your loss.",
          timestamp: "2023-08-02T09:10:00Z",
        },
      ],
      createdAt: "2023-08-01T16:20:00Z",
      updatedAt: "2023-08-02T09:10:00Z",
    },
    {
      id: "leave5",
      employeeId: "5",
      employeeName: "David Wilson",
      employeeAvatar:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmVzc2lvbmFsJTIwbWFufGVufDB8fDB8fHww",
      employeeDepartment: "Finance",
      leaveType: "vacation",
      startDate: "2023-09-10",
      endDate: "2023-09-15",
      totalDays: 6,
      reason: "Anniversary trip",
      status: "pending",
      comments: [],
      createdAt: "2023-08-15T10:30:00Z",
      updatedAt: "2023-08-15T10:30:00Z",
    },
    {
      id: "leave6",
      employeeId: "1",
      employeeName: "John Doe",
      employeeAvatar:
        "https://images.unsplash.com/photo-1649433658557-54cf58577c68?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fG1hbGUlMjBwcm9maWxlfGVufDB8fDB8fHww",
      employeeDepartment: "Engineering",
      leaveType: "personal",
      startDate: "2023-09-05",
      endDate: "2023-09-05",
      totalDays: 1,
      reason: "DMV appointment",
      status: "pending",
      comments: [],
      createdAt: "2023-08-20T11:15:00Z",
      updatedAt: "2023-08-20T11:15:00Z",
    },
    {
      id: "leave7",
      employeeId: "2",
      employeeName: "Jane Smith",
      employeeAvatar: "https://t4.ftcdn.net/jpg/08/04/36/29/360_F_804362990_0n7bGLz9clMBi5ajG52k8OAUQTneMbj4.jpg",
      employeeDepartment: "Design",
      leaveType: "unpaid",
      startDate: "2023-10-01",
      endDate: "2023-10-10",
      totalDays: 10,
      reason: "Extended personal leave",
      status: "rejected",
      comments: [
        {
          id: "comment4",
          authorId: "admin1",
          authorName: "Admin User",
          authorAvatar:
            "https://images.unsplash.com/photo-1560250097-0b93528c311a?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmVzc2lvbmFsJTIwbWFufGVufDB8fDB8fHww",
          text: "Unable to approve due to upcoming project deadlines. Please consider rescheduling.",
          timestamp: "2023-08-18T14:30:00Z",
        },
      ],
      createdAt: "2023-08-15T09:45:00Z",
      updatedAt: "2023-08-18T14:30:00Z",
    },
    {
      id: "leave8",
      employeeId: "3",
      employeeName: "Michael Johnson",
      employeeAvatar: "https://wallpapers.com/images/hd/professional-profile-pictures-1080-x-1080-460wjhrkbwdcp1ig.jpg",
      employeeDepartment: "Marketing",
      leaveType: "sick",
      startDate: "2023-08-21",
      endDate: "2023-08-22",
      totalDays: 2,
      reason: "Migraine",
      status: "approved",
      comments: [
        {
          id: "comment5",
          authorId: "admin1",
          authorName: "Admin User",
          authorAvatar:
            "https://images.unsplash.com/photo-1560250097-0b93528c311a?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmVzc2lvbmFsJTIwbWFufGVufDB8fDB8fHww",
          text: "Approved. Take care.",
          timestamp: "2023-08-20T16:15:00Z",
        },
      ],
      createdAt: "2023-08-20T15:30:00Z",
      updatedAt: "2023-08-20T16:15:00Z",
    },
    {
      id: "leave9",
      employeeId: "4",
      employeeName: "Emily Davis",
      employeeAvatar: "https://c1.wallpaperflare.com/preview/711/14/431/smile-profile-face-male.jpg",
      employeeDepartment: "HR",
      leaveType: "vacation",
      startDate: "2023-12-20",
      endDate: "2023-12-31",
      totalDays: 12,
      reason: "Holiday vacation",
      status: "pending",
      comments: [],
      createdAt: "2023-08-25T10:00:00Z",
      updatedAt: "2023-08-25T10:00:00Z",
    },
    {
      id: "leave10",
      employeeId: "5",
      employeeName: "David Wilson",
      employeeAvatar:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmVzc2lvbmFsJTIwbWFufGVufDB8fDB8fHww",
      employeeDepartment: "Finance",
      leaveType: "personal",
      startDate: "2023-09-20",
      endDate: "2023-09-20",
      totalDays: 1,
      reason: "House closing",
      status: "approved",
      comments: [
        {
          id: "comment6",
          authorId: "admin1",
          authorName: "Admin User",
          authorAvatar:
            "https://images.unsplash.com/photo-1560250097-0b93528c311a?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmVzc2lvbmFsJTIwbWFufGVufDB8fDB8fHww",
          text: "Approved. Congratulations on your new home!",
          timestamp: "2023-08-30T11:45:00Z",
        },
      ],
      createdAt: "2023-08-28T09:30:00Z",
      updatedAt: "2023-08-30T11:45:00Z",
    },
  ]

  // Add some more random leave requests
  for (let i = 0; i < 10; i++) {
    const employeeIndex = Math.floor(Math.random() * employees.length)
    const employee = employees[employeeIndex]

    const leaveType = leaveTypes[Math.floor(Math.random() * leaveTypes.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]

    // Generate random dates
    const currentDate = new Date()
    const startOffset = Math.floor(Math.random() * 60) - 30 // -30 to +30 days from now
    const startDate = addDays(currentDate, startOffset)
    const duration = Math.floor(Math.random() * 7) + 1 // 1 to 7 days
    const endDate = addDays(startDate, duration - 1)

    const request = {
      id: `leave${i + 11}`,
      employeeId: employee.id,
      employeeName: employee.name,
      employeeAvatar: employee.avatar,
      employeeDepartment: employee.department,
      leaveType,
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
      totalDays: duration,
      reason: `${leaveType.charAt(0).toUpperCase() + leaveType.slice(1)} leave`,
      status,
      comments:
        status !== "pending"
          ? [
              {
                id: `comment-auto-${i}`,
                authorId: adminUser.id,
                authorName: adminUser.name,
                authorAvatar: adminUser.avatar,
                text:
                  status === "approved"
                    ? "Approved. Enjoy your time off."
                    : "Unable to approve at this time due to staffing constraints.",
                timestamp: new Date().toISOString(),
              },
            ]
          : [],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt:
        status !== "pending"
          ? new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    }

    requests.push(request)
  }

  // Sort by created date (newest first)
  return requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// Sample dashboard data
export const getDashboardData = () => {
  const tasks = generateSampleTasks()
  const completedTasks = tasks.filter((task) => task.status === "completed").length
  const pendingTasks = tasks.filter((task) => task.status === "pending").length
  const leaveRequests = generateSampleLeaveRequests()
  const pendingLeaveRequests = leaveRequests.filter((request) => request.status === "pending").length

  return {
    totalEmployees: employees.length,
    todayAttendance: {
      present: 98,
      absent: 12,
      late: 14,
      total: 124,
    },
    pendingTasks,
    pendingLeaveRequests,
    starPerformer: {
      id: "emp1",
      name: "John Doe",
      department: "Engineering",
      avatar:
        "https://images.unsplash.com/photo-1649433658557-54cf58577c68?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fG1hbGUlMjBwcm9maWxlfGVufDB8fDB8fHww",
      performanceScore: 92,
      completedTasks: 28,
    },
    recentActivities: [
      {
        id: "act1",
        type: "leave",
        description: "Jane Smith requested leave for 3 days",
        timestamp: "2023-08-15T09:30:00Z",
      },
      {
        id: "act2",
        type: "task",
        description: "Michael Johnson completed task 'Update website content'",
        timestamp: "2023-08-15T08:45:00Z",
      },
      {
        id: "act3",
        type: "attendance",
        description: "Emily Davis marked attendance (Late)",
        timestamp: "2023-08-15T10:15:00Z",
      },
      {
        id: "act4",
        type: "employee",
        description: "New employee David Wilson joined",
        timestamp: "2023-08-14T14:20:00Z",
      },
      {
        id: "act5",
        type: "task",
        description: "Sarah Brown assigned new task 'Design logo'",
        timestamp: "2023-08-14T11:30:00Z",
      },
    ],
  }
}

// Helper functions
export const formatDate = (dateString) => {
  const options = { year: "numeric", month: "short", day: "numeric" }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

export const formatDateRange = (startDate, endDate) => {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`
}

export const formatTime = (time) => {
  if (!time) return "—"

  const [hoursStr, minutesStr] = time.split(":")
  const hours = Number.parseInt(hoursStr, 10)
  const minutes = minutesStr

  const period = hours >= 12 ? "PM" : "AM"
  const displayHours = hours % 12 || 12

  return `${displayHours}:${minutes} ${period}`
}

// Format timestamp
export const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString()
}

// Generate a unique ID
export const generateId = () => {
  return Math.random().toString(36).substring(2, 9)
}

