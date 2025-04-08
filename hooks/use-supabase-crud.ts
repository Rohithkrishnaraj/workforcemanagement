import { useState, useCallback, useMemo, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

type TableName = keyof Database['public']['Tables']
type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row']
type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert']
type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update']

interface UseSupabaseCrudOptions<T extends TableName> {
  table: T
  select?: string
  autoFetch?: boolean
}

interface CrudResponse<T> {
  data: T | null
  error: string | null
}

// Add BaseRecord type for common fields
interface BaseRecord {
  id: string
  created_at?: string
  created_by?: string | null
  updated_at?: string
  updated_by?: string | null
}

// Helper function to handle errors
const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: string }).message)
  }
  return 'An unknown error occurred'
}

// Helper function to log errors
const logError = (operation: string, table: string, error: unknown) => {
  const errorMessage = handleError(error)
  console.error(`[Supabase ${operation} Error] [${table}]:`, errorMessage, '\nDetails:', error)
  return errorMessage
}

export function useSupabaseCrud<T extends TableName>({ 
  table, 
  select = '*',
  autoFetch = true
}: UseSupabaseCrudOptions<T>) {
  const [data, setData] = useState<TableRow<T>[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient<Database>()

  const fetchAll = useCallback(async (): Promise<CrudResponse<TableRow<T>[]>> => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: result, error: fetchError } = await supabase
        .from(table)
        .select(select)

      if (fetchError) {
        throw fetchError
      }

      if (!result) {
        setData([])
        return { data: [], error: null }
      }

      const typedData = result as unknown as TableRow<T>[]
      setData(typedData)
      return { data: typedData, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [table, select, supabase])

  const create = useCallback(async (record: TableInsert<T>): Promise<CrudResponse<TableRow<T>>> => {
    try {
      setError(null)

      const { data: result, error: createError } = await supabase
        .from(table)
        .insert([record])
        .select()
        .single()

      if (createError) {
        throw createError
      }

      if (!result) {
        throw new Error('No data returned from create operation')
      }

      const typedData = result as unknown as TableRow<T>
      setData(prev => [...prev, typedData])
      return { data: typedData, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }, [table, supabase])

  const update = useCallback(async (id: string, updates: TableUpdate<T>): Promise<CrudResponse<TableRow<T>>> => {
    try {
      setError(null)

      const { data: result, error: updateError } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      if (!result) {
        throw new Error('No data returned from update operation')
      }

      const typedData = result as unknown as TableRow<T>
      setData(prev => prev.map(item => item.id === id ? typedData : item))
      return { data: typedData, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }, [table, supabase])

  const remove = useCallback(async (id: string): Promise<CrudResponse<boolean>> => {
    try {
      setError(null)

      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq('id', id)

      if (deleteError) {
        throw deleteError
      }

      setData(prev => prev.filter(item => item.id !== id))
      return { data: true, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }, [table, supabase])

  const filter = useCallback(async (column: keyof TableRow<T>, value: any): Promise<CrudResponse<TableRow<T>[]>> => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: result, error: filterError } = await supabase
        .from(table)
        .select(select)
        .eq(column as string, value)

      if (filterError) {
        throw filterError
      }

      if (!result) {
        return { data: [], error: null }
      }

      const typedData = result as unknown as TableRow<T>[]
      return { data: typedData, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [table, select, supabase])

  const fetchOne = useCallback(async (id: string): Promise<CrudResponse<TableRow<T>>> => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: result, error: fetchError } = await supabase
        .from(table)
        .select(select)
        .eq('id', id)
        .single()

      if (fetchError) {
        throw fetchError
      }

      if (!result) {
        throw new Error('No data returned from fetchOne operation')
      }

      const typedData = result as unknown as TableRow<T>
      return { data: typedData, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [table, select, supabase])

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchAll()
    }
  }, [autoFetch, fetchAll])

  return useMemo(() => ({
    data,
    isLoading,
    error,
    fetchAll,
    fetchOne,
    create,
    update,
    remove,
    filter
  }), [data, isLoading, error, fetchAll, fetchOne, create, update, remove, filter])
} 