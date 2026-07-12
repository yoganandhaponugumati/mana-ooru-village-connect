export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type AppRole = "super_admin" | "village_admin" | "citizen";
type Occupation =
  | "Farmer"
  | "Worker"
  | "Teacher"
  | "Student"
  | "Electrician"
  | "Mechanic"
  | "Doctor"
  | "Business"
  | "Other";

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      villages: {
        Row: {
          id: string;
          name: string;
          mandal: string | null;
          district: string;
          state: string;
          pincode: string | null;
          latitude: number | null;
          longitude: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["villages"]["Row"]> &
          Pick<Database["public"]["Tables"]["villages"]["Row"], "name" | "district" | "state">;
        Update: Partial<Database["public"]["Tables"]["villages"]["Row"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          role: AppRole;
          occupation: Occupation | null;
          full_name: string | null;
          display_name: string | null;
          username: string | null;
          phone: string | null;
          email: string | null;
          photo_url: string | null;
          avatar_url: string | null;
          address: string | null;
          bio: string | null;
          village_id: string | null;
          account_type: string | null;
          state: string | null;
          district: string | null;
          mandal: string | null;
          village: string | null;
          preferred_language: "te" | "en" | "hi";
          profile_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      complaints: {
        Row: {
          id: string;
          citizen_id: string;
          village_id: string | null;
          title: string;
          description: string;
          category: string;
          status: "open" | "in_progress" | "resolved" | "rejected";
          priority: "low" | "medium" | "high" | "urgent";
          assigned_admin_id: string | null;
          location: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["complaints"]["Row"]> &
          Pick<
            Database["public"]["Tables"]["complaints"]["Row"],
            "citizen_id" | "title" | "description" | "category"
          >;
        Update: Partial<Database["public"]["Tables"]["complaints"]["Row"]>;
        Relationships: [];
      };
      announcements: {
        Row: {
          id: string;
          author_id: string;
          village_id: string | null;
          title: string;
          body: string;
          category: string | null;
          published_at: string;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["announcements"]["Row"]> &
          Pick<
            Database["public"]["Tables"]["announcements"]["Row"],
            "author_id" | "title" | "body"
          >;
        Update: Partial<Database["public"]["Tables"]["announcements"]["Row"]>;
        Relationships: [];
      };
      government_works: {
        Row: {
          id: string;
          created_by: string;
          village_id: string | null;
          title: string;
          description: string | null;
          department: string | null;
          budget: number | null;
          status: "planned" | "active" | "completed" | "paused" | "cancelled";
          start_date: string | null;
          end_date: string | null;
          location: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["government_works"]["Row"]> &
          Pick<Database["public"]["Tables"]["government_works"]["Row"], "created_by" | "title">;
        Update: Partial<Database["public"]["Tables"]["government_works"]["Row"]>;
        Relationships: [];
      };
      government_work_images: {
        Row: {
          id: string;
          government_work_id: string;
          uploaded_by: string;
          image_url: string;
          storage_path: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["government_work_images"]["Row"]> &
          Pick<
            Database["public"]["Tables"]["government_work_images"]["Row"],
            "government_work_id" | "uploaded_by" | "image_url"
          >;
        Update: Partial<Database["public"]["Tables"]["government_work_images"]["Row"]>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string | null;
          village_id: string | null;
          created_by: string | null;
          title: string;
          body: string;
          type: string;
          entity_type: string | null;
          entity_id: string | null;
          action_url: string | null;
          dedupe_key: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["notifications"]["Row"]> &
          Pick<Database["public"]["Tables"]["notifications"]["Row"], "title" | "body">;
        Update: Partial<Database["public"]["Tables"]["notifications"]["Row"]>;
        Relationships: [];
      };
      push_events: {
        Row: {
          event_key: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["push_events"]["Row"]> &
          Pick<Database["public"]["Tables"]["push_events"]["Row"], "event_key">;
        Update: Partial<Database["public"]["Tables"]["push_events"]["Row"]>;
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["push_subscriptions"]["Row"]> &
          Pick<
            Database["public"]["Tables"]["push_subscriptions"]["Row"],
            "user_id" | "endpoint" | "p256dh" | "auth"
          >;
        Update: Partial<Database["public"]["Tables"]["push_subscriptions"]["Row"]>;
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          created_by: string;
          village_id: string | null;
          title: string;
          description: string | null;
          event_date: string;
          location: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["events"]["Row"]> &
          Pick<
            Database["public"]["Tables"]["events"]["Row"],
            "created_by" | "title" | "event_date"
          >;
        Update: Partial<Database["public"]["Tables"]["events"]["Row"]>;
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          author_id: string;
          entity_type: "complaint" | "announcement" | "government_work" | "event" | "listing";
          entity_id: string;
          body: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["comments"]["Row"]> &
          Pick<
            Database["public"]["Tables"]["comments"]["Row"],
            "author_id" | "entity_type" | "entity_id" | "body"
          >;
        Update: Partial<Database["public"]["Tables"]["comments"]["Row"]>;
        Relationships: [];
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          entity_type: "complaint" | "announcement" | "government_work" | "event" | "listing";
          entity_id: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["likes"]["Row"]> &
          Pick<
            Database["public"]["Tables"]["likes"]["Row"],
            "user_id" | "entity_type" | "entity_id"
          >;
        Update: Partial<Database["public"]["Tables"]["likes"]["Row"]>;
        Relationships: [];
      };
      listings: {
        Row: {
          id: string;
          owner_id: string;
          type: Database["public"]["Enums"]["listing_type"];
          title: string;
          description: string | null;
          contact: string;
          location: string | null;
          price: string | null;
          category: string | null;
          image_url: string | null;
          storage_path: string | null;
          is_pinned: boolean;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["listings"]["Row"]> &
          Pick<
            Database["public"]["Tables"]["listings"]["Row"],
            "owner_id" | "type" | "title" | "contact"
          >;
        Update: Partial<Database["public"]["Tables"]["listings"]["Row"]>;
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: AppRole;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["user_roles"]["Row"]> &
          Pick<Database["public"]["Tables"]["user_roles"]["Row"], "user_id" | "role">;
        Update: Partial<Database["public"]["Tables"]["user_roles"]["Row"]>;
        Relationships: [];
      };
      government_schemes: {
        Row: {
          id: string;
          created_by: string;
          village_id: string | null;
          title: string;
          description: string;
          department: string | null;
          eligibility: string | null;
          benefit_amount: number | null;
          application_url: string | null;
          document_url: string | null;
          category:
            | "agriculture"
            | "health"
            | "education"
            | "housing"
            | "women"
            | "senior_citizen"
            | "general";
          status: "active" | "closed" | "upcoming";
          deadline: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["government_schemes"]["Row"]> &
          Pick<
            Database["public"]["Tables"]["government_schemes"]["Row"],
            "created_by" | "title" | "description"
          >;
        Update: Partial<Database["public"]["Tables"]["government_schemes"]["Row"]>;
        Relationships: [];
      };
      scheme_applications: {
        Row: {
          id: string;
          scheme_id: string;
          applicant_id: string;
          status: "submitted" | "under_review" | "approved" | "rejected";
          notes: string | null;
          reviewed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["scheme_applications"]["Row"]> &
          Pick<
            Database["public"]["Tables"]["scheme_applications"]["Row"],
            "scheme_id" | "applicant_id"
          >;
        Update: Partial<Database["public"]["Tables"]["scheme_applications"]["Row"]>;
        Relationships: [];
      };
      blood_donors: {
        Row: {
          id: string;
          profile_id: string;
          village_id: string | null;
          blood_group: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
          phone: string;
          last_donated_on: string | null;
          available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["blood_donors"]["Row"]> &
          Pick<
            Database["public"]["Tables"]["blood_donors"]["Row"],
            "profile_id" | "blood_group" | "phone"
          >;
        Update: Partial<Database["public"]["Tables"]["blood_donors"]["Row"]>;
        Relationships: [];
      };
      village_polls: {
        Row: {
          id: string;
          created_by: string;
          village_id: string | null;
          question: string;
          description: string | null;
          options: Json;
          starts_at: string;
          ends_at: string;
          status: "open" | "closed";
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["village_polls"]["Row"]> &
          Pick<
            Database["public"]["Tables"]["village_polls"]["Row"],
            "created_by" | "question" | "options" | "ends_at"
          >;
        Update: Partial<Database["public"]["Tables"]["village_polls"]["Row"]>;
        Relationships: [];
      };
      poll_votes: {
        Row: {
          id: string;
          poll_id: string;
          voter_id: string;
          option_id: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["poll_votes"]["Row"]> &
          Pick<
            Database["public"]["Tables"]["poll_votes"]["Row"],
            "poll_id" | "voter_id" | "option_id"
          >;
        Update: Partial<Database["public"]["Tables"]["poll_votes"]["Row"]>;
        Relationships: [];
      };
      village_budget_items: {
        Row: {
          id: string;
          village_id: string;
          government_work_id: string | null;
          created_by: string;
          fiscal_year: string;
          category: string;
          allocated_amount: number;
          spent_amount: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["village_budget_items"]["Row"]> &
          Pick<
            Database["public"]["Tables"]["village_budget_items"]["Row"],
            "village_id" | "created_by" | "fiscal_year" | "category"
          >;
        Update: Partial<Database["public"]["Tables"]["village_budget_items"]["Row"]>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: AppRole;
      };
      has_role: {
        Args: {
          _role: AppRole;
          _user_id: string;
        };
        Returns: boolean;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_super_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      app_role: AppRole;
      listing_type:
        | "worker"
        | "work"
        | "land"
        | "market"
        | "service"
        | "announcement"
        | "complaint";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<DefaultSchemaTableName extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][DefaultSchemaTableName] extends { Insert: infer I } ? I : never;

export type TablesUpdate<DefaultSchemaTableName extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][DefaultSchemaTableName] extends { Update: infer U } ? U : never;

export type Enums<DefaultSchemaEnumName extends keyof DefaultSchema["Enums"]> =
  DefaultSchema["Enums"][DefaultSchemaEnumName];

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "village_admin", "citizen"],
      listing_type: ["worker", "work", "land", "market", "service", "announcement", "complaint"],
    },
  },
} as const;
