"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  SearchIcon,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Types
export type SortDirection = "asc" | "desc" | null
export type FilterOperator = "equals" | "contains" | "startsWith" | "endsWith" | "gt" | "lt" | "gte" | "lte"

export interface ColumnDef<T> {
  id: string
  header: string
  accessorKey: keyof T | ((row: T) => any)
  cell?: (row: T) => React.ReactNode
  enableSorting?: boolean
  enableFiltering?: boolean
  filterOperators?: FilterOperator[]
  className?: string
  meta?: Record<string, any>
}

export interface FilterDef {
  id: string
  columnId: string
  operator: FilterOperator
  value: string | number | boolean
}

export interface DataListProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  searchable?: boolean
  searchFields?: (keyof T)[]
  filterable?: boolean
  sortable?: boolean
  pagination?: boolean
  pageSize?: number
  pageSizeOptions?: number[]
  className?: string
  emptyMessage?: string
  onRowClick?: (row: T) => void
  rowClassName?: string | ((row: T) => string)
  isLoading?: boolean
  loadingComponent?: React.ReactNode
}

function getValueByPath<T>(obj: T, path: keyof T | ((row: T) => any)): any {
  if (typeof path === "function") {
    return path(obj)
  }
  return obj[path]
}

export function DataList<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  searchFields,
  filterable = true,
  sortable = true,
  pagination = true,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50, 100],
  className,
  emptyMessage = "No data found",
  onRowClick,
  rowClassName,
  isLoading = false,
  loadingComponent,
}: DataListProps<T>) {
  // State
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<FilterDef[]>([])
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [tempFilter, setTempFilter] = useState<{
    columnId: string
    operator: FilterOperator
    value: string
  }>({
    columnId: columns[0]?.id || "",
    operator: "contains",
    value: "",
  })
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  // Reset to first page when search, filters, or page size changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, activeFilters, pageSize])

  // Search function
  const searchData = (items: T[]): T[] => {
    if (!searchQuery.trim()) return items

    return items.filter((item) => {
      const fieldsToSearch = searchFields || (Object.keys(item) as (keyof T)[])

      return fieldsToSearch.some((field) => {
        const value = getValueByPath(item, field)
        if (value == null) return false

        return String(value).toLowerCase().includes(searchQuery.toLowerCase())
      })
    })
  }

  // Filter function
  const filterData = (items: T[]): T[] => {
    if (activeFilters.length === 0) return items

    return items.filter((item) => {
      return activeFilters.every((filter) => {
        const column = columns.find((col) => col.id === filter.columnId)
        if (!column) return true

        const value = getValueByPath(item, column.accessorKey)
        if (value == null) return false

        switch (filter.operator) {
          case "equals":
            return String(value).toLowerCase() === String(filter.value).toLowerCase()
          case "contains":
            return String(value).toLowerCase().includes(String(filter.value).toLowerCase())
          case "startsWith":
            return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase())
          case "endsWith":
            return String(value).toLowerCase().endsWith(String(filter.value).toLowerCase())
          case "gt":
            return Number(value) > Number(filter.value)
          case "lt":
            return Number(value) < Number(filter.value)
          case "gte":
            return Number(value) >= Number(filter.value)
          case "lte":
            return Number(value) <= Number(filter.value)
          default:
            return true
        }
      })
    })
  }

  // Sort function
  const sortData = (items: T[]): T[] => {
    if (!sortColumn || !sortDirection) return items

    const column = columns.find((col) => col.id === sortColumn)
    if (!column) return items

    return [...items].sort((a, b) => {
      const aValue = getValueByPath(a, column.accessorKey)
      const bValue = getValueByPath(b, column.accessorKey)

      if (aValue == null) return sortDirection === "asc" ? 1 : -1
      if (bValue == null) return sortDirection === "asc" ? -1 : 1

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }

  // Process data with search, filter, and sort
  const processedData = useMemo(() => {
    let result = [...data]
    result = searchData(result)
    result = filterData(result)
    result = sortData(result)
    return result
  }, [data, searchQuery, activeFilters, sortColumn, sortDirection])

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize)
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return processedData.slice(start, end)
  }, [processedData, currentPage, pageSize])

  // Handle sort
  const handleSort = (columnId: string) => {
    if (!sortable) return

    if (sortColumn === columnId) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortColumn(null)
        setSortDirection(null)
      } else {
        setSortDirection("asc")
      }
    } else {
      setSortColumn(columnId)
      setSortDirection("asc")
    }
  }

  // Add filter
  const addFilter = () => {
    if (tempFilter.value.trim() === "") return

    setActiveFilters((prev) => [
      ...prev,
      {
        id: `${tempFilter.columnId}-${Date.now()}`,
        columnId: tempFilter.columnId,
        operator: tempFilter.operator,
        value: tempFilter.value,
      },
    ])

    // Reset temp filter
    setTempFilter({
      columnId: columns[0]?.id || "",
      operator: "contains",
      value: "",
    })
    setShowFilterMenu(false)
  }

  // Remove filter
  const removeFilter = (filterId: string) => {
    setActiveFilters((prev) => prev.filter((filter) => filter.id !== filterId))
  }

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters([])
  }

  // Get column name by ID
  const getColumnNameById = (columnId: string): string => {
    const column = columns.find((col) => col.id === columnId)
    return column ? column.header : columnId
  }

  // Get operator display name
  const getOperatorDisplayName = (operator: FilterOperator): string => {
    switch (operator) {
      case "equals":
        return "equals"
      case "contains":
        return "contains"
      case "startsWith":
        return "starts with"
      case "endsWith":
        return "ends with"
      case "gt":
        return "greater than"
      case "lt":
        return "less than"
      case "gte":
        return "greater than or equal"
      case "lte":
        return "less than or equal"
      default:
        return operator
    }
  }

  // Render sort icon
  const renderSortIcon = (columnId: string) => {
    if (!sortable) return null

    if (sortColumn === columnId) {
      if (sortDirection === "asc") {
        return <ChevronUp className="ml-1 h-4 w-4" />
      }
      if (sortDirection === "desc") {
        return <ChevronDown className="ml-1 h-4 w-4" />
      }
    }
    return <ChevronsUpDown className="ml-1 h-4 w-4 opacity-50" />
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        {searchable && (
          <div className="relative w-full sm:w-64 md:w-80">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-9 w-9"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
        )}

        {filterable && (
          <div className="flex gap-2 items-center">
            <DropdownMenu open={showFilterMenu} onOpenChange={setShowFilterMenu}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Filter className="h-4 w-4 mr-1" />
                  Add Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[300px] p-4" align="end">
                <DropdownMenuGroup className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Column</label>
                    <Select
                      value={tempFilter.columnId}
                      onValueChange={(value) => setTempFilter({ ...tempFilter, columnId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        {columns
                          .filter((column) => column.enableFiltering !== false)
                          .map((column) => (
                            <SelectItem key={column.id} value={column.id}>
                              {column.header}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Operator</label>
                    <Select
                      value={tempFilter.operator}
                      onValueChange={(value) => setTempFilter({ ...tempFilter, operator: value as FilterOperator })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                        <SelectItem value="startsWith">Starts with</SelectItem>
                        <SelectItem value="endsWith">Ends with</SelectItem>
                        <SelectItem value="gt">Greater than</SelectItem>
                        <SelectItem value="lt">Less than</SelectItem>
                        <SelectItem value="gte">Greater than or equal</SelectItem>
                        <SelectItem value="lte">Less than or equal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Value</label>
                    <Input
                      value={tempFilter.value}
                      onChange={(e) => setTempFilter({ ...tempFilter, value: e.target.value })}
                      placeholder="Filter value"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowFilterMenu(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={addFilter}>
                      Apply Filter
                    </Button>
                  </div>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {activeFilters.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge key={filter.id} variant="secondary" className="flex items-center gap-1 px-3 py-1">
              <span className="font-medium">{getColumnNameById(filter.columnId)}</span>
              <span className="text-muted-foreground">{getOperatorDisplayName(filter.operator)}</span>
              <span>"{filter.value}"</span>
              <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0" onClick={() => removeFilter(filter.id)}>
                <X className="h-3 w-3" />
                <span className="sr-only">Remove filter</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    column.enableSorting !== false && sortable && "cursor-pointer select-none",
                    column.className,
                  )}
                  onClick={() => column.enableSorting !== false && handleSort(column.id)}
                >
                  <div className="flex items-center">
                    <span>{column.header}</span>
                    {column.enableSorting !== false && sortable && renderSortIcon(column.id)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {loadingComponent || (
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                      <span className="ml-2">Loading...</span>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className={cn(
                    onRowClick && "cursor-pointer hover:bg-muted/50",
                    typeof rowClassName === "function" ? rowClassName(row) : rowClassName,
                  )}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((column) => (
                    <TableCell key={column.id} className={column.className}>
                      {column.cell ? column.cell(row) : (getValueByPath(row, column.accessorKey) ?? "—")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Showing {Math.min((currentPage - 1) * pageSize + 1, processedData.length)} to{" "}
              {Math.min(currentPage * pageSize, processedData.length)} of {processedData.length} entries
            </span>
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Page size" />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} rows
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
              <ChevronsLeft className="h-4 w-4" />
              <span className="sr-only">First page</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>

            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number

                if (totalPages <= 5) {
                  // If we have 5 or fewer pages, show all page numbers
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  // If we're near the start, show pages 1-5
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  // If we're near the end, show the last 5 pages
                  pageNum = totalPages - 4 + i
                } else {
                  // Otherwise show 2 pages before and after the current page
                  pageNum = currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
              <span className="sr-only">Last page</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

