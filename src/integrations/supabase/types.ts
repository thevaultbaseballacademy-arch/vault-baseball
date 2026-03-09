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
      activity_feed: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          title: string
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          title: string
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      admin_certifications: {
        Row: {
          cert_type: Database["public"]["Enums"]["admin_cert_type"]
          coach_id: string
          created_at: string
          expiration_date: string | null
          id: string
          issued_date: string | null
          last_score: number | null
          org_id: string
          status: Database["public"]["Enums"]["admin_cert_status"]
          updated_at: string
        }
        Insert: {
          cert_type: Database["public"]["Enums"]["admin_cert_type"]
          coach_id: string
          created_at?: string
          expiration_date?: string | null
          id?: string
          issued_date?: string | null
          last_score?: number | null
          org_id: string
          status?: Database["public"]["Enums"]["admin_cert_status"]
          updated_at?: string
        }
        Update: {
          cert_type?: Database["public"]["Enums"]["admin_cert_type"]
          coach_id?: string
          created_at?: string
          expiration_date?: string | null
          id?: string
          issued_date?: string | null
          last_score?: number | null
          org_id?: string
          status?: Database["public"]["Enums"]["admin_cert_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_certifications_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_exam_attempts: {
        Row: {
          cert_type: Database["public"]["Enums"]["admin_cert_type"]
          coach_id: string
          created_at: string
          duration_seconds: number | null
          id: string
          org_id: string
          pass_fail: boolean
          score: number
        }
        Insert: {
          cert_type: Database["public"]["Enums"]["admin_cert_type"]
          coach_id: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          org_id: string
          pass_fail: boolean
          score: number
        }
        Update: {
          cert_type?: Database["public"]["Enums"]["admin_cert_type"]
          coach_id?: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          org_id?: string
          pass_fail?: boolean
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "admin_exam_attempts_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_22m_invite_tokens: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          label: string | null
          max_uses: number | null
          token: string
          used_count: number | null
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          max_uses?: number | null
          token?: string
          used_count?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          max_uses?: number | null
          token?: string
          used_count?: number | null
        }
        Relationships: []
      }
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
      athlete_kpi_goals: {
        Row: {
          achieved_at: string | null
          created_at: string
          id: string
          is_achieved: boolean | null
          kpi_category: string
          kpi_name: string
          kpi_unit: string | null
          notes: string | null
          target_date: string | null
          target_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          achieved_at?: string | null
          created_at?: string
          id?: string
          is_achieved?: boolean | null
          kpi_category: string
          kpi_name: string
          kpi_unit?: string | null
          notes?: string | null
          target_date?: string | null
          target_value: number
          updated_at?: string
          user_id: string
        }
        Update: {
          achieved_at?: string | null
          created_at?: string
          id?: string
          is_achieved?: boolean | null
          kpi_category?: string
          kpi_name?: string
          kpi_unit?: string | null
          notes?: string | null
          target_date?: string | null
          target_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      athlete_kpis: {
        Row: {
          created_at: string
          id: string
          kpi_category: string
          kpi_name: string
          kpi_unit: string | null
          kpi_value: number
          notes: string | null
          recorded_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kpi_category: string
          kpi_name: string
          kpi_unit?: string | null
          kpi_value: number
          notes?: string | null
          recorded_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kpi_category?: string
          kpi_name?: string
          kpi_unit?: string | null
          kpi_value?: number
          notes?: string | null
          recorded_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      athlete_onboarding: {
        Row: {
          age: number | null
          athlete_goals: string | null
          athlete_name: string | null
          biggest_struggle: string | null
          created_at: string
          current_level: string | null
          current_velocity: string | null
          email: string
          exit_velo: string | null
          id: string
          parent_name: string | null
          position: string | null
          product_purchased: string | null
          sixty_time: string | null
          social_handle: string | null
          training_history: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          age?: number | null
          athlete_goals?: string | null
          athlete_name?: string | null
          biggest_struggle?: string | null
          created_at?: string
          current_level?: string | null
          current_velocity?: string | null
          email: string
          exit_velo?: string | null
          id?: string
          parent_name?: string | null
          position?: string | null
          product_purchased?: string | null
          sixty_time?: string | null
          social_handle?: string | null
          training_history?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          age?: number | null
          athlete_goals?: string | null
          athlete_name?: string | null
          biggest_struggle?: string | null
          created_at?: string
          current_level?: string | null
          current_velocity?: string | null
          email?: string
          exit_velo?: string | null
          id?: string
          parent_name?: string | null
          position?: string | null
          product_purchased?: string | null
          sixty_time?: string | null
          social_handle?: string | null
          training_history?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      athlete_trials: {
        Row: {
          converted_at: string | null
          converted_product: string | null
          created_at: string
          extended_at: string | null
          extended_by: string | null
          id: string
          invite_token_id: string | null
          notes: string | null
          trial_active: boolean | null
          trial_end_date: string
          trial_start_date: string
          trial_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          converted_at?: string | null
          converted_product?: string | null
          created_at?: string
          extended_at?: string | null
          extended_by?: string | null
          id?: string
          invite_token_id?: string | null
          notes?: string | null
          trial_active?: boolean | null
          trial_end_date?: string
          trial_start_date?: string
          trial_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          converted_at?: string | null
          converted_product?: string | null
          created_at?: string
          extended_at?: string | null
          extended_by?: string | null
          id?: string
          invite_token_id?: string | null
          notes?: string | null
          trial_active?: boolean | null
          trial_end_date?: string
          trial_start_date?: string
          trial_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "athlete_trials_invite_token_id_fkey"
            columns: ["invite_token_id"]
            isOneToOne: false
            referencedRelation: "athlete_22m_invite_tokens"
            referencedColumns: ["id"]
          },
        ]
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
          approval_requested_at: string | null
          approved_at: string | null
          athlete_approved: boolean | null
          athlete_user_id: string
          coach_user_id: string
          created_at: string
          id: string
          is_active: boolean
        }
        Insert: {
          approval_requested_at?: string | null
          approved_at?: string | null
          athlete_approved?: boolean | null
          athlete_user_id: string
          coach_user_id: string
          created_at?: string
          id?: string
          is_active?: boolean
        }
        Update: {
          approval_requested_at?: string | null
          approved_at?: string | null
          athlete_approved?: boolean | null
          athlete_user_id?: string
          coach_user_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
        }
        Relationships: []
      }
      coach_availability: {
        Row: {
          coach_user_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean
          start_time: string
        }
        Insert: {
          coach_user_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean
          start_time: string
        }
        Update: {
          coach_user_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean
          start_time?: string
        }
        Relationships: []
      }
      coach_invite_tokens: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          label: string | null
          max_uses: number | null
          token: string
          used_count: number | null
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          max_uses?: number | null
          token?: string
          used_count?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string | null
          max_uses?: number | null
          token?: string
          used_count?: number | null
        }
        Relationships: []
      }
      coach_kpi_comments: {
        Row: {
          athlete_user_id: string
          coach_user_id: string
          comment: string
          created_at: string
          id: string
          kpi_category: string
          kpi_name: string
          updated_at: string
        }
        Insert: {
          athlete_user_id: string
          coach_user_id: string
          comment: string
          created_at?: string
          id?: string
          kpi_category: string
          kpi_name: string
          updated_at?: string
        }
        Update: {
          athlete_user_id?: string
          coach_user_id?: string
          comment?: string
          created_at?: string
          id?: string
          kpi_category?: string
          kpi_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      coach_marketplace_profiles: {
        Row: {
          avg_rating: number | null
          bio: string | null
          coach_id: string
          coaching_background: string | null
          created_at: string | null
          hourly_rate_cents: number | null
          id: string
          is_marketplace_active: boolean | null
          location: string | null
          photo_url: string | null
          playing_background: string | null
          specialties: string[] | null
          tagline: string | null
          total_reviews: number | null
          total_sessions: number | null
          updated_at: string | null
          user_id: string
          years_experience: number | null
        }
        Insert: {
          avg_rating?: number | null
          bio?: string | null
          coach_id: string
          coaching_background?: string | null
          created_at?: string | null
          hourly_rate_cents?: number | null
          id?: string
          is_marketplace_active?: boolean | null
          location?: string | null
          photo_url?: string | null
          playing_background?: string | null
          specialties?: string[] | null
          tagline?: string | null
          total_reviews?: number | null
          total_sessions?: number | null
          updated_at?: string | null
          user_id: string
          years_experience?: number | null
        }
        Update: {
          avg_rating?: number | null
          bio?: string | null
          coach_id?: string
          coaching_background?: string | null
          created_at?: string | null
          hourly_rate_cents?: number | null
          id?: string
          is_marketplace_active?: boolean | null
          location?: string | null
          photo_url?: string | null
          playing_background?: string | null
          specialties?: string[] | null
          tagline?: string | null
          total_reviews?: number | null
          total_sessions?: number | null
          updated_at?: string | null
          user_id?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_marketplace_profiles_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: true
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_onboarding: {
        Row: {
          completed_at: string | null
          connected_athletes: boolean | null
          created_at: string
          created_schedule: boolean | null
          id: string
          reviewed_dashboard: boolean | null
          setup_profile: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          connected_athletes?: boolean | null
          created_at?: string
          created_schedule?: boolean | null
          id?: string
          reviewed_dashboard?: boolean | null
          setup_profile?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          connected_athletes?: boolean | null
          created_at?: string
          created_schedule?: boolean | null
          id?: string
          reviewed_dashboard?: boolean | null
          setup_profile?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      coach_payouts: {
        Row: {
          amount_cents: number
          coach_id: string
          created_at: string
          currency: string
          description: string | null
          id: string
          processed_at: string | null
          processed_by: string | null
          status: string
          stripe_transfer_id: string | null
          updated_at: string
        }
        Insert: {
          amount_cents: number
          coach_id: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          stripe_transfer_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          coach_id?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          stripe_transfer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_payouts_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_registration_requests: {
        Row: {
          coaching_experience: string | null
          created_at: string
          email: string
          experience_years: number | null
          full_name: string
          id: string
          invite_token_id: string | null
          location: string | null
          message: string | null
          organization: string | null
          phone: string | null
          playing_experience: string | null
          resume_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          social_media: string | null
          specialization: string | null
          specialties: string[] | null
          status: string
          updated_at: string
          user_id: string
          video_sample_url: string | null
        }
        Insert: {
          coaching_experience?: string | null
          created_at?: string
          email: string
          experience_years?: number | null
          full_name: string
          id?: string
          invite_token_id?: string | null
          location?: string | null
          message?: string | null
          organization?: string | null
          phone?: string | null
          playing_experience?: string | null
          resume_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_media?: string | null
          specialization?: string | null
          specialties?: string[] | null
          status?: string
          updated_at?: string
          user_id: string
          video_sample_url?: string | null
        }
        Update: {
          coaching_experience?: string | null
          created_at?: string
          email?: string
          experience_years?: number | null
          full_name?: string
          id?: string
          invite_token_id?: string | null
          location?: string | null
          message?: string | null
          organization?: string | null
          phone?: string | null
          playing_experience?: string | null
          resume_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_media?: string | null
          specialization?: string | null
          specialties?: string[] | null
          status?: string
          updated_at?: string
          user_id?: string
          video_sample_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_registration_requests_invite_token_id_fkey"
            columns: ["invite_token_id"]
            isOneToOne: false
            referencedRelation: "coach_invite_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_reviews: {
        Row: {
          athlete_user_id: string
          booking_id: string
          coach_id: string
          created_at: string | null
          id: string
          rating: number
          review_text: string | null
        }
        Insert: {
          athlete_user_id: string
          booking_id: string
          coach_id: string
          created_at?: string | null
          id?: string
          rating: number
          review_text?: string | null
        }
        Update: {
          athlete_user_id?: string
          booking_id?: string
          coach_id?: string
          created_at?: string | null
          id?: string
          rating?: number
          review_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "marketplace_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_reviews_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_services: {
        Row: {
          coach_id: string
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          price_cents: number
          service_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          price_cents: number
          service_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          price_cents?: number
          service_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_services_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      coaches: {
        Row: {
          approved_by_admin: string | null
          created_at: string
          email: string
          id: string
          is_bypass_certified: boolean
          is_certified: boolean
          is_marketplace_approved: boolean
          is_staff: boolean
          marketplace_status: string
          name: string
          org_id: string
          role: Database["public"]["Enums"]["coach_role"]
          status: Database["public"]["Enums"]["coach_status"]
          stripe_account_id: string | null
          team_id: string | null
          user_id: string | null
        }
        Insert: {
          approved_by_admin?: string | null
          created_at?: string
          email: string
          id?: string
          is_bypass_certified?: boolean
          is_certified?: boolean
          is_marketplace_approved?: boolean
          is_staff?: boolean
          marketplace_status?: string
          name: string
          org_id: string
          role?: Database["public"]["Enums"]["coach_role"]
          status?: Database["public"]["Enums"]["coach_status"]
          stripe_account_id?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Update: {
          approved_by_admin?: string | null
          created_at?: string
          email?: string
          id?: string
          is_bypass_certified?: boolean
          is_certified?: boolean
          is_marketplace_approved?: boolean
          is_staff?: boolean
          marketplace_status?: string
          name?: string
          org_id?: string
          role?: Database["public"]["Enums"]["coach_role"]
          status?: Database["public"]["Enums"]["coach_status"]
          stripe_account_id?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      coaching_messages: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          recipient_id: string
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id: string
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id?: string
          sender_id?: string
          updated_at?: string | null
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
          flag_reason: string | null
          flagged_at: string | null
          flagged_by: string | null
          hidden_by_admin: boolean
          id: string
          is_flagged: boolean
          media_url: string | null
          moderation_notes: string | null
          post_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          flag_reason?: string | null
          flagged_at?: string | null
          flagged_by?: string | null
          hidden_by_admin?: boolean
          id?: string
          is_flagged?: boolean
          media_url?: string | null
          moderation_notes?: string | null
          post_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          flag_reason?: string | null
          flagged_at?: string | null
          flagged_by?: string | null
          hidden_by_admin?: boolean
          id?: string
          is_flagged?: boolean
          media_url?: string | null
          moderation_notes?: string | null
          post_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      course_certificates: {
        Row: {
          certificate_number: string
          completion_date: string
          course_id: string
          course_title: string
          created_at: string
          id: string
          issued_at: string
          recipient_name: string
          user_id: string
        }
        Insert: {
          certificate_number?: string
          completion_date: string
          course_id: string
          course_title: string
          created_at?: string
          id?: string
          issued_at?: string
          recipient_name: string
          user_id: string
        }
        Update: {
          certificate_number?: string
          completion_date?: string
          course_id?: string
          course_title?: string
          created_at?: string
          id?: string
          issued_at?: string
          recipient_name?: string
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
      data_deletion_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          processed_at: string | null
          processed_by: string | null
          reason: string | null
          requested_at: string
          status: string
          updated_at: string
          user_email: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
          user_email: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      data_retention_config: {
        Row: {
          config_key: string
          config_value: Json
          description: string | null
          id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          description?: string | null
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          description?: string | null
          id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      device_integrations: {
        Row: {
          access_token: string | null
          api_key: string | null
          api_secret: string | null
          created_at: string
          device_type: Database["public"]["Enums"]["device_type"]
          id: string
          is_connected: boolean | null
          last_sync_at: string | null
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          api_key?: string | null
          api_secret?: string | null
          created_at?: string
          device_type: Database["public"]["Enums"]["device_type"]
          id?: string
          is_connected?: boolean | null
          last_sync_at?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          api_key?: string | null
          api_secret?: string | null
          created_at?: string
          device_type?: Database["public"]["Enums"]["device_type"]
          id?: string
          is_connected?: boolean | null
          last_sync_at?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      device_metrics: {
        Row: {
          attack_angle: number | null
          bat_speed_mph: number | null
          body_rotation: number | null
          connection_score: number | null
          created_at: string
          device_type: Database["public"]["Enums"]["device_type"]
          distance_ft: number | null
          exit_velocity_mph: number | null
          horizontal_break: number | null
          id: string
          import_source: string | null
          launch_angle: number | null
          measured_velocity_mph: number | null
          metric_category: string
          notes: string | null
          on_plane_efficiency: number | null
          peak_hand_speed: number | null
          pitch_type: string | null
          power_index: number | null
          raw_data: Json | null
          recorded_at: string
          release_extension: number | null
          release_height: number | null
          rotation_score: number | null
          session_id: string | null
          spin_axis: number | null
          spin_efficiency: number | null
          spin_rate_rpm: number | null
          time_to_contact: number | null
          updated_at: string
          user_id: string
          velocity_mph: number | null
          velocity_type: string | null
          vertical_break: number | null
        }
        Insert: {
          attack_angle?: number | null
          bat_speed_mph?: number | null
          body_rotation?: number | null
          connection_score?: number | null
          created_at?: string
          device_type: Database["public"]["Enums"]["device_type"]
          distance_ft?: number | null
          exit_velocity_mph?: number | null
          horizontal_break?: number | null
          id?: string
          import_source?: string | null
          launch_angle?: number | null
          measured_velocity_mph?: number | null
          metric_category: string
          notes?: string | null
          on_plane_efficiency?: number | null
          peak_hand_speed?: number | null
          pitch_type?: string | null
          power_index?: number | null
          raw_data?: Json | null
          recorded_at?: string
          release_extension?: number | null
          release_height?: number | null
          rotation_score?: number | null
          session_id?: string | null
          spin_axis?: number | null
          spin_efficiency?: number | null
          spin_rate_rpm?: number | null
          time_to_contact?: number | null
          updated_at?: string
          user_id: string
          velocity_mph?: number | null
          velocity_type?: string | null
          vertical_break?: number | null
        }
        Update: {
          attack_angle?: number | null
          bat_speed_mph?: number | null
          body_rotation?: number | null
          connection_score?: number | null
          created_at?: string
          device_type?: Database["public"]["Enums"]["device_type"]
          distance_ft?: number | null
          exit_velocity_mph?: number | null
          horizontal_break?: number | null
          id?: string
          import_source?: string | null
          launch_angle?: number | null
          measured_velocity_mph?: number | null
          metric_category?: string
          notes?: string | null
          on_plane_efficiency?: number | null
          peak_hand_speed?: number | null
          pitch_type?: string | null
          power_index?: number | null
          raw_data?: Json | null
          recorded_at?: string
          release_extension?: number | null
          release_height?: number | null
          rotation_score?: number | null
          session_id?: string | null
          spin_axis?: number | null
          spin_efficiency?: number | null
          spin_rate_rpm?: number | null
          time_to_contact?: number | null
          updated_at?: string
          user_id?: string
          velocity_mph?: number | null
          velocity_type?: string | null
          vertical_break?: number | null
        }
        Relationships: []
      }
      exam_questions: {
        Row: {
          cert_type: Database["public"]["Enums"]["admin_cert_type"]
          correct_answer: string
          created_at: string
          id: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          question_id: string
          updated_at: string
        }
        Insert: {
          cert_type: Database["public"]["Enums"]["admin_cert_type"]
          correct_answer: string
          created_at?: string
          id?: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          question_id: string
          updated_at?: string
        }
        Update: {
          cert_type?: Database["public"]["Enums"]["admin_cert_type"]
          correct_answer?: string
          created_at?: string
          id?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question?: string
          question_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      group_session_enrollments: {
        Row: {
          athlete_user_id: string
          credit_id: string | null
          enrolled_at: string
          id: string
          session_id: string
          status: string
        }
        Insert: {
          athlete_user_id: string
          credit_id?: string | null
          enrolled_at?: string
          id?: string
          session_id: string
          status?: string
        }
        Update: {
          athlete_user_id?: string
          credit_id?: string | null
          enrolled_at?: string
          id?: string
          session_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_session_enrollments_credit_id_fkey"
            columns: ["credit_id"]
            isOneToOne: false
            referencedRelation: "lesson_credits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_session_enrollments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "group_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      group_sessions: {
        Row: {
          coach_user_id: string
          created_at: string
          description: string | null
          duration_minutes: number
          focus_area: string | null
          id: string
          max_participants: number
          price_credits: number
          scheduled_at: string
          skill_level: string | null
          status: string
          title: string
          updated_at: string
          video_call_link: string | null
        }
        Insert: {
          coach_user_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          focus_area?: string | null
          id?: string
          max_participants?: number
          price_credits?: number
          scheduled_at: string
          skill_level?: string | null
          status?: string
          title: string
          updated_at?: string
          video_call_link?: string | null
        }
        Update: {
          coach_user_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          focus_area?: string | null
          id?: string
          max_participants?: number
          price_credits?: number
          scheduled_at?: string
          skill_level?: string | null
          status?: string
          title?: string
          updated_at?: string
          video_call_link?: string | null
        }
        Relationships: []
      }
      highlight_videos: {
        Row: {
          created_at: string
          description: string | null
          duration_seconds: number | null
          id: string
          privacy_level: string
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
          privacy_level?: string
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
          privacy_level?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          video_url?: string
        }
        Relationships: []
      }
      kpi_share_tokens: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          include_goals: boolean | null
          include_stats: boolean | null
          include_videos: boolean | null
          label: string | null
          token: string
          updated_at: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          include_goals?: boolean | null
          include_stats?: boolean | null
          include_videos?: boolean | null
          label?: string | null
          token: string
          updated_at?: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          include_goals?: boolean | null
          include_stats?: boolean | null
          include_videos?: boolean | null
          label?: string | null
          token?: string
          updated_at?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      lead_captures: {
        Row: {
          athlete_age: number | null
          athlete_name: string
          created_at: string
          email: string
          id: string
          lead_source: string | null
          parent_name: string | null
          primary_position: string | null
        }
        Insert: {
          athlete_age?: number | null
          athlete_name: string
          created_at?: string
          email: string
          id?: string
          lead_source?: string | null
          parent_name?: string | null
          primary_position?: string | null
        }
        Update: {
          athlete_age?: number | null
          athlete_name?: string
          created_at?: string
          email?: string
          id?: string
          lead_source?: string | null
          parent_name?: string | null
          primary_position?: string | null
        }
        Relationships: []
      }
      lesson_credits: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          package_id: string | null
          purchased_at: string
          stripe_session_id: string | null
          total_lessons: number
          used_lessons: number
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          package_id?: string | null
          purchased_at?: string
          stripe_session_id?: string | null
          total_lessons: number
          used_lessons?: number
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          package_id?: string | null
          purchased_at?: string
          stripe_session_id?: string | null
          total_lessons?: number
          used_lessons?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_credits_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "lesson_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_packages: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          lesson_count: number
          name: string
          package_type: string
          price_cents: number
          stripe_price_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          lesson_count: number
          name: string
          package_type?: string
          price_cents: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          lesson_count?: number
          name?: string
          package_type?: string
          price_cents?: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      marketplace_bookings: {
        Row: {
          amount_cents: number
          athlete_notes: string | null
          athlete_user_id: string
          coach_id: string
          coach_notes: string | null
          coach_payout_cents: number
          created_at: string | null
          id: string
          notes: string | null
          platform_fee_cents: number
          recording_url: string | null
          scheduled_at: string | null
          service_id: string
          status: string | null
          updated_at: string | null
          video_call_link: string | null
        }
        Insert: {
          amount_cents: number
          athlete_notes?: string | null
          athlete_user_id: string
          coach_id: string
          coach_notes?: string | null
          coach_payout_cents: number
          created_at?: string | null
          id?: string
          notes?: string | null
          platform_fee_cents: number
          recording_url?: string | null
          scheduled_at?: string | null
          service_id: string
          status?: string | null
          updated_at?: string | null
          video_call_link?: string | null
        }
        Update: {
          amount_cents?: number
          athlete_notes?: string | null
          athlete_user_id?: string
          coach_id?: string
          coach_notes?: string | null
          coach_payout_cents?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          platform_fee_cents?: number
          recording_url?: string | null
          scheduled_at?: string | null
          service_id?: string
          status?: string | null
          updated_at?: string | null
          video_call_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_bookings_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "coach_services"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_earnings: {
        Row: {
          booking_id: string
          coach_amount_cents: number
          coach_id: string
          created_at: string | null
          id: string
          platform_fee_cents: number
          status: string | null
          total_amount_cents: number
        }
        Insert: {
          booking_id: string
          coach_amount_cents: number
          coach_id: string
          created_at?: string | null
          id?: string
          platform_fee_cents: number
          status?: string | null
          total_amount_cents: number
        }
        Update: {
          booking_id?: string
          coach_amount_cents?: number
          coach_id?: string
          created_at?: string | null
          id?: string
          platform_fee_cents?: number
          status?: string | null
          total_amount_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_earnings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "marketplace_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_earnings_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      metric_share_tokens: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          include_hitting: boolean | null
          include_pitching: boolean | null
          include_throwing: boolean | null
          include_trends: boolean | null
          is_public: boolean | null
          label: string | null
          last_viewed_at: string | null
          recipient_email: string | null
          recipient_name: string | null
          token: string
          updated_at: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          include_hitting?: boolean | null
          include_pitching?: boolean | null
          include_throwing?: boolean | null
          include_trends?: boolean | null
          is_public?: boolean | null
          label?: string | null
          last_viewed_at?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          token: string
          updated_at?: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          include_hitting?: boolean | null
          include_pitching?: boolean | null
          include_throwing?: boolean | null
          include_trends?: boolean | null
          is_public?: boolean | null
          label?: string | null
          last_viewed_at?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          token?: string
          updated_at?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      mfa_backup_codes: {
        Row: {
          code_hash: string
          created_at: string
          id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          code_hash: string
          created_at?: string
          id?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          code_hash?: string
          created_at?: string
          id?: string
          used_at?: string | null
          user_id?: string
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
          analytics_consent: boolean
          analytics_consent_updated_at: string | null
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
          analytics_consent?: boolean
          analytics_consent_updated_at?: string | null
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
          analytics_consent?: boolean
          analytics_consent_updated_at?: string | null
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
          bio_privacy: string
          contact_privacy: string
          cover_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          graduation_year: number | null
          height_inches: number | null
          hudl_url: string | null
          id: string
          instagram_url: string | null
          physical_stats_privacy: string
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
          bio_privacy?: string
          contact_privacy?: string
          cover_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          graduation_year?: number | null
          height_inches?: number | null
          hudl_url?: string | null
          id?: string
          instagram_url?: string | null
          physical_stats_privacy?: string
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
          bio_privacy?: string
          contact_privacy?: string
          cover_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          graduation_year?: number | null
          height_inches?: number | null
          hudl_url?: string | null
          id?: string
          instagram_url?: string | null
          physical_stats_privacy?: string
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
      question_results: {
        Row: {
          attempt_id: string
          correct_answer: string
          created_at: string
          id: string
          is_correct: boolean
          question_id: string
          selected_answer: string
        }
        Insert: {
          attempt_id: string
          correct_answer: string
          created_at?: string
          id?: string
          is_correct: boolean
          question_id: string
          selected_answer: string
        }
        Update: {
          attempt_id?: string
          correct_answer?: string
          created_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          selected_answer?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_results_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "admin_exam_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      remote_lessons: {
        Row: {
          athlete_feedback: string | null
          athlete_rating: number | null
          athlete_user_id: string
          coach_notes: string | null
          coach_user_id: string
          created_at: string
          credit_id: string | null
          duration_minutes: number
          id: string
          notes: string | null
          scheduled_at: string
          status: string
          updated_at: string
          video_call_link: string | null
        }
        Insert: {
          athlete_feedback?: string | null
          athlete_rating?: number | null
          athlete_user_id: string
          coach_notes?: string | null
          coach_user_id: string
          created_at?: string
          credit_id?: string | null
          duration_minutes?: number
          id?: string
          notes?: string | null
          scheduled_at: string
          status?: string
          updated_at?: string
          video_call_link?: string | null
        }
        Update: {
          athlete_feedback?: string | null
          athlete_rating?: number | null
          athlete_user_id?: string
          coach_notes?: string | null
          coach_user_id?: string
          created_at?: string
          credit_id?: string | null
          duration_minutes?: number
          id?: string
          notes?: string | null
          scheduled_at?: string
          status?: string
          updated_at?: string
          video_call_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "remote_lessons_credit_id_fkey"
            columns: ["credit_id"]
            isOneToOne: false
            referencedRelation: "lesson_credits"
            referencedColumns: ["id"]
          },
        ]
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
          last_viewed_at: string | null
          last_viewed_by: string | null
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
          last_viewed_at?: string | null
          last_viewed_by?: string | null
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
          last_viewed_at?: string | null
          last_viewed_by?: string | null
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
      session_recordings: {
        Row: {
          athlete_user_id: string
          coach_user_id: string
          created_at: string | null
          duration_seconds: number | null
          id: string
          notes: string | null
          recording_url: string
          session_id: string | null
        }
        Insert: {
          athlete_user_id: string
          coach_user_id: string
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          notes?: string | null
          recording_url: string
          session_id?: string | null
        }
        Update: {
          athlete_user_id?: string
          coach_user_id?: string
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          notes?: string | null
          recording_url?: string
          session_id?: string | null
        }
        Relationships: []
      }
      team_whitelist: {
        Row: {
          added_by: string | null
          admin_access: boolean | null
          created_at: string | null
          email: string
          full_access: boolean | null
          id: string
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          added_by?: string | null
          admin_access?: boolean | null
          created_at?: string | null
          email: string
          full_access?: boolean | null
          id?: string
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          added_by?: string | null
          admin_access?: boolean | null
          created_at?: string | null
          email?: string
          full_access?: boolean | null
          id?: string
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      trial_feedback: {
        Row: {
          created_at: string
          favorite_feature: string | null
          feedback: string | null
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          created_at?: string
          favorite_feature?: string | null
          feedback?: string | null
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          created_at?: string
          favorite_feature?: string | null
          feedback?: string | null
          id?: string
          rating?: number
          user_id?: string
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
      user_purchases: {
        Row: {
          amount_cents: number
          created_at: string
          expires_at: string | null
          id: string
          product_key: string
          purchased_at: string
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          expires_at?: string | null
          id?: string
          product_key: string
          purchased_at?: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          product_key?: string
          purchased_at?: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
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
      user_sessions: {
        Row: {
          browser: string | null
          created_at: string
          device_info: string | null
          id: string
          is_current: boolean | null
          last_active_at: string
          os: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string
          device_info?: string | null
          id?: string
          is_current?: boolean | null
          last_active_at?: string
          os?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string
          device_info?: string | null
          id?: string
          is_current?: boolean | null
          last_active_at?: string
          os?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_trials: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          started_at: string
          status: string
          trial_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          started_at?: string
          status?: string
          trial_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          started_at?: string
          status?: string
          trial_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      video_analyses: {
        Row: {
          ai_analysis: Json | null
          coach_notes: string | null
          coach_user_id: string | null
          created_at: string
          id: string
          status: string
          updated_at: string
          user_id: string
          video_type: string
          video_url: string
        }
        Insert: {
          ai_analysis?: Json | null
          coach_notes?: string | null
          coach_user_id?: string | null
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
          video_type?: string
          video_url: string
        }
        Update: {
          ai_analysis?: Json | null
          coach_notes?: string | null
          coach_user_id?: string | null
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
          video_type?: string
          video_url?: string
        }
        Relationships: []
      }
      weekly_tips: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string | null
          display_order: number
          expires_at: string | null
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          created_by?: string | null
          display_order?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          display_order?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      device_integrations_safe: {
        Row: {
          created_at: string | null
          device_type: Database["public"]["Enums"]["device_type"] | null
          id: string | null
          is_connected: boolean | null
          last_sync_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_type?: Database["public"]["Enums"]["device_type"] | null
          id?: string | null
          is_connected?: boolean | null
          last_sync_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_type?: Database["public"]["Enums"]["device_type"] | null
          id?: string | null
          is_connected?: boolean | null
          last_sync_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles_public: {
        Row: {
          avatar_url: string | null
          batting_side: string | null
          bio: string | null
          bio_privacy: string | null
          contact_privacy: string | null
          cover_url: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          graduation_year: number | null
          height_inches: number | null
          hudl_url: string | null
          instagram_url: string | null
          physical_stats_privacy: string | null
          position: string | null
          sixty_yard_dash: number | null
          target_schools: string[] | null
          throwing_arm: string | null
          twitter_url: string | null
          updated_at: string | null
          user_id: string | null
          weight_lbs: number | null
          youtube_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          batting_side?: string | null
          bio?: never
          bio_privacy?: string | null
          contact_privacy?: string | null
          cover_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: never
          graduation_year?: number | null
          height_inches?: never
          hudl_url?: never
          instagram_url?: never
          physical_stats_privacy?: string | null
          position?: string | null
          sixty_yard_dash?: never
          target_schools?: string[] | null
          throwing_arm?: string | null
          twitter_url?: never
          updated_at?: string | null
          user_id?: string | null
          weight_lbs?: never
          youtube_url?: never
        }
        Update: {
          avatar_url?: string | null
          batting_side?: string | null
          bio?: never
          bio_privacy?: string | null
          contact_privacy?: string | null
          cover_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: never
          graduation_year?: number | null
          height_inches?: never
          hudl_url?: never
          instagram_url?: never
          physical_stats_privacy?: string | null
          position?: string | null
          sixty_yard_dash?: never
          target_schools?: string[] | null
          throwing_arm?: string | null
          twitter_url?: never
          updated_at?: string | null
          user_id?: string | null
          weight_lbs?: never
          youtube_url?: never
        }
        Relationships: []
      }
      user_sessions_safe: {
        Row: {
          browser: string | null
          created_at: string | null
          device_info: string | null
          id: string | null
          ip_address_masked: string | null
          is_current: boolean | null
          last_active_at: string | null
          location: string | null
          os: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          created_at?: string | null
          device_info?: string | null
          id?: string | null
          ip_address_masked?: never
          is_current?: boolean | null
          last_active_at?: string | null
          location?: never
          os?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          created_at?: string | null
          device_info?: string | null
          id?: string | null
          ip_address_masked?: never
          is_current?: boolean | null
          last_active_at?: string | null
          location?: never
          os?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      anonymize_old_audit_ips:
        | { Args: never; Returns: number }
        | { Args: { days_threshold?: number }; Returns: number }
      can_create_activity: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      can_view_profile: {
        Args: { _profile_user_id: string; _viewer_id: string }
        Returns: boolean
      }
      check_exam_answer:
        | {
            Args: {
              p_attempt_id: string
              p_question_id: string
              p_selected_answer: number
            }
            Returns: {
              explanation: string
              is_correct: boolean
            }[]
          }
        | {
            Args: { question_id: string; selected_answer: number }
            Returns: boolean
          }
      decrypt_credential: { Args: { ciphertext: string }; Returns: string }
      encrypt_credential: { Args: { plaintext: string }; Returns: string }
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
      get_athlete_trial_status: { Args: { p_user_id: string }; Returns: Json }
      get_certificate_leaderboard: {
        Args: { result_limit?: number; time_filter?: string }
        Returns: {
          avatar_url: string
          certificate_count: number
          courses_completed: string[]
          display_name: string
          latest_certificate_date: string
          user_id: string
        }[]
      }
      get_coach_user_id_by_name: {
        Args: { _coach_name: string }
        Returns: string
      }
      get_device_credentials_secure: {
        Args: { p_device_type: string; p_user_id: string }
        Returns: {
          access_token: string
          api_key: string
          api_secret: string
          refresh_token: string
          token_expires_at: string
        }[]
      }
      get_exam_questions: {
        Args: {
          p_certification_type: Database["public"]["Enums"]["certification_type"]
          p_limit?: number
        }
        Returns: {
          id: string
          is_scenario: boolean
          options: Json
          question_text: string
          section: string
        }[]
      }
      get_profile_safe: {
        Args: { target_user_id: string }
        Returns: {
          avatar_url: string
          batting_side: string
          bio: string
          bio_privacy: string
          contact_privacy: string
          cover_url: string
          created_at: string
          display_name: string
          email: string
          graduation_year: number
          height_inches: number
          hudl_url: string
          id: string
          instagram_url: string
          physical_stats_privacy: string
          position: string
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
      get_profile_with_privacy: {
        Args: { target_user_id: string }
        Returns: Json
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
      get_shared_kpi_profile: { Args: { share_token: string }; Returns: Json }
      get_shared_metrics: { Args: { share_token: string }; Returns: Json }
      get_user_purchase_for_admin: {
        Args: { purchase_id: string }
        Returns: {
          amount_cents: number
          created_at: string
          expires_at: string
          id: string
          product_key: string
          purchased_at: string
          status: string
          stripe_payment_intent_id: string
          stripe_session_id: string
          updated_at: string
          user_id: string
        }[]
      }
      has_admin_role: { Args: { user_uuid: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_team_access: { Args: { _user_id: string }; Returns: boolean }
      has_team_admin_access: { Args: { _user_id: string }; Returns: boolean }
      has_valid_certification: {
        Args: {
          _cert_type: Database["public"]["Enums"]["certification_type"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_22m_invite_usage: {
        Args: { token_id: string }
        Returns: undefined
      }
      increment_invite_usage: { Args: { token_id: string }; Returns: undefined }
      is_active_coach_for_athlete: {
        Args: { _athlete_id: string; _coach_id: string }
        Returns: boolean
      }
      list_all_purchases_for_admin: {
        Args: never
        Returns: {
          amount_cents: number
          created_at: string
          expires_at: string
          id: string
          product_key: string
          purchased_at: string
          status: string
          user_id: string
        }[]
      }
      obfuscate_ip: { Args: { ip_address: string }; Returns: string }
      purge_old_audit_logs:
        | { Args: never; Returns: number }
        | { Args: { retention_days?: number }; Returns: number }
      purge_old_user_sessions: {
        Args: { retention_days?: number }
        Returns: number
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
      update_certification_statuses: { Args: never; Returns: undefined }
      verify_certificate_public: {
        Args: { cert_number: string }
        Returns: Json
      }
      verify_course_certificate: {
        Args: { cert_number: string }
        Returns: Json
      }
    }
    Enums: {
      admin_cert_status: "Active" | "Expiring" | "Expired" | "Locked"
      admin_cert_type:
        | "Foundations"
        | "Performance"
        | "Catcher"
        | "Infield"
        | "Outfield"
      app_role: "admin" | "coach" | "athlete"
      certification_status: "active" | "expired" | "revoked"
      certification_type:
        | "foundations"
        | "performance"
        | "catcher_specialist"
        | "infield_specialist"
        | "outfield_specialist"
      coach_role: "Coach" | "Director" | "OrgAdmin" | "VAULTHQ"
      coach_status: "Active" | "Suspended"
      device_type:
        | "rapsodo"
        | "hittrax"
        | "blast_motion"
        | "trackman"
        | "pocket_radar"
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
      admin_cert_status: ["Active", "Expiring", "Expired", "Locked"],
      admin_cert_type: [
        "Foundations",
        "Performance",
        "Catcher",
        "Infield",
        "Outfield",
      ],
      app_role: ["admin", "coach", "athlete"],
      certification_status: ["active", "expired", "revoked"],
      certification_type: [
        "foundations",
        "performance",
        "catcher_specialist",
        "infield_specialist",
        "outfield_specialist",
      ],
      coach_role: ["Coach", "Director", "OrgAdmin", "VAULTHQ"],
      coach_status: ["Active", "Suspended"],
      device_type: [
        "rapsodo",
        "hittrax",
        "blast_motion",
        "trackman",
        "pocket_radar",
      ],
    },
  },
} as const
