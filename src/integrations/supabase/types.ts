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
      past_papers: {
        Row: {
          free_resource_name: string
          free_resource_url: string
          id: string
          official_portal_url: string
          spec_code: string
          subject_id: string
        }
        Insert: {
          free_resource_name: string
          free_resource_url: string
          id?: string
          official_portal_url: string
          spec_code: string
          subject_id: string
        }
        Update: {
          free_resource_name?: string
          free_resource_url?: string
          id?: string
          official_portal_url?: string
          spec_code?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "past_papers_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: true
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_subjects: {
        Row: {
          id: string
          plan_id: string
          subject_id: string
          tier: string | null
        }
        Insert: {
          id?: string
          plan_id: string
          subject_id: string
          tier?: string | null
        }
        Update: {
          id?: string
          plan_id?: string
          subject_id?: string
          tier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_subjects_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          content_mode: Database["public"]["Enums"]["content_mode"]
          created_at: string
          day_plan: Json | null
          days_per_week: number
          id: string
          name: string
          profile_id: string
          session_length_minutes: number
          sessions_per_day: number
          start_date: string
          study_days: string[]
          weeks: number
        }
        Insert: {
          content_mode?: Database["public"]["Enums"]["content_mode"]
          created_at?: string
          day_plan?: Json | null
          days_per_week?: number
          id?: string
          name?: string
          profile_id: string
          session_length_minutes?: number
          sessions_per_day?: number
          start_date?: string
          study_days?: string[]
          weeks?: number
        }
        Update: {
          content_mode?: Database["public"]["Enums"]["content_mode"]
          created_at?: string
          day_plan?: Json | null
          days_per_week?: number
          id?: string
          name?: string
          profile_id?: string
          session_length_minutes?: number
          sessions_per_day?: number
          start_date?: string
          study_days?: string[]
          weeks?: number
        }
        Relationships: [
          {
            foreignKeyName: "plans_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
        }
        Relationships: []
      }
      revision_sites: {
        Row: {
          description: string
          id: string
          site_name: string
          site_url: string
          subject_name: string | null
        }
        Insert: {
          description: string
          id?: string
          site_name: string
          site_url: string
          subject_name?: string | null
        }
        Update: {
          description?: string
          id?: string
          site_name?: string
          site_url?: string
          subject_name?: string | null
        }
        Relationships: []
      }
      sessions: {
        Row: {
          confidence: number | null
          confidence_before: number | null
          day_label: string
          gap_notes: string
          id: string
          length_minutes: number | null
          plan_id: string
          session_slot: number
          subject_id: string | null
          topic_text: string
          updated_at: string
          week_number: number
        }
        Insert: {
          confidence?: number | null
          confidence_before?: number | null
          day_label: string
          gap_notes?: string
          id?: string
          length_minutes?: number | null
          plan_id: string
          session_slot?: number
          subject_id?: string | null
          topic_text?: string
          updated_at?: string
          week_number: number
        }
        Update: {
          confidence?: number | null
          confidence_before?: number | null
          day_label?: string
          gap_notes?: string
          id?: string
          length_minutes?: number | null
          plan_id?: string
          session_slot?: number
          subject_id?: string | null
          topic_text?: string
          updated_at?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "sessions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          color_key: string
          created_at: string
          created_by: string | null
          exam_board: string
          id: string
          is_custom: boolean
          name: string
        }
        Insert: {
          color_key?: string
          created_at?: string
          created_by?: string | null
          exam_board: string
          id?: string
          is_custom?: boolean
          name: string
        }
        Update: {
          color_key?: string
          created_at?: string
          created_by?: string | null
          exam_board?: string
          id?: string
          is_custom?: boolean
          name?: string
        }
        Relationships: []
      }
      topic_library: {
        Row: {
          id: string
          position: number
          subject_id: string
          topic: string
        }
        Insert: {
          id?: string
          position: number
          subject_id: string
          topic: string
        }
        Update: {
          id?: string
          position?: number
          subject_id?: string
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "topic_library_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "admin"
      content_mode: "ai" | "manual" | "library"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "admin"],
      content_mode: ["ai", "manual", "library"],
    },
  },
} as const
