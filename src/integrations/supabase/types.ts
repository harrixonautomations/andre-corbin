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
      availability_slots: {
        Row: {
          created_at: string
          end_time: string
          id: string
          is_blocked: boolean
          is_booked: boolean
          slot_date: string
          start_time: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          is_blocked?: boolean
          is_booked?: boolean
          slot_date: string
          start_time: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          is_blocked?: boolean
          is_booked?: boolean
          slot_date?: string
          start_time?: string
        }
        Relationships: []
      }
      books: {
        Row: {
          amazon_url: string
          cover_image_url: string | null
          created_at: string
          description: string
          discount_active: boolean
          discount_end: string | null
          discount_percent: number
          discount_start: string | null
          id: string
          manuscript_url: string | null
          page_count: number
          price: number
          sample_chapter_url: string | null
          subtitle: string
          title: string
          updated_at: string
        }
        Insert: {
          amazon_url?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string
          discount_active?: boolean
          discount_end?: string | null
          discount_percent?: number
          discount_start?: string | null
          id?: string
          manuscript_url?: string | null
          page_count?: number
          price?: number
          sample_chapter_url?: string | null
          subtitle?: string
          title: string
          updated_at?: string
        }
        Update: {
          amazon_url?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string
          discount_active?: boolean
          discount_end?: string | null
          discount_percent?: number
          discount_start?: string | null
          id?: string
          manuscript_url?: string | null
          page_count?: number
          price?: number
          sample_chapter_url?: string | null
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          consultation_id: string
          created_at: string
          id: string
          message: string
          reply_to_id: string | null
          sender_id: string
        }
        Insert: {
          consultation_id: string
          created_at?: string
          id?: string
          message: string
          reply_to_id?: string | null
          sender_id: string
        }
        Update: {
          consultation_id?: string
          created_at?: string
          id?: string
          message?: string
          reply_to_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_logs: {
        Row: {
          action: string
          consultation_id: string
          created_at: string
          details: string | null
          id: string
          user_id: string
        }
        Insert: {
          action: string
          consultation_id: string
          created_at?: string
          details?: string | null
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          consultation_id?: string
          created_at?: string
          details?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_logs_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_plans: {
        Row: {
          created_at: string
          description: string
          discount_percent: number
          display_order: number
          duration_minutes: number
          id: string
          is_popular: boolean
          is_published: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          discount_percent?: number
          display_order?: number
          duration_minutes?: number
          id?: string
          is_popular?: boolean
          is_published?: boolean
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          discount_percent?: number
          display_order?: number
          duration_minutes?: number
          id?: string
          is_popular?: boolean
          is_published?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      consultations: {
        Row: {
          client_response: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
          plan_id: string | null
          postponed_date: string | null
          postponed_time: string | null
          preferred_date: string | null
          reschedule_proposed_date: string | null
          reschedule_proposed_time: string | null
          reschedule_requested_by: string | null
          slot_date: string | null
          slot_time: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          client_response?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          plan_id?: string | null
          postponed_date?: string | null
          postponed_time?: string | null
          preferred_date?: string | null
          reschedule_proposed_date?: string | null
          reschedule_proposed_time?: string | null
          reschedule_requested_by?: string | null
          slot_date?: string | null
          slot_time?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          client_response?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          plan_id?: string | null
          postponed_date?: string | null
          postponed_time?: string | null
          preferred_date?: string | null
          reschedule_proposed_date?: string | null
          reschedule_proposed_time?: string | null
          reschedule_requested_by?: string | null
          slot_date?: string | null
          slot_time?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "consultation_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          book_id: string | null
          city: string
          country: string
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          payment_method: string
          state: string
          status: string
          total: number
          user_id: string | null
          zip: string
        }
        Insert: {
          address: string
          book_id?: string | null
          city: string
          country: string
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          payment_method?: string
          state: string
          status?: string
          total: number
          user_id?: string | null
          zip: string
        }
        Update: {
          address?: string
          book_id?: string | null
          city?: string
          country?: string
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          payment_method?: string
          state?: string
          status?: string
          total?: number
          user_id?: string | null
          zip?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          book_id: string
          created_at: string
          id: string
          rating: number
          review_text: string
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: string
          rating: number
          review_text?: string
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: string
          rating?: number
          review_text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      sample_requests: {
        Row: {
          book_id: string | null
          created_at: string
          email: string
          id: string
          status: string
        }
        Insert: {
          book_id?: string | null
          created_at?: string
          email: string
          id?: string
          status?: string
        }
        Update: {
          book_id?: string | null
          created_at?: string
          email?: string
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "sample_requests_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          company: string
          created_at: string
          display_order: number
          id: string
          name: string
          quote: string
          title: string
        }
        Insert: {
          company?: string
          created_at?: string
          display_order?: number
          id?: string
          name?: string
          quote?: string
          title?: string
        }
        Update: {
          company?: string
          created_at?: string
          display_order?: number
          id?: string
          name?: string
          quote?: string
          title?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      get_book_avg_rating: {
        Args: { p_book_id: string }
        Returns: {
          avg_rating: number
          review_count: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
