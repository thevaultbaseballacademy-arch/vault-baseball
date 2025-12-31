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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      athlete_checkins: {
        Row: {
          checkin_date: string
          created_at: string
          energy_level: number | null
          id: string
          mood: number | null
          notes: string | null
          sleep_hours: number | null
          sleep_quality: number | null
          soreness_level: number | null
          stress_level: number | null
          training_completed: boolean | null
          training_duration_minutes: number | null
          training_intensity: number | null
          training_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          checkin_date?: string
          created_at?: string
          energy_level?: number | null
          id?: string
          mood?: number | null
          notes?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          soreness_level?: number | null
          stress_level?: number | null
          training_completed?: boolean | null
          training_duration_minutes?: number | null
          training_intensity?: number | null
          training_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          checkin_date?: string
          created_at?: string
          energy_level?: number | null
          id?: string
          mood?: number | null
          notes?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          soreness_level?: number | null
          stress_level?: number | null
          training_completed?: boolean | null
          training_duration_minutes?: number | null
          training_intensity?: number | null
          training_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      athletic_stats: {
        Row: {
          created_at: string
          id: string
          privacy_level: string
          season: string | null
          stat_name: string
          stat_type: string
          stat_value: string
          updated_at: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string
          id?: string
          privacy_level?: string
          season?: string | null
          stat_name: string
          stat_type: string
          stat_value: string
          updated_at?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string
          id?: string
          privacy_level?: string
          season?: string | null
          stat_name?: string
          stat_type?: string
          stat_value?: string
          updated_at?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          operation: string
          record_id: string
          table_name: string
          user_agent: string | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          record_id: string
          table_name: string
          user_agent?: string | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          record_id?: string
          table_name?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      certification_attempts: {
        Row: {
          answers: Json
          certification_type: Database["public"]["Enums"]["certification_type"]
          completed_at: string | null
          created_at: string
          id: string
          passed: boolean | null
          question_ids: string[]
          score: number | null
          started_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          certification_type: Database["public"]["Enums"]["certification_type"]
          completed_at?: string | null
          created_at?: string
          id?: string
          passed?: boolean | null
          question_ids?: string[]
          score?: number | null
          started_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          certification_type?: Database["public"]["Enums"]["certification_type"]
          completed_at?: string | null
          created_at?: string
          id?: string
          passed?: boolean | null
          question_ids?: string[]
          score?: number | null
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      certification_definitions: {
        Row: {
          certification_type: Database["public"]["Enums"]["certification_type"]
          created_at: string
          description: string | null
          id: string
          is_required: boolean
          name: string
          passing_score: number
          prerequisites:
            | Database["public"]["Enums"]["certification_type"][]
            | null
          price_cents: number
          question_count: number
          updated_at: string
          validity_months: number
        }
        Insert: {
          certification_type: Database["public"]["Enums"]["certification_type"]
          created_at?: string
          description?: string | null
          id?: string
          is_required?: boolean
          name: string
          passing_score?: number
          prerequisites?:
            | Database["public"]["Enums"]["certification_type"][]
            | null
          price_cents?: number
          question_count?: number
          updated_at?: string
          validity_months?: number
        }
        Update: {
          certification_type?: Database["public"]["Enums"]["certification_type"]
          created_at?: string
          description?: string | null
          id?: string
          is_required?: boolean
          name?: string
          passing_score?: number
          prerequisites?:
            | Database["public"]["Enums"]["certification_type"][]
            | null
          price_cents?: number
          question_count?: number
          updated_at?: string
          validity_months?: number
        }
        Relationships: []
      }
      certification_questions: {
        Row: {
          certification_type: Database["public"]["Enums"]["certification_type"]
          correct_answer_index: number
          created_at: string
          display_order: number
          explanation: string | null
          id: string
          is_active: boolean
          is_scenario: boolean | null
          options: Json
          question_text: string
          section: string
          updated_at: string
        }
        Insert: {
          certification_type: Database["public"]["Enums"]["certification_type"]
          correct_answer_index: number
          created_at?: string
          display_order?: number
          explanation?: string | null
          id?: string
          is_active?: boolean
          is_scenario?: boolean | null
          options?: Json
          question_text: string
          section: string
          updated_at?: string
        }
        Update: {
          certification_type?: Database["public"]["Enums"]["certification_type"]
          correct_answer_index?: number
          created_at?: string
          display_order?: number
          explanation?: string | null
          id?: string
          is_active?: boolean
          is_scenario?: boolean | null
          options?: Json
          question_text?: string
          section?: string
          updated_at?: string
        }
        Relationships: []
      }
      coach_alerts: {
        Row: {
          alert_type: string
          athlete_user_id: string
          coach_user_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
        }
        Insert: {
          alert_type: string
          athlete_user_id: string
          coach_user_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
        }
        Update: {
          alert_type?: string
          athlete_user_id?: string
          coach_user_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
        }
        Relationships: []
      }
      coach_athlete_assignments: {
        Row: {
          athlete_user_id: string
          coach_user_id: string
          created_at: string
          id: string
        }
        Insert: {
          athlete_user_id: string
          coach_user_id: string
          created_at?: string
          id?: string
        }
        Update: {
          athlete_user_id?: string
          coach_user_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      coaching_sessions: {
        Row: {
          coach_name: string
          created_at: string
          duration_minutes: number
          id: string
          notes: string | null
          session_date: string
          session_time: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          coach_name?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          session_date: string
          session_time: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          coach_name?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          session_date?: string
          session_time?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          media_url: string | null
          post_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          media_url?: string | null
          post_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          media_url?: string | null
          post_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string
          id: string
          last_accessed_at: string | null
          progress_percent: number
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string
          id?: string
          last_accessed_at?: string | null
          progress_percent?: number
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string
          id?: string
          last_accessed_at?: string | null
          progress_percent?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      course_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          lesson_index: number
          module_index: number
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          lesson_index: number
          module_index: number
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          lesson_index?: number
          module_index?: number
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      course_videos: {
        Row: {
          course_id: string
          created_at: string
          created_by: string | null
          id: string
          is_preview: boolean
          lesson_id: string
          module_id: string
          updated_at: string
          video_platform: string | null
          video_url: string
        }
        Insert: {
          course_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_preview?: boolean
          lesson_id: string
          module_id: string
          updated_at?: string
          video_platform?: string | null
          video_url: string
        }
        Update: {
          course_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_preview?: boolean
          lesson_id?: string
          module_id?: string
          updated_at?: string
          video_platform?: string | null
          video_url?: string
        }
        Relationships: []
      }
      custom_training_schedules: {
        Row: {
          coach_user_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          position: string | null
          schedule_data: Json
          training_phase: string | null
          updated_at: string
        }
        Insert: {
          coach_user_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          position?: string | null
          schedule_data?: Json
          training_phase?: string | null
          updated_at?: string
        }
        Update: {
          coach_user_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          position?: string | null
          schedule_data?: Json
          training_phase?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      highlight_videos: {
        Row: {
          created_at: string
          description: string | null
          duration_seconds: number | null
          id: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
          video_url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
          video_url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          video_url?: string
        }
        Relationships: []
      }
      notification_analytics: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          notification_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          notification_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          notification_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_analytics_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          coach_messages: boolean
          community_comments: boolean
          community_likes: boolean
          community_mentions: boolean
          course_updates: boolean
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          coach_messages?: boolean
          community_comments?: boolean
          community_likes?: boolean
          community_mentions?: boolean
          course_updates?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          coach_messages?: boolean
          community_comments?: boolean
          community_likes?: boolean
          community_mentions?: boolean
          course_updates?: boolean
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          post_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          actor_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          post_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          post_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          batting_side: string | null
          bio: string | null
          cover_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          graduation_year: number | null
          height_inches: number | null
          hudl_url: string | null
          id: string
          instagram_url: string | null
          position: string | null
          sixty_yard_dash: number | null
          target_schools: string[] | null
          throwing_arm: string | null
          twitter_url: string | null
          updated_at: string
          user_id: string
          weight_lbs: number | null
          youtube_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          batting_side?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          graduation_year?: number | null
          height_inches?: number | null
          hudl_url?: string | null
          id?: string
          instagram_url?: string | null
          position?: string | null
          sixty_yard_dash?: number | null
          target_schools?: string[] | null
          throwing_arm?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id: string
          weight_lbs?: number | null
          youtube_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          batting_side?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          graduation_year?: number | null
          height_inches?: number | null
          hudl_url?: string | null
          id?: string
          instagram_url?: string | null
          position?: string | null
          sixty_yard_dash?: number | null
          target_schools?: string[] | null
          throwing_arm?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string
          weight_lbs?: number | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string
          id: string
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      schedule_assignments: {
        Row: {
          assigned_by: string
          athlete_user_id: string
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean
          schedule_id: string
          start_date: string | null
          updated_at: string
        }
        Insert: {
          assigned_by: string
          athlete_user_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          schedule_id: string
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          assigned_by?: string
          athlete_user_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          schedule_id?: string
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_assignments_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "custom_training_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_broadcasts: {
        Row: {
          created_at: string
          created_by: string
          id: string
          message: string
          notified_count: number | null
          scheduled_at: string
          sent_at: string | null
          status: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          message: string
          notified_count?: number | null
          scheduled_at: string
          sent_at?: string | null
          status?: string
          title: string
          type: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          message?: string
          notified_count?: number | null
          scheduled_at?: string
          sent_at?: string | null
          status?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      user_certifications: {
        Row: {
          attempt_id: string | null
          certificate_number: string | null
          certification_type: Database["public"]["Enums"]["certification_type"]
          created_at: string
          expiration_reminder_sent: boolean | null
          expiration_reminder_sent_at: string | null
          expires_at: string
          final_warning_sent: boolean | null
          final_warning_sent_at: string | null
          id: string
          issued_at: string
          score: number
          status: Database["public"]["Enums"]["certification_status"]
          stripe_payment_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          attempt_id?: string | null
          certificate_number?: string | null
          certification_type: Database["public"]["Enums"]["certification_type"]
          created_at?: string
          expiration_reminder_sent?: boolean | null
          expiration_reminder_sent_at?: string | null
          expires_at: string
          final_warning_sent?: boolean | null
          final_warning_sent_at?: string | null
          id?: string
          issued_at?: string
          score: number
          status?: Database["public"]["Enums"]["certification_status"]
          stripe_payment_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          attempt_id?: string | null
          certificate_number?: string | null
          certification_type?: Database["public"]["Enums"]["certification_type"]
          created_at?: string
          expiration_reminder_sent?: boolean | null
          expiration_reminder_sent_at?: string | null
          expires_at?: string
          final_warning_sent?: boolean | null
          final_warning_sent_at?: string | null
          id?: string
          issued_at?: string
          score?: number
          status?: Database["public"]["Enums"]["certification_status"]
          stripe_payment_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          role: Database["public"]["Enums"]["app_role"]
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
      check_exam_answer: {
        Args: { question_id: string; selected_answer: number }
        Returns: boolean
      }
      generate_certificate_number: { Args: never; Returns: string }
      get_assigned_athlete_profiles: {
        Args: { coach_id: string }
        Returns: {
          avatar_url: string
          batting_side: string
          bio: string
          cover_url: string
          created_at: string
          display_name: string
          graduation_year: number
          height_inches: number
          hudl_url: string
          instagram_url: string
          player_position: string
          sixty_yard_dash: number
          target_schools: string[]
          throwing_arm: string
          twitter_url: string
          updated_at: string
          user_id: string
          weight_lbs: number
          youtube_url: string
        }[]
      }
      get_athlete_profile_for_coach: {
        Args: { athlete_id: string; coach_id: string }
        Returns: {
          avatar_url: string
          batting_side: string
          bio: string
          cover_url: string
          created_at: string
          display_name: string
          graduation_year: number
          height_inches: number
          hudl_url: string
          instagram_url: string
          player_position: string
          sixty_yard_dash: number
          target_schools: string[]
          throwing_arm: string
          twitter_url: string
          updated_at: string
          user_id: string
          weight_lbs: number
          youtube_url: string
        }[]
      }
      get_exam_questions: {
        Args: {
          cert_type: Database["public"]["Enums"]["certification_type"]
          question_limit?: number
        }
        Returns: {
          display_order: number
          id: string
          is_scenario: boolean
          options: Json
          question_text: string
          section: string
        }[]
      }
      get_public_profile: {
        Args: { target_user_id: string }
        Returns: {
          avatar_url: string
          display_name: string
          graduation_year: number
          player_position: string
          user_id: string
        }[]
      }
      get_public_profiles_by_ids: {
        Args: { user_ids: string[] }
        Returns: {
          avatar_url: string
          display_name: string
          graduation_year: number
          player_position: string
          user_id: string
        }[]
      }
      get_question_explanation: {
        Args: { question_id: string }
        Returns: {
          correct_answer_index: number
          explanation: string
          is_correct: boolean
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_valid_certification: {
        Args: {
          _cert_type: Database["public"]["Enums"]["certification_type"]
          _user_id: string
        }
        Returns: boolean
      }
      search_public_profiles: {
        Args: { result_limit?: number; search_term: string }
        Returns: {
          avatar_url: string
          display_name: string
          graduation_year: number
          player_position: string
          user_id: string
        }[]
      }
      verify_certificate_public: {
        Args: { cert_number: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "coach" | "athlete"
      certification_status: "active" | "expired" | "revoked"
      certification_type:
        | "foundations"
        | "performance"
        | "catcher_specialist"
        | "infield_specialist"
        | "outfield_specialist"
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
    Enums: {
      app_role: ["admin", "coach", "athlete"],
      certification_status: ["active", "expired", "revoked"],
      certification_type: [
        "foundations",
        "performance",
        "catcher_specialist",
        "infield_specialist",
        "outfield_specialist",
      ],
    },
  },
} as const
