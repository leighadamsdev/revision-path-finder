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
      exam_topics: {
        Row: {
          exam_id: string
          id: string
          plan_topic_id: string
        }
        Insert: {
          exam_id: string
          id?: string
          plan_topic_id: string
        }
        Update: {
          exam_id?: string
          id?: string
          plan_topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_topics_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_topics_plan_topic_id_fkey"
            columns: ["plan_topic_id"]
            isOneToOne: false
            referencedRelation: "plan_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          all_topics: boolean
          created_at: string
          exam_date: string
          id: string
          kind: string
          label: string
          official_exam_id: string | null
          paper_no: number
          plan_id: string
          subject_id: string
          verified: boolean
        }
        Insert: {
          all_topics?: boolean
          created_at?: string
          exam_date: string
          id?: string
          kind?: string
          label?: string
          official_exam_id?: string | null
          paper_no?: number
          plan_id: string
          subject_id: string
          verified?: boolean
        }
        Update: {
          all_topics?: boolean
          created_at?: string
          exam_date?: string
          id?: string
          kind?: string
          label?: string
          official_exam_id?: string | null
          paper_no?: number
          plan_id?: string
          subject_id?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "exams_official_exam_id_fkey"
            columns: ["official_exam_id"]
            isOneToOne: false
            referencedRelation: "official_exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcard_reviews: {
        Row: {
          correct: boolean
          flashcard_id: string
          from_box: string
          id: string
          reviewed_at: string
          session_id: string | null
          to_box: string
        }
        Insert: {
          correct: boolean
          flashcard_id: string
          from_box: string
          id?: string
          reviewed_at?: string
          session_id?: string | null
          to_box: string
        }
        Update: {
          correct?: boolean
          flashcard_id?: string
          from_box?: string
          id?: string
          reviewed_at?: string
          session_id?: string | null
          to_box?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_reviews_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcard_reviews_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcards: {
        Row: {
          box: string
          created_at: string
          due_on: string
          id: string
          last_reviewed_at: string | null
          plan_id: string
          plan_topic_id: string | null
          prompt: string
          refreshed_for_exam_id: string | null
          subject_id: string
          subtopic_id: string | null
        }
        Insert: {
          box?: string
          created_at?: string
          due_on?: string
          id?: string
          last_reviewed_at?: string | null
          plan_id: string
          plan_topic_id?: string | null
          prompt: string
          refreshed_for_exam_id?: string | null
          subject_id: string
          subtopic_id?: string | null
        }
        Update: {
          box?: string
          created_at?: string
          due_on?: string
          id?: string
          last_reviewed_at?: string | null
          plan_id?: string
          plan_topic_id?: string | null
          prompt?: string
          refreshed_for_exam_id?: string | null
          subject_id?: string
          subtopic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcards_plan_topic_id_fkey"
            columns: ["plan_topic_id"]
            isOneToOne: false
            referencedRelation: "plan_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcards_refreshed_for_exam_id_fkey"
            columns: ["refreshed_for_exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcards_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcards_subtopic_id_fkey"
            columns: ["subtopic_id"]
            isOneToOne: false
            referencedRelation: "plan_subtopics"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_checkers: {
        Row: {
          created_at: string
          id: string
          rows: Json
          subject: string
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          rows?: Json
          subject?: string
          topic?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          rows?: Json
          subject?: string
          topic?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      library_items: {
        Row: {
          created_at: string
          id: string
          position: number
          title: string
          topic_id: string
          uncertain: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          title: string
          topic_id: string
          uncertain?: boolean
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          title?: string
          topic_id?: string
          uncertain?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_items_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "library_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      library_subjects: {
        Row: {
          created_at: string
          exam_board: string | null
          id: string
          name: string
          position: number
          qualification_level: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exam_board?: string | null
          id?: string
          name: string
          position?: number
          qualification_level?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          exam_board?: string | null
          id?: string
          name?: string
          position?: number
          qualification_level?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      library_topics: {
        Row: {
          created_at: string
          id: string
          position: number
          source_path: string | null
          source_type: Database["public"]["Enums"]["library_source"]
          subject_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          source_path?: string | null
          source_type?: Database["public"]["Enums"]["library_source"]
          subject_id: string
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          source_path?: string | null
          source_type?: Database["public"]["Enums"]["library_source"]
          subject_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_topics_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "library_subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      mastery_snapshots: {
        Row: {
          id: string
          plan_id: string
          score: number
          subject_id: string
          week_start: string
        }
        Insert: {
          id?: string
          plan_id: string
          score: number
          subject_id: string
          week_start: string
        }
        Update: {
          id?: string
          plan_id?: string
          score?: number
          subject_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "mastery_snapshots_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mastery_snapshots_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      official_exams: {
        Row: {
          created_at: string
          exam_board: string
          exam_date: string
          id: string
          paper: string
          series: string
          subject_id: string
          tier: string | null
        }
        Insert: {
          created_at?: string
          exam_board?: string
          exam_date: string
          id?: string
          paper: string
          series?: string
          subject_id: string
          tier?: string | null
        }
        Update: {
          created_at?: string
          exam_board?: string
          exam_date?: string
          id?: string
          paper?: string
          series?: string
          subject_id?: string
          tier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "official_exams_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      pace_prompts: {
        Row: {
          created_at: string
          id: string
          plan_id: string
          status: string
          subject_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan_id: string
          status?: string
          subject_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          plan_id?: string
          status?: string
          subject_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "pace_prompts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pace_prompts_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
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
          confidence: number | null
          exam_date: string | null
          exam_date_2: string | null
          exam_date_3: string | null
          id: string
          plan_id: string
          subject_id: string
          tier: string | null
        }
        Insert: {
          confidence?: number | null
          exam_date?: string | null
          exam_date_2?: string | null
          exam_date_3?: string | null
          id?: string
          plan_id: string
          subject_id: string
          tier?: string | null
        }
        Update: {
          confidence?: number | null
          exam_date?: string | null
          exam_date_2?: string | null
          exam_date_3?: string | null
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
      plan_subtopics: {
        Row: {
          confidence: number | null
          created_at: string
          id: string
          library_item_id: string | null
          name: string
          plan_topic_id: string
          position: number
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          id?: string
          library_item_id?: string | null
          name: string
          plan_topic_id: string
          position?: number
        }
        Update: {
          confidence?: number | null
          created_at?: string
          id?: string
          library_item_id?: string | null
          name?: string
          plan_topic_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "plan_subtopics_library_item_id_fkey"
            columns: ["library_item_id"]
            isOneToOne: false
            referencedRelation: "library_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_subtopics_plan_topic_id_fkey"
            columns: ["plan_topic_id"]
            isOneToOne: false
            referencedRelation: "plan_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_topics: {
        Row: {
          confidence: number | null
          created_at: string
          id: string
          is_priority: boolean
          library_topic_id: string | null
          plan_id: string
          position: number
          subject_id: string
          topic: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          id?: string
          is_priority?: boolean
          library_topic_id?: string | null
          plan_id: string
          position?: number
          subject_id: string
          topic: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          id?: string
          is_priority?: boolean
          library_topic_id?: string | null
          plan_id?: string
          position?: number
          subject_id?: string
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_topics_library_topic_id_fkey"
            columns: ["library_topic_id"]
            isOneToOne: false
            referencedRelation: "library_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_topics_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_topics_subject_id_fkey"
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
          holiday_boost: boolean
          holiday_periods: Json
          id: string
          intensity_sessions_per_day: number | null
          intensity_weeks: number | null
          name: string
          pre_exam_boost: boolean
          pre_exam_weeks: number
          profile_id: string
          session_length_minutes: number
          sessions_per_day: number
          share_token: string | null
          start_date: string
          study_days: string[]
          weekly_minutes_budget: number | null
          weeks: number
        }
        Insert: {
          content_mode?: Database["public"]["Enums"]["content_mode"]
          created_at?: string
          day_plan?: Json | null
          days_per_week?: number
          holiday_boost?: boolean
          holiday_periods?: Json
          id?: string
          intensity_sessions_per_day?: number | null
          intensity_weeks?: number | null
          name?: string
          pre_exam_boost?: boolean
          pre_exam_weeks?: number
          profile_id: string
          session_length_minutes?: number
          sessions_per_day?: number
          share_token?: string | null
          start_date?: string
          study_days?: string[]
          weekly_minutes_budget?: number | null
          weeks?: number
        }
        Update: {
          content_mode?: Database["public"]["Enums"]["content_mode"]
          created_at?: string
          day_plan?: Json | null
          days_per_week?: number
          holiday_boost?: boolean
          holiday_periods?: Json
          id?: string
          intensity_sessions_per_day?: number | null
          intensity_weeks?: number | null
          name?: string
          pre_exam_boost?: boolean
          pre_exam_weeks?: number
          profile_id?: string
          session_length_minutes?: number
          sessions_per_day?: number
          share_token?: string | null
          start_date?: string
          study_days?: string[]
          weekly_minutes_budget?: number | null
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
          digest_opt_in: boolean
          display_name: string | null
          id: string
          onboarding_completed_at: string | null
          parent_email: string | null
          school_id: string | null
        }
        Insert: {
          created_at?: string
          digest_opt_in?: boolean
          display_name?: string | null
          id: string
          onboarding_completed_at?: string | null
          parent_email?: string | null
          school_id?: string | null
        }
        Update: {
          created_at?: string
          digest_opt_in?: boolean
          display_name?: string | null
          id?: string
          onboarding_completed_at?: string | null
          parent_email?: string | null
          school_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
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
      schools: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          completed_at: string | null
          confidence: number | null
          confidence_before: number | null
          day_label: string
          gap_notes: string
          id: string
          kind: string
          length_minutes: number | null
          pinned: boolean
          plan_id: string
          session_slot: number
          subject_id: string | null
          topic_text: string
          updated_at: string
          week_number: number
        }
        Insert: {
          completed_at?: string | null
          confidence?: number | null
          confidence_before?: number | null
          day_label: string
          gap_notes?: string
          id?: string
          kind?: string
          length_minutes?: number | null
          pinned?: boolean
          plan_id: string
          session_slot?: number
          subject_id?: string | null
          topic_text?: string
          updated_at?: string
          week_number: number
        }
        Update: {
          completed_at?: string | null
          confidence?: number | null
          confidence_before?: number | null
          day_label?: string
          gap_notes?: string
          id?: string
          kind?: string
          length_minutes?: number | null
          pinned?: boolean
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
      library_source: "image" | "pdf" | "manual"
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
      library_source: ["image", "pdf", "manual"],
    },
  },
} as const
