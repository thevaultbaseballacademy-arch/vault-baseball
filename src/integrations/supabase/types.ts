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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "coach" | "athlete"
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
    },
  },
} as const
