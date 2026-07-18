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
      government_schemes: {
        Row: {
          application_url: string | null
          benefit_amount: number | null
          category: string
          created_at: string
          created_by: string
          deadline: string | null
          department: string | null
          description: string
          document_url: string | null
          eligibility: string | null
          id: string
          status: string
          title: string
          updated_at: string
          village_id: string | null
        }
        Insert: {
          application_url?: string | null
          benefit_amount?: number | null
          category?: string
          created_at?: string
          created_by: string
          deadline?: string | null
          department?: string | null
          description: string
          document_url?: string | null
          eligibility?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string
          village_id?: string | null
        }
        Update: {
          application_url?: string | null
          benefit_amount?: number | null
          category?: string
          created_at?: string
          created_by?: string
          deadline?: string | null
          department?: string | null
          description?: string
          document_url?: string | null
          eligibility?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string
          village_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "government_schemes_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      government_work_images: {
        Row: {
          created_at: string
          government_work_id: string
          id: string
          image_url: string
          storage_path: string | null
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          government_work_id: string
          id?: string
          image_url: string
          storage_path?: string | null
          uploaded_by: string
        }
        Update: {
          created_at?: string
          government_work_id?: string
          id?: string
          image_url?: string
          storage_path?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "government_work_images_government_work_id_fkey"
            columns: ["government_work_id"]
            isOneToOne: false
            referencedRelation: "government_works"
            referencedColumns: ["id"]
          },
        ]
      }
      government_works: {
        Row: {
          budget: number | null
          created_at: string
          created_by: string
          department: string | null
          description: string | null
          end_date: string | null
          id: string
          location: string | null
          start_date: string | null
          status: string
          title: string
          updated_at: string
          village_id: string | null
        }
        Insert: {
          budget?: number | null
          created_at?: string
          created_by: string
          department?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
          village_id?: string | null
        }
        Update: {
          budget?: number | null
          created_at?: string
          created_by?: string
          department?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          village_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "government_works_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          category: string | null
          contact: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_pinned: boolean
          location: string | null
          owner_id: string
          price: string | null
          status: string
          storage_path: string | null
          title: string
          type: Database["public"]["Enums"]["listing_type"]
          updated_at: string
          village_id: string | null
        }
        Insert: {
          category?: string | null
          contact: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_pinned?: boolean
          location?: string | null
          owner_id: string
          price?: string | null
          status?: string
          storage_path?: string | null
          title: string
          type: Database["public"]["Enums"]["listing_type"]
          updated_at?: string
          village_id?: string | null
        }
        Update: {
          category?: string | null
          contact?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_pinned?: boolean
          location?: string | null
          owner_id?: string
          price?: string | null
          status?: string
          storage_path?: string | null
          title?: string
          type?: Database["public"]["Enums"]["listing_type"]
          updated_at?: string
          village_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string
          created_at: string
          created_by: string | null
          dedupe_key: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          read_at: string | null
          recipient_id: string | null
          title: string
          type: string
          village_id: string | null
        }
        Insert: {
          action_url?: string | null
          body: string
          created_at?: string
          created_by?: string | null
          dedupe_key?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          read_at?: string | null
          recipient_id?: string | null
          title: string
          type?: string
          village_id?: string | null
        }
        Update: {
          action_url?: string | null
          body?: string
          created_at?: string
          created_by?: string | null
          dedupe_key?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          read_at?: string | null
          recipient_id?: string | null
          title?: string
          type?: string
          village_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: string
          approved_at: string | null
          approved_by: string | null
          avatar_url: string | null
          created_at: string
          dealer_category: string | null
          dealer_status: string | null
          designation: string | null
          display_name: string | null
          district: string | null
          email: string | null
          full_name: string | null
          id: string
          mandal: string | null
          occupation: string | null
          phone: string | null
          photo_url: string | null
          preferred_language: string | null
          profile_completed_at: string | null
          role: Database["public"]["Enums"]["app_role"]
          shop_address: string | null
          shop_description: string | null
          shop_name: string | null
          state: string | null
          updated_at: string
          username: string | null
          village: string | null
          village_id: string | null
        }
        Insert: {
          account_type?: string
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          created_at?: string
          dealer_category?: string | null
          dealer_status?: string | null
          designation?: string | null
          display_name?: string | null
          district?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          mandal?: string | null
          occupation?: string | null
          phone?: string | null
          photo_url?: string | null
          preferred_language?: string | null
          profile_completed_at?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          shop_address?: string | null
          shop_description?: string | null
          shop_name?: string | null
          state?: string | null
          updated_at?: string
          username?: string | null
          village?: string | null
          village_id?: string | null
        }
        Update: {
          account_type?: string
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          created_at?: string
          dealer_category?: string | null
          dealer_status?: string | null
          designation?: string | null
          display_name?: string | null
          district?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          mandal?: string | null
          occupation?: string | null
          phone?: string | null
          photo_url?: string | null
          preferred_language?: string | null
          profile_completed_at?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          shop_address?: string | null
          shop_description?: string | null
          shop_name?: string | null
          state?: string | null
          updated_at?: string
          username?: string | null
          village?: string | null
          village_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_village_id_fkey"
            columns: ["village_id"]
            isOneToOne: false
            referencedRelation: "villages"
            referencedColumns: ["id"]
          },
        ]
      }
      push_events: {
        Row: {
          created_at: string
          created_by: string | null
          event_key: string
          id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          event_key: string
          id?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          event_key?: string
          id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      scheme_applications: {
        Row: {
          applicant_id: string
          created_at: string
          id: string
          notes: string | null
          scheme_id: string
          status: string
          updated_at: string
        }
        Insert: {
          applicant_id: string
          created_at?: string
          id?: string
          notes?: string | null
          scheme_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          scheme_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheme_applications_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "government_schemes"
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
      villages: {
        Row: {
          created_at: string
          district: string | null
          id: string
          mandal: string | null
          name: string
          state: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          district?: string | null
          id?: string
          mandal?: string | null
          name: string
          state?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          district?: string | null
          id?: string
          mandal?: string | null
          name?: string
          state?: string | null
          updated_at?: string
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
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "super_admin"
        | "village_admin"
        | "dealer"
        | "citizen"
      listing_type:
        | "worker"
        | "work"
        | "land"
        | "market"
        | "service"
        | "announcement"
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
      app_role: [
        "admin",
        "moderator",
        "user",
        "super_admin",
        "village_admin",
        "dealer",
        "citizen",
      ],
      listing_type: [
        "worker",
        "work",
        "land",
        "market",
        "service",
        "announcement",
      ],
    },
  },
} as const
