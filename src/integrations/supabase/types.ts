export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      action_plans: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          progress_notes: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          progress_notes?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          progress_notes?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      evaluation_criteria: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      evaluations: {
        Row: {
          comunicacao: number
          created_at: string
          empatia: number
          evaluated_id: string
          evaluator_id: string
          id: string
          lideranca: number
          organizacao: number
          proatividade: number
          resolucao_problemas: number
        }
        Insert: {
          comunicacao: number
          created_at?: string
          empatia: number
          evaluated_id: string
          evaluator_id: string
          id?: string
          lideranca: number
          organizacao: number
          proatividade: number
          resolucao_problemas: number
        }
        Update: {
          comunicacao?: number
          created_at?: string
          empatia?: number
          evaluated_id?: string
          evaluator_id?: string
          id?: string
          lideranca?: number
          organizacao?: number
          proatividade?: number
          resolucao_problemas?: number
        }
        Relationships: []
      }
      evolution_checkins: {
        Row: {
          action_plan: string | null
          created_at: string
          id: string
          improvements: string | null
          meeting_date: string
          strengths: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          action_plan?: string | null
          created_at?: string
          id?: string
          improvements?: string | null
          meeting_date?: string
          strengths?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          action_plan?: string | null
          created_at?: string
          id?: string
          improvements?: string | null
          meeting_date?: string
          strengths?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feedbacks: {
        Row: {
          area: string
          author_id: string
          created_at: string
          id: string
          message: string
          target_id: string
        }
        Insert: {
          area: string
          author_id: string
          created_at?: string
          id?: string
          message: string
          target_id: string
        }
        Update: {
          area?: string
          author_id?: string
          created_at?: string
          id?: string
          message?: string
          target_id?: string
        }
        Relationships: []
      }
      library_files: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          title: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          title: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          title?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      module_progress: {
        Row: {
          id: string
          module_id: string
          progress: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          module_id: string
          progress?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          module_id?: string
          progress?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          activities: number
          created_at: string
          description: string | null
          id: string
          lessons: number
          month: string
          sort_order: number
          title: string
        }
        Insert: {
          activities?: number
          created_at?: string
          description?: string | null
          id?: string
          lessons?: number
          month: string
          sort_order?: number
          title: string
        }
        Update: {
          activities?: number
          created_at?: string
          description?: string | null
          id?: string
          lessons?: number
          month?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      schedule_events: {
        Row: {
          created_at: string
          description: string | null
          end_time: string | null
          event_date: string
          id: string
          instructor: string | null
          location: string | null
          start_time: string | null
          title: string
          training_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date: string
          id?: string
          instructor?: string | null
          location?: string | null
          start_time?: string | null
          title: string
          training_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date?: string
          id?: string
          instructor?: string | null
          location?: string | null
          start_time?: string | null
          title?: string
          training_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      task_completions: {
        Row: {
          completed_at: string | null
          done: boolean
          id: string
          reflection: string | null
          task_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          done?: boolean
          id?: string
          reflection?: string | null
          task_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          done?: boolean
          id?: string
          reflection?: string | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_completions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          points: number
          title: string
          week: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          points?: number
          title: string
          week: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          points?: number
          title?: string
          week?: string
        }
        Relationships: []
      }
      training_progress: {
        Row: {
          id: string
          progress: number
          status: string
          training_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          progress?: number
          status?: string
          training_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          progress?: number
          status?: string
          training_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trainings: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          link: string | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          link?: string | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          link?: string | null
          title?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
