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
      enterprises: {
        Row: {
          address: string | null
          bank_account_name: string | null
          bank_account_no: string | null
          bank_account_type: string | null
          bank_name: string | null
          branch_type: string | null
          business_mode: string | null
          business_reg_no: string | null
          city: string | null
          company_email: string | null
          coordinate: string | null
          created_at: string
          description: string | null
          enterprise_name: string
          facebook: string | null
          id: string
          instagram: string | null
          logo_url: string | null
          office_phone: string | null
          pic_name: string | null
          postcode: string | null
          register_date: string
          state: string | null
          street_detail: string | null
          tagline: string | null
          updated_at: string
          user_id: string
          version: string | null
          whatsapp_no: string | null
        }
        Insert: {
          address?: string | null
          bank_account_name?: string | null
          bank_account_no?: string | null
          bank_account_type?: string | null
          bank_name?: string | null
          branch_type?: string | null
          business_mode?: string | null
          business_reg_no?: string | null
          city?: string | null
          company_email?: string | null
          coordinate?: string | null
          created_at?: string
          description?: string | null
          enterprise_name: string
          facebook?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          office_phone?: string | null
          pic_name?: string | null
          postcode?: string | null
          register_date?: string
          state?: string | null
          street_detail?: string | null
          tagline?: string | null
          updated_at?: string
          user_id: string
          version?: string | null
          whatsapp_no?: string | null
        }
        Update: {
          address?: string | null
          bank_account_name?: string | null
          bank_account_no?: string | null
          bank_account_type?: string | null
          bank_name?: string | null
          branch_type?: string | null
          business_mode?: string | null
          business_reg_no?: string | null
          city?: string | null
          company_email?: string | null
          coordinate?: string | null
          created_at?: string
          description?: string | null
          enterprise_name?: string
          facebook?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          office_phone?: string | null
          pic_name?: string | null
          postcode?: string | null
          register_date?: string
          state?: string | null
          street_detail?: string | null
          tagline?: string | null
          updated_at?: string
          user_id?: string
          version?: string | null
          whatsapp_no?: string | null
        }
        Relationships: []
      }
      loyalty_program_contest: {
        Row: {
          created_at: string
          id: string
          is_deleted: boolean
          merchant_account_id: string
          program_description: string | null
          program_name: string
          program_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_deleted?: boolean
          merchant_account_id: string
          program_description?: string | null
          program_name: string
          program_status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_deleted?: boolean
          merchant_account_id?: string
          program_description?: string | null
          program_name?: string
          program_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_program_coupon: {
        Row: {
          created_at: string
          id: string
          is_deleted: boolean
          merchant_account_id: string
          program_description: string | null
          program_name: string
          program_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_deleted?: boolean
          merchant_account_id: string
          program_description?: string | null
          program_name: string
          program_status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_deleted?: boolean
          merchant_account_id?: string
          program_description?: string | null
          program_name?: string
          program_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_program_discount: {
        Row: {
          created_at: string
          id: string
          is_deleted: boolean
          merchant_account_id: string
          program_description: string | null
          program_name: string
          program_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_deleted?: boolean
          merchant_account_id: string
          program_description?: string | null
          program_name: string
          program_status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_deleted?: boolean
          merchant_account_id?: string
          program_description?: string | null
          program_name?: string
          program_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_program_event: {
        Row: {
          created_at: string
          id: string
          is_deleted: boolean
          merchant_account_id: string
          program_description: string | null
          program_name: string
          program_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_deleted?: boolean
          merchant_account_id: string
          program_description?: string | null
          program_name: string
          program_status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_deleted?: boolean
          merchant_account_id?: string
          program_description?: string | null
          program_name?: string
          program_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_program_master: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          is_deleted: boolean
          loyalty_program_record_id: string
          loyalty_program_type: Database["public"]["Enums"]["loyalty_program_module_type"]
          merchant_account_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean
          loyalty_program_record_id: string
          loyalty_program_type: Database["public"]["Enums"]["loyalty_program_module_type"]
          merchant_account_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean
          loyalty_program_record_id?: string
          loyalty_program_type?: Database["public"]["Enums"]["loyalty_program_module_type"]
          merchant_account_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_program_point: {
        Row: {
          created_at: string
          id: string
          is_deleted: boolean
          merchant_account_id: string
          program_description: string | null
          program_name: string
          program_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_deleted?: boolean
          merchant_account_id: string
          program_description?: string | null
          program_name: string
          program_status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_deleted?: boolean
          merchant_account_id?: string
          program_description?: string | null
          program_name?: string
          program_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_program_referral: {
        Row: {
          created_at: string
          id: string
          is_deleted: boolean
          merchant_account_id: string
          program_description: string | null
          program_name: string
          program_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_deleted?: boolean
          merchant_account_id: string
          program_description?: string | null
          program_name: string
          program_status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_deleted?: boolean
          merchant_account_id?: string
          program_description?: string | null
          program_name?: string
          program_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_program_stamp: {
        Row: {
          campaign_end_date: string | null
          campaign_start_date: string | null
          created_at: string
          id: string
          is_campaign_date_required: boolean
          is_deleted: boolean
          is_popup_stamp_rule: boolean
          merchant_account_id: string
          program_description: string | null
          program_name: string
          program_status: string
          stamp_campaign_code: string | null
          stamp_card_type: string
          stamp_rule_amount: number
          stamp_rule_descriptions: string | null
          subscribers_count: number
          updated_at: string
        }
        Insert: {
          campaign_end_date?: string | null
          campaign_start_date?: string | null
          created_at?: string
          id?: string
          is_campaign_date_required?: boolean
          is_deleted?: boolean
          is_popup_stamp_rule?: boolean
          merchant_account_id: string
          program_description?: string | null
          program_name: string
          program_status?: string
          stamp_campaign_code?: string | null
          stamp_card_type?: string
          stamp_rule_amount?: number
          stamp_rule_descriptions?: string | null
          subscribers_count?: number
          updated_at?: string
        }
        Update: {
          campaign_end_date?: string | null
          campaign_start_date?: string | null
          created_at?: string
          id?: string
          is_campaign_date_required?: boolean
          is_deleted?: boolean
          is_popup_stamp_rule?: boolean
          merchant_account_id?: string
          program_description?: string | null
          program_name?: string
          program_status?: string
          stamp_campaign_code?: string | null
          stamp_card_type?: string
          stamp_rule_amount?: number
          stamp_rule_descriptions?: string | null
          subscribers_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_program_stamp_subscriber: {
        Row: {
          batch: number
          created_at: string
          id: string
          is_redeem_item: string
          loyalty_program_stampcard_id: string
          merchant_account_id: string
          perk_description: string | null
          perk_image_url: string | null
          perk_title: string | null
          reward_value_text: string | null
          slot_label: string | null
          slot_no: number
          slot_type: string
          sort_order: number
          stamped_by: string | null
          stamped_date: string | null
          stamped_method: string | null
          stamped_redeem_status: string | null
          stamped_status: string
          subscriber_accno: string
          updated_at: string
        }
        Insert: {
          batch?: number
          created_at?: string
          id?: string
          is_redeem_item?: string
          loyalty_program_stampcard_id: string
          merchant_account_id: string
          perk_description?: string | null
          perk_image_url?: string | null
          perk_title?: string | null
          reward_value_text?: string | null
          slot_label?: string | null
          slot_no: number
          slot_type?: string
          sort_order?: number
          stamped_by?: string | null
          stamped_date?: string | null
          stamped_method?: string | null
          stamped_redeem_status?: string | null
          stamped_status?: string
          subscriber_accno: string
          updated_at?: string
        }
        Update: {
          batch?: number
          created_at?: string
          id?: string
          is_redeem_item?: string
          loyalty_program_stampcard_id?: string
          merchant_account_id?: string
          perk_description?: string | null
          perk_image_url?: string | null
          perk_title?: string | null
          reward_value_text?: string | null
          slot_label?: string | null
          slot_no?: number
          slot_type?: string
          sort_order?: number
          stamped_by?: string | null
          stamped_date?: string | null
          stamped_method?: string | null
          stamped_redeem_status?: string | null
          stamped_status?: string
          subscriber_accno?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_program_stamp_subscri_loyalty_program_stampcard_id_fkey"
            columns: ["loyalty_program_stampcard_id"]
            isOneToOne: false
            referencedRelation: "loyalty_program_stampcard"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_program_stampcard: {
        Row: {
          background_image_url: string | null
          campaign_name_display: string | null
          contact_us_title: string | null
          created_at: string
          enterprise_name_display: string | null
          expiry_text_display: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          is_nfc_enabled: boolean
          is_qr_enabled: boolean
          logo_image_url: string | null
          loyalty_program_stamp_id: string
          merchant_account_id: string
          primary_theme_color: string | null
          qr_box_label: string | null
          reward_box_label: string | null
          secondary_theme_color: string | null
          show_facebook: boolean
          show_instagram: boolean
          show_whatsapp: boolean
          stamp_rule_note_text: string | null
          stampcard_name: string
          stampcard_title: string | null
          status: string
          total_stamp_slots: number
          updated_at: string
          whatsapp_url: string | null
        }
        Insert: {
          background_image_url?: string | null
          campaign_name_display?: string | null
          contact_us_title?: string | null
          created_at?: string
          enterprise_name_display?: string | null
          expiry_text_display?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          is_nfc_enabled?: boolean
          is_qr_enabled?: boolean
          logo_image_url?: string | null
          loyalty_program_stamp_id: string
          merchant_account_id: string
          primary_theme_color?: string | null
          qr_box_label?: string | null
          reward_box_label?: string | null
          secondary_theme_color?: string | null
          show_facebook?: boolean
          show_instagram?: boolean
          show_whatsapp?: boolean
          stamp_rule_note_text?: string | null
          stampcard_name: string
          stampcard_title?: string | null
          status?: string
          total_stamp_slots?: number
          updated_at?: string
          whatsapp_url?: string | null
        }
        Update: {
          background_image_url?: string | null
          campaign_name_display?: string | null
          contact_us_title?: string | null
          created_at?: string
          enterprise_name_display?: string | null
          expiry_text_display?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          is_nfc_enabled?: boolean
          is_qr_enabled?: boolean
          logo_image_url?: string | null
          loyalty_program_stamp_id?: string
          merchant_account_id?: string
          primary_theme_color?: string | null
          qr_box_label?: string | null
          reward_box_label?: string | null
          secondary_theme_color?: string | null
          show_facebook?: boolean
          show_instagram?: boolean
          show_whatsapp?: boolean
          stamp_rule_note_text?: string | null
          stampcard_name?: string
          stampcard_title?: string | null
          status?: string
          total_stamp_slots?: number
          updated_at?: string
          whatsapp_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_program_stampcard_loyalty_program_stamp_id_fkey"
            columns: ["loyalty_program_stamp_id"]
            isOneToOne: true
            referencedRelation: "loyalty_program_stamp"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_program_stampcard_slots: {
        Row: {
          created_at: string
          id: string
          is_redeem_item: string
          loyalty_program_stampcard_id: string
          merchant_account_id: string
          perk_description: string | null
          perk_image_url: string | null
          perk_title: string | null
          reward_value_text: string | null
          slot_label: string | null
          slot_no: number
          slot_type: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_redeem_item?: string
          loyalty_program_stampcard_id: string
          merchant_account_id: string
          perk_description?: string | null
          perk_image_url?: string | null
          perk_title?: string | null
          reward_value_text?: string | null
          slot_label?: string | null
          slot_no: number
          slot_type?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_redeem_item?: string
          loyalty_program_stampcard_id?: string
          merchant_account_id?: string
          perk_description?: string | null
          perk_image_url?: string | null
          perk_title?: string | null
          reward_value_text?: string | null
          slot_label?: string | null
          slot_no?: number
          slot_type?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_program_stampcard_slo_loyalty_program_stampcard_id_fkey"
            columns: ["loyalty_program_stampcard_id"]
            isOneToOne: false
            referencedRelation: "loyalty_program_stampcard"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_program_voucher: {
        Row: {
          created_at: string
          id: string
          is_deleted: boolean
          merchant_account_id: string
          program_description: string | null
          program_name: string
          program_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_deleted?: boolean
          merchant_account_id: string
          program_description?: string | null
          program_name: string
          program_status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_deleted?: boolean
          merchant_account_id?: string
          program_description?: string | null
          program_name?: string
          program_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      membership_card_loyalty_programs: {
        Row: {
          created_at: string
          id: string
          linked_at: string | null
          loyalty_program_record_id: string
          loyalty_program_type: Database["public"]["Enums"]["loyalty_program_module_type"]
          membership_card_id: string
          merchant_account_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          linked_at?: string | null
          loyalty_program_record_id: string
          loyalty_program_type: Database["public"]["Enums"]["loyalty_program_module_type"]
          membership_card_id: string
          merchant_account_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          linked_at?: string | null
          loyalty_program_record_id?: string
          loyalty_program_type?: Database["public"]["Enums"]["loyalty_program_module_type"]
          membership_card_id?: string
          merchant_account_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_card_loyalty_programs_membership_card_id_fkey"
            columns: ["membership_card_id"]
            isOneToOne: false
            referencedRelation: "membership_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_cards: {
        Row: {
          card_description: string | null
          card_image_back_url: string | null
          card_image_front_url: string | null
          card_image_url: string | null
          card_level: string | null
          card_name: string
          card_status: Database["public"]["Enums"]["membership_card_status"]
          card_type: string | null
          created_at: string
          fee_payment_cycle: string | null
          id: string
          is_deleted: boolean
          max_members: number | null
          merchant_account_id: string
          terms_conditions: string | null
          updated_at: string
          validity_end: string | null
          validity_start: string | null
        }
        Insert: {
          card_description?: string | null
          card_image_back_url?: string | null
          card_image_front_url?: string | null
          card_image_url?: string | null
          card_level?: string | null
          card_name: string
          card_status?: Database["public"]["Enums"]["membership_card_status"]
          card_type?: string | null
          created_at?: string
          fee_payment_cycle?: string | null
          id?: string
          is_deleted?: boolean
          max_members?: number | null
          merchant_account_id: string
          terms_conditions?: string | null
          updated_at?: string
          validity_end?: string | null
          validity_start?: string | null
        }
        Update: {
          card_description?: string | null
          card_image_back_url?: string | null
          card_image_front_url?: string | null
          card_image_url?: string | null
          card_level?: string | null
          card_name?: string
          card_status?: Database["public"]["Enums"]["membership_card_status"]
          card_type?: string | null
          created_at?: string
          fee_payment_cycle?: string | null
          id?: string
          is_deleted?: boolean
          max_members?: number | null
          merchant_account_id?: string
          terms_conditions?: string | null
          updated_at?: string
          validity_end?: string | null
          validity_start?: string | null
        }
        Relationships: []
      }
      merchant_quota_overrides: {
        Row: {
          created_at: string
          effective_from: string | null
          effective_to: string | null
          id: string
          is_active: boolean
          merchant_account_id: string
          override_price_per_extra_unit: number | null
          override_quota: number
          override_reason: string | null
          resource_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          is_active?: boolean
          merchant_account_id: string
          override_price_per_extra_unit?: number | null
          override_quota?: number
          override_reason?: string | null
          resource_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          is_active?: boolean
          merchant_account_id?: string
          override_price_per_extra_unit?: number | null
          override_quota?: number
          override_reason?: string | null
          resource_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      merchant_quotas: {
        Row: {
          created_at: string
          entitlement_status: string
          id: string
          max_loyalty_programs: number | null
          max_membership_cards: number | null
          merchant_account_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          entitlement_status?: string
          id?: string
          max_loyalty_programs?: number | null
          max_membership_cards?: number | null
          merchant_account_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          entitlement_status?: string
          id?: string
          max_loyalty_programs?: number | null
          max_membership_cards?: number | null
          merchant_account_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      merchant_users: {
        Row: {
          account_name: string
          created_at: string
          email: string
          id: string
          is_deleted: boolean
          last_login_date: string | null
          merchant_account_id: string
          password_hash: string
          phone_number: string
          profile_image_url: string | null
          register_date: string
          updated_at: string
          user_status: Database["public"]["Enums"]["merchant_user_status"]
          user_type: Database["public"]["Enums"]["merchant_user_type"]
          username: string
        }
        Insert: {
          account_name: string
          created_at?: string
          email: string
          id?: string
          is_deleted?: boolean
          last_login_date?: string | null
          merchant_account_id: string
          password_hash: string
          phone_number: string
          profile_image_url?: string | null
          register_date?: string
          updated_at?: string
          user_status?: Database["public"]["Enums"]["merchant_user_status"]
          user_type?: Database["public"]["Enums"]["merchant_user_type"]
          username: string
        }
        Update: {
          account_name?: string
          created_at?: string
          email?: string
          id?: string
          is_deleted?: boolean
          last_login_date?: string | null
          merchant_account_id?: string
          password_hash?: string
          phone_number?: string
          profile_image_url?: string | null
          register_date?: string
          updated_at?: string
          user_status?: Database["public"]["Enums"]["merchant_user_status"]
          user_type?: Database["public"]["Enums"]["merchant_user_type"]
          username?: string
        }
        Relationships: []
      }
      monetization_config: {
        Row: {
          created_at: string
          currency: string
          default_free_quota: number
          effective_from: string | null
          effective_to: string | null
          extra_unit_price: number | null
          id: string
          is_active: boolean
          resource_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          default_free_quota?: number
          effective_from?: string | null
          effective_to?: string | null
          extra_unit_price?: number | null
          id?: string
          is_active?: boolean
          resource_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          default_free_quota?: number
          effective_from?: string | null
          effective_to?: string | null
          extra_unit_price?: number | null
          id?: string
          is_active?: boolean
          resource_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          merchant_account_id: string
          role: Database["public"]["Enums"]["merchant_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          merchant_account_id: string
          role?: Database["public"]["Enums"]["merchant_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          merchant_account_id?: string
          role?: Database["public"]["Enums"]["merchant_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_subscriber_stamp_rows: {
        Args: {
          p_batch?: number
          p_loyalty_program_stampcard_id: string
          p_merchant_account_id: string
          p_subscriber_accno: string
        }
        Returns: number
      }
      get_merchant_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["merchant_role"]
      }
      has_merchant_role: {
        Args: {
          _role: Database["public"]["Enums"]["merchant_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      loyalty_program_module_type:
        | "stamp"
        | "point"
        | "discount"
        | "voucher"
        | "contest"
        | "event"
        | "coupon"
        | "referral"
      membership_card_status: "Active" | "Inactive"
      merchant_role: "merchant_owner" | "merchant_admin" | "merchant_staff"
      merchant_user_status: "Active" | "Inactive"
      merchant_user_type: "Administrator" | "Owner" | "Staff"
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
      loyalty_program_module_type: [
        "stamp",
        "point",
        "discount",
        "voucher",
        "contest",
        "event",
        "coupon",
        "referral",
      ],
      membership_card_status: ["Active", "Inactive"],
      merchant_role: ["merchant_owner", "merchant_admin", "merchant_staff"],
      merchant_user_status: ["Active", "Inactive"],
      merchant_user_type: ["Administrator", "Owner", "Staff"],
    },
  },
} as const
