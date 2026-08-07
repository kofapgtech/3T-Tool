// Auto-generated from the live Supabase schema via the Supabase MCP
// `generate_typescript_types` tool. Regenerate after any migration:
//   supabase gen types typescript --project-id asnsktfnvroawwvvpyqu > src/lib/database.types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bio_narratives: {
        Row: {
          narrative_id: number
          bio_id: number
          opportunity_statement: string | null
          economic_benefit: string | null
          organizational_benefit: string | null
          finance_benefit: string | null
          finance_financial_effect: string | null
          procurement_benefit: string | null
          procurement_financial_effect: string | null
          marketing_benefit: string | null
          marketing_financial_effect: string | null
          social_impact_benefit: string | null
          social_impact_financial_effect: string | null
          business_case_summary: string | null
          created_at: string
        }
        Insert: {
          narrative_id?: never
          bio_id: number
          opportunity_statement?: string | null
          economic_benefit?: string | null
          organizational_benefit?: string | null
          finance_benefit?: string | null
          finance_financial_effect?: string | null
          procurement_benefit?: string | null
          procurement_financial_effect?: string | null
          marketing_benefit?: string | null
          marketing_financial_effect?: string | null
          social_impact_benefit?: string | null
          social_impact_financial_effect?: string | null
          business_case_summary?: string | null
          created_at?: string
        }
        Update: {
          narrative_id?: never
          bio_id?: number
          opportunity_statement?: string | null
          economic_benefit?: string | null
          organizational_benefit?: string | null
          finance_benefit?: string | null
          finance_financial_effect?: string | null
          procurement_benefit?: string | null
          procurement_financial_effect?: string | null
          marketing_benefit?: string | null
          marketing_financial_effect?: string | null
          social_impact_benefit?: string | null
          social_impact_financial_effect?: string | null
          business_case_summary?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bio_narratives_bio_id_fkey"
            columns: ["bio_id"]
            isOneToOne: true
            referencedRelation: "business_impact_opportunities"
            referencedColumns: ["bio_id"]
          },
        ]
      }
      business_impact_opportunities: {
        Row: {
          bio_id: number
          business_case_supplement_1: string | null
          business_case_supplement_2: string | null
          business_case_supplement_3: string | null
          business_case_supplement_4: string | null
          business_impact_opportunity: string | null
          business_intelligence: string | null
          case_study: string | null
          description: string | null
          external_stakeholders: string | null
          financial_effect: string | null
          impact_opportunity_value: string | null
          internal_stakeholder_id: number | null
          kpi: string | null
          org_strategy: string | null
          social_business_impact_value: string | null
          step1_baseline: string | null
          step2_assumptions: string | null
          step3_projections: string | null
          tco_business_metric: string | null
          tco_cost_categories: string | null
          tco_cost_categories_explainer: string | null
          tco_line: string | null
          tco_use: string | null
          time_period_range: string | null
          unsdg_number: number | null
          url: string | null
        }
        Insert: {
          bio_id?: never
          business_case_supplement_1?: string | null
          business_case_supplement_2?: string | null
          business_case_supplement_3?: string | null
          business_case_supplement_4?: string | null
          business_impact_opportunity?: string | null
          business_intelligence?: string | null
          case_study?: string | null
          description?: string | null
          external_stakeholders?: string | null
          financial_effect?: string | null
          impact_opportunity_value?: string | null
          internal_stakeholder_id?: number | null
          kpi?: string | null
          org_strategy?: string | null
          social_business_impact_value?: string | null
          step1_baseline?: string | null
          step2_assumptions?: string | null
          step3_projections?: string | null
          tco_business_metric?: string | null
          tco_cost_categories?: string | null
          tco_cost_categories_explainer?: string | null
          tco_line?: string | null
          tco_use?: string | null
          time_period_range?: string | null
          unsdg_number?: number | null
          url?: string | null
        }
        Update: {
          bio_id?: never
          business_case_supplement_1?: string | null
          business_case_supplement_2?: string | null
          business_case_supplement_3?: string | null
          business_case_supplement_4?: string | null
          business_impact_opportunity?: string | null
          business_intelligence?: string | null
          case_study?: string | null
          description?: string | null
          external_stakeholders?: string | null
          financial_effect?: string | null
          impact_opportunity_value?: string | null
          internal_stakeholder_id?: number | null
          kpi?: string | null
          org_strategy?: string | null
          social_business_impact_value?: string | null
          step1_baseline?: string | null
          step2_assumptions?: string | null
          step3_projections?: string | null
          tco_business_metric?: string | null
          tco_cost_categories?: string | null
          tco_cost_categories_explainer?: string | null
          tco_line?: string | null
          tco_use?: string | null
          time_period_range?: string | null
          unsdg_number?: number | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_impact_opportunities_internal_stakeholder_id_fkey"
            columns: ["internal_stakeholder_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["stakeholder_id"]
          },
        ]
      }
      complementary_metrics: {
        Row: {
          metric_id: number
          related_increase_revenue_metrics: string | null
          related_lower_cost_metrics: string | null
          similar_metrics: string | null
          unsdg_number: number | null
        }
        Insert: {
          metric_id?: never
          related_increase_revenue_metrics?: string | null
          related_lower_cost_metrics?: string | null
          similar_metrics?: string | null
          unsdg_number?: number | null
        }
        Update: {
          metric_id?: never
          related_increase_revenue_metrics?: string | null
          related_lower_cost_metrics?: string | null
          similar_metrics?: string | null
          unsdg_number?: number | null
        }
        Relationships: []
      }
      cost_categories: {
        Row: {
          category_id: number
          cost_category_name: string | null
          explanation: string | null
          suggested_production_line_items: string | null
          suggested_services_line_items: string | null
        }
        Insert: {
          category_id?: never
          cost_category_name?: string | null
          explanation?: string | null
          suggested_production_line_items?: string | null
          suggested_services_line_items?: string | null
        }
        Update: {
          category_id?: never
          cost_category_name?: string | null
          explanation?: string | null
          suggested_production_line_items?: string | null
          suggested_services_line_items?: string | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string
          industry: string | null
          name: string
          org_id: number
        }
        Insert: {
          created_at?: string
          industry?: string | null
          name: string
          org_id?: never
        }
        Update: {
          created_at?: string
          industry?: string | null
          name?: string
          org_id?: never
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          is_active: boolean
          org_id: number
          role: Database["public"]["Enums"]["user_role"]
          work_email: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          is_active?: boolean
          org_id: number
          role?: Database["public"]["Enums"]["user_role"]
          work_email: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          org_id?: number
          role?: Database["public"]["Enums"]["user_role"]
          work_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["org_id"]
          },
        ]
      }
      project_business_value: {
        Row: {
          annual_added_revenue_year1: number
          annual_added_revenue_year2: number
          annual_added_revenue_year3: number
          created_at: string
          discount_rate: number
          implementation_services_cost: number
          initial_capital_cost: number
          other_one_time_cost: number
          project_id: number
          resale_residual_value: number
          training_cost: number
          updated_at: string
          value_record_id: number
        }
        Insert: {
          annual_added_revenue_year1?: number
          annual_added_revenue_year2?: number
          annual_added_revenue_year3?: number
          created_at?: string
          discount_rate?: number
          implementation_services_cost?: number
          initial_capital_cost?: number
          other_one_time_cost?: number
          project_id: number
          resale_residual_value?: number
          training_cost?: number
          updated_at?: string
          value_record_id?: never
        }
        Update: {
          annual_added_revenue_year1?: number
          annual_added_revenue_year2?: number
          annual_added_revenue_year3?: number
          created_at?: string
          discount_rate?: number
          implementation_services_cost?: number
          initial_capital_cost?: number
          other_one_time_cost?: number
          project_id?: number
          resale_residual_value?: number
          training_cost?: number
          updated_at?: string
          value_record_id?: never
        }
        Relationships: [
          {
            foreignKeyName: "project_business_value_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "project_financials"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_business_value_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "project_social_value"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_business_value_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
      project_costs: {
        Row: {
          baseline_year1: number
          baseline_year2: number
          baseline_year3: number
          classification: Database["public"]["Enums"]["cost_classification"]
          cost_category_id: number
          cost_record_id: number
          created_at: string
          line_item_label: string
          notes: string | null
          project_id: number
          projected_year1: number
          projected_year2: number
          projected_year3: number
          updated_at: string
        }
        Insert: {
          baseline_year1?: number
          baseline_year2?: number
          baseline_year3?: number
          classification?: Database["public"]["Enums"]["cost_classification"]
          cost_category_id: number
          cost_record_id?: never
          created_at?: string
          line_item_label?: string
          notes?: string | null
          project_id: number
          projected_year1?: number
          projected_year2?: number
          projected_year3?: number
          updated_at?: string
        }
        Update: {
          baseline_year1?: number
          baseline_year2?: number
          baseline_year3?: number
          classification?: Database["public"]["Enums"]["cost_classification"]
          cost_category_id?: number
          cost_record_id?: never
          created_at?: string
          line_item_label?: string
          notes?: string | null
          project_id?: number
          projected_year1?: number
          projected_year2?: number
          projected_year3?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_costs_cost_category_id_fkey"
            columns: ["cost_category_id"]
            isOneToOne: false
            referencedRelation: "cost_categories"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "project_costs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_financials"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_costs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_social_value"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_costs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
        ]
      }
      project_submissions: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["submission_category"]
          co2e_avoided_mt: number
          created_at: string
          evidence_file_path: string | null
          impact_area: string | null
          impact_score: number | null
          org_id: number
          project_id: number
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          social_value: number
          status: Database["public"]["Enums"]["audit_status"]
          submission_date: string
          submission_id: number
          submission_title: string
          submitted_by: string | null
          submitter_email: string | null
          supplier_id: number | null
          unsdg_alignment: number[]
          updated_at: string
        }
        Insert: {
          amount?: number
          category: Database["public"]["Enums"]["submission_category"]
          co2e_avoided_mt?: number
          created_at?: string
          evidence_file_path?: string | null
          impact_area?: string | null
          impact_score?: number | null
          org_id: number
          project_id: number
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_value?: number
          status?: Database["public"]["Enums"]["audit_status"]
          submission_date?: string
          submission_id?: never
          submission_title: string
          submitted_by?: string | null
          submitter_email?: string | null
          supplier_id?: number | null
          unsdg_alignment?: number[]
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["submission_category"]
          co2e_avoided_mt?: number
          created_at?: string
          evidence_file_path?: string | null
          impact_area?: string | null
          impact_score?: number | null
          org_id?: number
          project_id?: number
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_value?: number
          status?: Database["public"]["Enums"]["audit_status"]
          submission_date?: string
          submission_id?: never
          submission_title?: string
          submitted_by?: string | null
          submitter_email?: string | null
          supplier_id?: number | null
          unsdg_alignment?: number[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_submissions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "project_submissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_financials"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_submissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_social_value"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_submissions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_submissions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_submissions_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_submissions_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["supplier_id"]
          },
        ]
      }
      projects: {
        Row: {
          allocated_spend: number
          bio_id: number | null
          bios_description: string | null
          created_at: string | null
          created_by: string | null
          lead_department: string | null
          org_id: number | null
          project_code: string | null
          project_id: number
          project_name: string | null
          social_value_generated: number
          status: Database["public"]["Enums"]["project_status"]
          target_unsdgs: number[]
          total_budget: number
          updated_at: string
        }
        Insert: {
          allocated_spend?: number
          bio_id?: number | null
          bios_description?: string | null
          created_at?: string | null
          created_by?: string | null
          lead_department?: string | null
          org_id?: number | null
          project_code?: string | null
          project_id?: never
          project_name?: string | null
          social_value_generated?: number
          status?: Database["public"]["Enums"]["project_status"]
          target_unsdgs?: number[]
          total_budget?: number
          updated_at?: string
        }
        Update: {
          allocated_spend?: number
          bio_id?: number | null
          bios_description?: string | null
          created_at?: string | null
          created_by?: string | null
          lead_department?: string | null
          org_id?: number | null
          project_code?: string | null
          project_id?: never
          project_name?: string | null
          social_value_generated?: number
          status?: Database["public"]["Enums"]["project_status"]
          target_unsdgs?: number[]
          total_budget?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_bio_id_fkey"
            columns: ["bio_id"]
            isOneToOne: false
            referencedRelation: "business_impact_opportunities"
            referencedColumns: ["bio_id"]
          },
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["org_id"]
          },
        ]
      }
      simulations: {
        Row: {
          bio_id: number
          created_at: string
          impact_multiplier: number | null
          org_id: number
          program_spend: number
          project_id: number | null
          results: Json
          run_by: string | null
          scenario_name: string | null
          simulation_id: number
          social_value: number | null
        }
        Insert: {
          bio_id: number
          created_at?: string
          impact_multiplier?: number | null
          org_id: number
          program_spend: number
          project_id?: number | null
          results?: Json
          run_by?: string | null
          scenario_name?: string | null
          simulation_id?: never
          social_value?: number | null
        }
        Update: {
          bio_id?: number
          created_at?: string
          impact_multiplier?: number | null
          org_id?: number
          program_spend?: number
          project_id?: number | null
          results?: Json
          run_by?: string | null
          scenario_name?: string | null
          simulation_id?: never
          social_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "simulations_bio_id_fkey"
            columns: ["bio_id"]
            isOneToOne: false
            referencedRelation: "business_impact_opportunities"
            referencedColumns: ["bio_id"]
          },
          {
            foreignKeyName: "simulations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "simulations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_financials"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "simulations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_social_value"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "simulations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "simulations_run_by_fkey"
            columns: ["run_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_impact_metrics: {
        Row: {
          case_study_name: string | null
          case_study_url: string | null
          internal_stakeholder_id: number | null
          multiplier: number | null
          social_impact_id: number
          social_impact_to_society: string | null
          unit_of_impact: string | null
          unsdg_number: number | null
        }
        Insert: {
          case_study_name?: string | null
          case_study_url?: string | null
          internal_stakeholder_id?: number | null
          multiplier?: number | null
          social_impact_id?: never
          social_impact_to_society?: string | null
          unit_of_impact?: string | null
          unsdg_number?: number | null
        }
        Update: {
          case_study_name?: string | null
          case_study_url?: string | null
          internal_stakeholder_id?: number | null
          multiplier?: number | null
          social_impact_id?: never
          social_impact_to_society?: string | null
          unit_of_impact?: string | null
          unsdg_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "social_impact_metrics_internal_stakeholder_id_fkey"
            columns: ["internal_stakeholder_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["stakeholder_id"]
          },
        ]
      }
      stakeholders: {
        Row: {
          description: string | null
          stakeholder_group: string | null
          stakeholder_id: number
          stakeholder_type: string | null
        }
        Insert: {
          description?: string | null
          stakeholder_group?: string | null
          stakeholder_id?: never
          stakeholder_type?: string | null
        }
        Update: {
          description?: string | null
          stakeholder_group?: string | null
          stakeholder_id?: never
          stakeholder_type?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          contact_email: string | null
          created_at: string
          is_local: boolean
          is_mwbe: boolean
          is_sdvob: boolean
          org_id: number
          primary_esg_focus: string | null
          supplier_id: number
          supplier_name: string
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          is_local?: boolean
          is_mwbe?: boolean
          is_sdvob?: boolean
          org_id: number
          primary_esg_focus?: string | null
          supplier_id?: never
          supplier_name: string
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          is_local?: boolean
          is_mwbe?: boolean
          is_sdvob?: boolean
          org_id?: number
          primary_esg_focus?: string | null
          supplier_id?: never
          supplier_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["org_id"]
          },
        ]
      }
    }
    Views: {
      project_financials: {
        Row: {
          annual_added_revenue_y1: number | null
          annual_added_revenue_y2: number | null
          annual_added_revenue_y3: number | null
          annual_cost_savings_y1: number | null
          annual_cost_savings_y2: number | null
          annual_cost_savings_y3: number | null
          baseline_annual_cost: number | null
          bios_program_cost_y1: number | null
          bios_program_cost_y2: number | null
          bios_program_cost_y3: number | null
          discount_rate: number | null
          implementation_services_cost: number | null
          initial_capital_cost: number | null
          net_benefit_y1: number | null
          net_benefit_y2: number | null
          net_benefit_y3: number | null
          net_tvo: number | null
          npv_of_annual_benefits: number | null
          other_one_time_cost: number | null
          project_id: number | null
          pv_of_residual: number | null
          resale_residual_value: number | null
          simple_roi_percentage: number | null
          total_one_time_cost: number | null
          training_cost: number | null
          tvo_per_dollar_invested: number | null
        }
        Relationships: []
      }
      project_social_value: {
        Row: {
          bio_id: number | null
          business_impact_opportunity: string | null
          impact_multiplier: number | null
          multiplier_missing: boolean | null
          program_spend_3yr: number | null
          project_id: number | null
          total_social_value_of_ownership: number | null
          unit_of_impact: string | null
          unsdg_number: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_bio_id_fkey"
            columns: ["bio_id"]
            isOneToOne: false
            referencedRelation: "business_impact_opportunities"
            referencedColumns: ["bio_id"]
          },
        ]
      }
    }
    Functions: {
      can_audit: { Args: Record<PropertyKey, never>; Returns: boolean }
      can_write_procurement: { Args: Record<PropertyKey, never>; Returns: boolean }
      current_org_id: { Args: Record<PropertyKey, never>; Returns: number }
      current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: {
        Args: { roles: Database["public"]["Enums"]["user_role"][] }
        Returns: boolean
      }
    }
    Enums: {
      audit_status: "Verified" | "Pending Audit" | "In Review"
      cost_classification: "Direct" | "Indirect"
      project_status: "Planning" | "Active" | "Completed"
      submission_category:
        | "Eco-Services"
        | "Logistics"
        | "Local Goods"
        | "Technology"
        | "Facilities"
      user_role:
        | "admin"
        | "procurement_manager"
        | "esg_auditor"
        | "cpo_viewer"
        | "diversity_viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database["public"]

export type Tables<
  T extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]),
> = (DefaultSchema["Tables"] & DefaultSchema["Views"])[T] extends { Row: infer R }
  ? R
  : never

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T] extends { Insert: infer I } ? I : never

export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T] extends { Update: infer U } ? U : never

export type Enums<T extends keyof DefaultSchema["Enums"]> = DefaultSchema["Enums"][T]
