export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          department: string
          role: string
          status: "active" | "inactive" | "on-leave"
          join_date: string
          avatar_url: string | null
          address: string | null
          todays_attendance?: 'present' | 'absent' | 'late'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["employees"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["employees"]["Insert"]>
      }
      users: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string
          status: "pending" | "in-progress" | "completed" | "cancelled"
          priority: "low" | "medium" | "high" | "urgent"
          due_date: string
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["tasks"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["tasks"]["Insert"]>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 