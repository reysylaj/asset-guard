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
      assets: {
        Row: {
          admin_privileges_granted: boolean | null
          antivirus_edr_present: boolean | null
          asset_id: string
          budget_owner: string | null
          cost_center: string | null
          created_at: string
          created_by: string | null
          current_location_id: string | null
          data_classification:
            | Database["public"]["Enums"]["data_classification"]
            | null
          depreciation_model:
            | Database["public"]["Enums"]["depreciation_model"]
            | null
          disk_encryption_enabled: boolean | null
          hostname: string | null
          id: string
          is_readonly: boolean | null
          last_security_check: string | null
          manufacturer: string
          model: string
          notes: string | null
          operating_system: string | null
          ownership: Database["public"]["Enums"]["ownership_type"]
          purchase_cost: number | null
          purchase_date: string | null
          security_compliant: boolean | null
          serial_number: string
          specs: Json | null
          status: Database["public"]["Enums"]["asset_status"]
          type: Database["public"]["Enums"]["asset_type"]
          updated_at: string
          updated_by: string | null
          useful_life_years: number | null
          warranty_expiry: string | null
        }
        Insert: {
          admin_privileges_granted?: boolean | null
          antivirus_edr_present?: boolean | null
          asset_id: string
          budget_owner?: string | null
          cost_center?: string | null
          created_at?: string
          created_by?: string | null
          current_location_id?: string | null
          data_classification?:
            | Database["public"]["Enums"]["data_classification"]
            | null
          depreciation_model?:
            | Database["public"]["Enums"]["depreciation_model"]
            | null
          disk_encryption_enabled?: boolean | null
          hostname?: string | null
          id?: string
          is_readonly?: boolean | null
          last_security_check?: string | null
          manufacturer: string
          model: string
          notes?: string | null
          operating_system?: string | null
          ownership: Database["public"]["Enums"]["ownership_type"]
          purchase_cost?: number | null
          purchase_date?: string | null
          security_compliant?: boolean | null
          serial_number: string
          specs?: Json | null
          status?: Database["public"]["Enums"]["asset_status"]
          type: Database["public"]["Enums"]["asset_type"]
          updated_at?: string
          updated_by?: string | null
          useful_life_years?: number | null
          warranty_expiry?: string | null
        }
        Update: {
          admin_privileges_granted?: boolean | null
          antivirus_edr_present?: boolean | null
          asset_id?: string
          budget_owner?: string | null
          cost_center?: string | null
          created_at?: string
          created_by?: string | null
          current_location_id?: string | null
          data_classification?:
            | Database["public"]["Enums"]["data_classification"]
            | null
          depreciation_model?:
            | Database["public"]["Enums"]["depreciation_model"]
            | null
          disk_encryption_enabled?: boolean | null
          hostname?: string | null
          id?: string
          is_readonly?: boolean | null
          last_security_check?: string | null
          manufacturer?: string
          model?: string
          notes?: string | null
          operating_system?: string | null
          ownership?: Database["public"]["Enums"]["ownership_type"]
          purchase_cost?: number | null
          purchase_date?: string | null
          security_compliant?: boolean | null
          serial_number?: string
          specs?: Json | null
          status?: Database["public"]["Enums"]["asset_status"]
          type?: Database["public"]["Enums"]["asset_type"]
          updated_at?: string
          updated_by?: string | null
          useful_life_years?: number | null
          warranty_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_current_location_id_fkey"
            columns: ["current_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          acceptance_notes: string | null
          accepted_at: string | null
          accepted_by: string | null
          asset_id: string
          change_reason: string | null
          change_type: string | null
          created_at: string
          created_by: string | null
          damage_notes: string | null
          digital_acknowledgment: boolean | null
          employee_id: string
          end_date: string | null
          id: string
          notes: string | null
          requires_formatting: boolean | null
          return_condition: string | null
          returned_at: string | null
          returned_by: string | null
          start_date: string
          status: Database["public"]["Enums"]["assignment_status"]
        }
        Insert: {
          acceptance_notes?: string | null
          accepted_at?: string | null
          accepted_by?: string | null
          asset_id: string
          change_reason?: string | null
          change_type?: string | null
          created_at?: string
          created_by?: string | null
          damage_notes?: string | null
          digital_acknowledgment?: boolean | null
          employee_id: string
          end_date?: string | null
          id?: string
          notes?: string | null
          requires_formatting?: boolean | null
          return_condition?: string | null
          returned_at?: string | null
          returned_by?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["assignment_status"]
        }
        Update: {
          acceptance_notes?: string | null
          accepted_at?: string | null
          accepted_by?: string | null
          asset_id?: string
          change_reason?: string | null
          change_type?: string | null
          created_at?: string
          created_by?: string | null
          damage_notes?: string | null
          digital_acknowledgment?: boolean | null
          employee_id?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          requires_formatting?: boolean | null
          return_condition?: string | null
          returned_at?: string | null
          returned_by?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["assignment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "assignments_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          changes: Json | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["entity_type"]
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          timestamp: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          changes?: Json | null
          entity_id: string
          entity_type: Database["public"]["Enums"]["entity_type"]
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          timestamp?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          changes?: Json | null
          entity_id?: string
          entity_type?: Database["public"]["Enums"]["entity_type"]
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          timestamp?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          badge_id: string
          created_at: string
          created_by: string | null
          department: string
          end_date: string | null
          health_card_id: string
          id: string
          is_offboarding_complete: boolean | null
          name: string
          offboarding_completed_at: string | null
          offboarding_completed_by: string | null
          start_date: string
          status: Database["public"]["Enums"]["employment_status"]
          surname: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          badge_id: string
          created_at?: string
          created_by?: string | null
          department: string
          end_date?: string | null
          health_card_id: string
          id?: string
          is_offboarding_complete?: boolean | null
          name: string
          offboarding_completed_at?: string | null
          offboarding_completed_by?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["employment_status"]
          surname: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          badge_id?: string
          created_at?: string
          created_by?: string | null
          department?: string
          end_date?: string | null
          health_card_id?: string
          id?: string
          is_offboarding_complete?: boolean | null
          name?: string
          offboarding_completed_at?: string | null
          offboarding_completed_by?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["employment_status"]
          surname?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      location_history: {
        Row: {
          asset_id: string
          created_at: string
          end_date: string | null
          id: string
          location_id: string
          moved_by: string | null
          notes: string | null
          start_date: string
        }
        Insert: {
          asset_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          location_id: string
          moved_by?: string | null
          notes?: string | null
          start_date?: string
        }
        Update: {
          asset_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          location_id?: string
          moved_by?: string | null
          notes?: string | null
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_history_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_history_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          building: string | null
          created_at: string
          created_by: string | null
          floor: string | null
          id: string
          is_active: boolean
          name: string
          rack_position: string | null
          type: Database["public"]["Enums"]["location_type"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          building?: string | null
          created_at?: string
          created_by?: string | null
          floor?: string | null
          id?: string
          is_active?: boolean
          name: string
          rack_position?: string | null
          type: Database["public"]["Enums"]["location_type"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          building?: string | null
          created_at?: string
          created_by?: string | null
          floor?: string | null
          id?: string
          is_active?: boolean
          name?: string
          rack_position?: string | null
          type?: Database["public"]["Enums"]["location_type"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      maintenance_events: {
        Row: {
          asset_id: string
          cost: number | null
          created_at: string
          created_by: string | null
          date: string
          description: string
          downtime_hours: number | null
          id: string
          parts_replaced: string[] | null
          performed_by: string
          resulting_health: Database["public"]["Enums"]["storage_health"] | null
          type: Database["public"]["Enums"]["maintenance_type"]
        }
        Insert: {
          asset_id: string
          cost?: number | null
          created_at?: string
          created_by?: string | null
          date: string
          description: string
          downtime_hours?: number | null
          id?: string
          parts_replaced?: string[] | null
          performed_by: string
          resulting_health?:
            | Database["public"]["Enums"]["storage_health"]
            | null
          type: Database["public"]["Enums"]["maintenance_type"]
        }
        Update: {
          asset_id?: string
          cost?: number | null
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string
          downtime_hours?: number | null
          id?: string
          parts_replaced?: string[] | null
          performed_by?: string
          resulting_health?:
            | Database["public"]["Enums"]["storage_health"]
            | null
          type?: Database["public"]["Enums"]["maintenance_type"]
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_events_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      offboarding_records: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string
          employee_id: string
          id: string
          initiated_at: string
          initiated_by: string | null
          notes: string | null
          pending_assets: string[] | null
          returned_assets: string[] | null
          signoff_generated: boolean | null
          signoff_generated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          employee_id: string
          id?: string
          initiated_at?: string
          initiated_by?: string | null
          notes?: string | null
          pending_assets?: string[] | null
          returned_assets?: string[] | null
          signoff_generated?: boolean | null
          signoff_generated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          initiated_at?: string
          initiated_by?: string | null
          notes?: string | null
          pending_assets?: string[] | null
          returned_assets?: string[] | null
          signoff_generated?: boolean | null
          signoff_generated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offboarding_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      storage_units: {
        Row: {
          asset_id: string
          capacity: string
          created_at: string
          health: Database["public"]["Enums"]["storage_health"]
          id: string
          type: Database["public"]["Enums"]["storage_type"]
          updated_at: string
        }
        Insert: {
          asset_id: string
          capacity: string
          created_at?: string
          health?: Database["public"]["Enums"]["storage_health"]
          id?: string
          type: Database["public"]["Enums"]["storage_type"]
          updated_at?: string
        }
        Update: {
          asset_id?: string
          capacity?: string
          created_at?: string
          health?: Database["public"]["Enums"]["storage_health"]
          id?: string
          type?: Database["public"]["Enums"]["storage_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "storage_units_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_book_value: {
        Args: {
          purchase_cost: number
          purchase_date: string
          useful_life_years: number
        }
        Returns: number
      }
      can_be_assigned: { Args: { _asset_id: string }; Returns: boolean }
      can_receive_assignment: {
        Args: { _employee_id: string }
        Returns: boolean
      }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
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
      app_role: "admin" | "hr" | "it" | "auditor"
      asset_status:
        | "planned"
        | "ordered"
        | "in_use"
        | "spare"
        | "under_repair"
        | "quarantined"
        | "retired"
        | "disposed"
      asset_type:
        | "laptop"
        | "desktop"
        | "monitor"
        | "server"
        | "network_device"
        | "accessory"
      assignment_status:
        | "pending_acceptance"
        | "active"
        | "pending_return"
        | "returned"
      audit_action: "create" | "update" | "delete" | "assign" | "unassign"
      data_classification: "public" | "internal" | "confidential" | "restricted"
      depreciation_model: "straight_line"
      employment_status: "active" | "left"
      entity_type:
        | "employee"
        | "asset"
        | "assignment"
        | "maintenance"
        | "location"
        | "profile"
      location_type: "office" | "storage" | "server_room" | "rack"
      maintenance_type:
        | "formatting"
        | "repair"
        | "upgrade"
        | "inspection"
        | "replacement"
      ownership_type: "TinextaCyber" | "FDM" | "ServiceFactory"
      storage_health: "healthy" | "warning" | "critical"
      storage_type: "HDD" | "SSD" | "NVMe"
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
      app_role: ["admin", "hr", "it", "auditor"],
      asset_status: [
        "planned",
        "ordered",
        "in_use",
        "spare",
        "under_repair",
        "quarantined",
        "retired",
        "disposed",
      ],
      asset_type: [
        "laptop",
        "desktop",
        "monitor",
        "server",
        "network_device",
        "accessory",
      ],
      assignment_status: [
        "pending_acceptance",
        "active",
        "pending_return",
        "returned",
      ],
      audit_action: ["create", "update", "delete", "assign", "unassign"],
      data_classification: ["public", "internal", "confidential", "restricted"],
      depreciation_model: ["straight_line"],
      employment_status: ["active", "left"],
      entity_type: [
        "employee",
        "asset",
        "assignment",
        "maintenance",
        "location",
        "profile",
      ],
      location_type: ["office", "storage", "server_room", "rack"],
      maintenance_type: [
        "formatting",
        "repair",
        "upgrade",
        "inspection",
        "replacement",
      ],
      ownership_type: ["TinextaCyber", "FDM", "ServiceFactory"],
      storage_health: ["healthy", "warning", "critical"],
      storage_type: ["HDD", "SSD", "NVMe"],
    },
  },
} as const
