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
      audits: {
        Row: {
          created_at: string | null
          department: string | null
          end_date: string | null
          findings_count: number | null
          id: string
          lead_auditor_id: string | null
          major_findings: number | null
          minor_findings: number | null
          report_url: string | null
          scope: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["audit_status"]
          title: string
          type: Database["public"]["Enums"]["audit_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          end_date?: string | null
          findings_count?: number | null
          id?: string
          lead_auditor_id?: string | null
          major_findings?: number | null
          minor_findings?: number | null
          report_url?: string | null
          scope?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["audit_status"]
          title: string
          type?: Database["public"]["Enums"]["audit_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          end_date?: string | null
          findings_count?: number | null
          id?: string
          lead_auditor_id?: string | null
          major_findings?: number | null
          minor_findings?: number | null
          report_url?: string | null
          scope?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["audit_status"]
          title?: string
          type?: Database["public"]["Enums"]["audit_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      capa_actions: {
        Row: {
          capa_number: string | null
          closed_date: string | null
          created_at: string | null
          department: string | null
          description: string | null
          due_date: string | null
          effectiveness: string | null
          id: string
          nc_id: string | null
          owner_id: string | null
          priority: Database["public"]["Enums"]["capa_priority"]
          root_cause: string | null
          source: string | null
          source_reference: string | null
          status: Database["public"]["Enums"]["capa_status"]
          title: string
          type: Database["public"]["Enums"]["capa_type"]
          updated_at: string | null
          verification_required: boolean | null
        }
        Insert: {
          capa_number?: string | null
          closed_date?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          due_date?: string | null
          effectiveness?: string | null
          id?: string
          nc_id?: string | null
          owner_id?: string | null
          priority?: Database["public"]["Enums"]["capa_priority"]
          root_cause?: string | null
          source?: string | null
          source_reference?: string | null
          status?: Database["public"]["Enums"]["capa_status"]
          title: string
          type?: Database["public"]["Enums"]["capa_type"]
          updated_at?: string | null
          verification_required?: boolean | null
        }
        Update: {
          capa_number?: string | null
          closed_date?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          due_date?: string | null
          effectiveness?: string | null
          id?: string
          nc_id?: string | null
          owner_id?: string | null
          priority?: Database["public"]["Enums"]["capa_priority"]
          root_cause?: string | null
          source?: string | null
          source_reference?: string | null
          status?: Database["public"]["Enums"]["capa_status"]
          title?: string
          type?: Database["public"]["Enums"]["capa_type"]
          updated_at?: string | null
          verification_required?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "capa_actions_nc_id_fkey"
            columns: ["nc_id"]
            isOneToOne: false
            referencedRelation: "nonconformities"
            referencedColumns: ["id"]
          },
        ]
      }
      capa_evidence: {
        Row: {
          capa_id: string
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          uploaded_by: string | null
        }
        Insert: {
          capa_id: string
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          uploaded_by?: string | null
        }
        Update: {
          capa_id?: string
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "capa_evidence_capa_id_fkey"
            columns: ["capa_id"]
            isOneToOne: false
            referencedRelation: "capa_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      clause_audit_trail: {
        Row: {
          action_type: string
          clause_id: string
          created_at: string
          details: Json | null
          id: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          clause_id: string
          created_at?: string
          details?: Json | null
          id?: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          clause_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clause_audit_trail_clause_id_fkey"
            columns: ["clause_id"]
            isOneToOne: false
            referencedRelation: "iso_clauses"
            referencedColumns: ["id"]
          },
        ]
      }
      clause_document_links: {
        Row: {
          clause_id: string
          created_at: string
          document_id: string
          id: string
          linked_by: string | null
        }
        Insert: {
          clause_id: string
          created_at?: string
          document_id: string
          id?: string
          linked_by?: string | null
        }
        Update: {
          clause_id?: string
          created_at?: string
          document_id?: string
          id?: string
          linked_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clause_document_links_clause_id_fkey"
            columns: ["clause_id"]
            isOneToOne: false
            referencedRelation: "iso_clauses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clause_document_links_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      clause_evidence: {
        Row: {
          clause_id: string
          created_at: string
          description: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          uploaded_by: string | null
        }
        Insert: {
          clause_id: string
          created_at?: string
          description?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          uploaded_by?: string | null
        }
        Update: {
          clause_id?: string
          created_at?: string
          description?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clause_evidence_clause_id_fkey"
            columns: ["clause_id"]
            isOneToOne: false
            referencedRelation: "iso_clauses"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          clause: string | null
          content: string | null
          created_at: string | null
          document_number: string | null
          file_url: string | null
          id: string
          owner_id: string | null
          status: Database["public"]["Enums"]["document_status"]
          title: string
          type: Database["public"]["Enums"]["document_type"]
          updated_at: string | null
          version: string | null
        }
        Insert: {
          clause?: string | null
          content?: string | null
          created_at?: string | null
          document_number?: string | null
          file_url?: string | null
          id?: string
          owner_id?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          title: string
          type?: Database["public"]["Enums"]["document_type"]
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          clause?: string | null
          content?: string | null
          created_at?: string | null
          document_number?: string | null
          file_url?: string | null
          id?: string
          owner_id?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          title?: string
          type?: Database["public"]["Enums"]["document_type"]
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      email_notifications: {
        Row: {
          created_at: string
          email_type: string
          error_message: string | null
          id: string
          metadata: Json | null
          recipient_email: string
          recipient_name: string | null
          sent_at: string | null
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email_type: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email: string
          recipient_name?: string | null
          sent_at?: string | null
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          email_type?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email?: string
          recipient_name?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          certifications: string[] | null
          created_at: string | null
          department: string | null
          email: string
          employee_number: string | null
          full_name: string
          hire_date: string | null
          id: string
          job_title: string | null
          phone: string | null
          skills: string[] | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          certifications?: string[] | null
          created_at?: string | null
          department?: string | null
          email: string
          employee_number?: string | null
          full_name: string
          hire_date?: string | null
          id?: string
          job_title?: string | null
          phone?: string | null
          skills?: string[] | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          certifications?: string[] | null
          created_at?: string | null
          department?: string | null
          email?: string
          employee_number?: string | null
          full_name?: string
          hire_date?: string | null
          id?: string
          job_title?: string | null
          phone?: string | null
          skills?: string[] | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      iso_clauses: {
        Row: {
          clause_number: string
          created_at: string | null
          description: string | null
          id: string
          standard: string
          title: string
        }
        Insert: {
          clause_number: string
          created_at?: string | null
          description?: string | null
          id?: string
          standard: string
          title: string
        }
        Update: {
          clause_number?: string
          created_at?: string | null
          description?: string | null
          id?: string
          standard?: string
          title?: string
        }
        Relationships: []
      }
      kpis: {
        Row: {
          category: string | null
          created_at: string | null
          current_value: number | null
          id: string
          last_updated: string | null
          name: string
          target_value: number | null
          trend: string | null
          unit: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          last_updated?: string | null
          name: string
          target_value?: number | null
          trend?: string | null
          unit?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          last_updated?: string | null
          name?: string
          target_value?: number | null
          trend?: string | null
          unit?: string | null
        }
        Relationships: []
      }
      management_reviews: {
        Row: {
          attendees: string[] | null
          created_at: string | null
          created_by: string | null
          id: string
          meeting_date: string
          notes: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          attendees?: string[] | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          meeting_date: string
          notes?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          attendees?: string[] | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          meeting_date?: string
          notes?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      nonconformities: {
        Row: {
          audit_id: string | null
          clause: string | null
          closed_date: string | null
          created_at: string | null
          department: string | null
          description: string | null
          due_date: string | null
          evidence_url: string | null
          id: string
          nc_number: string | null
          owner_id: string | null
          root_cause: string | null
          source: string | null
          status: Database["public"]["Enums"]["nc_status"]
          title: string
          type: Database["public"]["Enums"]["nc_type"]
          updated_at: string | null
        }
        Insert: {
          audit_id?: string | null
          clause?: string | null
          closed_date?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          due_date?: string | null
          evidence_url?: string | null
          id?: string
          nc_number?: string | null
          owner_id?: string | null
          root_cause?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["nc_status"]
          title: string
          type?: Database["public"]["Enums"]["nc_type"]
          updated_at?: string | null
        }
        Update: {
          audit_id?: string | null
          clause?: string | null
          closed_date?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          due_date?: string | null
          evidence_url?: string | null
          id?: string
          nc_number?: string | null
          owner_id?: string | null
          root_cause?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["nc_status"]
          title?: string
          type?: Database["public"]["Enums"]["nc_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nonconformities_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "audits"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string | null
          date_range_end: string | null
          date_range_start: string | null
          file_size: string | null
          file_url: string | null
          format: string | null
          generated_by: string | null
          id: string
          sections: string[] | null
          status: Database["public"]["Enums"]["report_status"]
          template_id: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          file_size?: string | null
          file_url?: string | null
          format?: string | null
          generated_by?: string | null
          id?: string
          sections?: string[] | null
          status?: Database["public"]["Enums"]["report_status"]
          template_id?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          date_range_end?: string | null
          date_range_start?: string | null
          file_size?: string | null
          file_url?: string | null
          format?: string | null
          generated_by?: string | null
          id?: string
          sections?: string[] | null
          status?: Database["public"]["Enums"]["report_status"]
          template_id?: string | null
          title?: string
        }
        Relationships: []
      }
      review_agenda_items: {
        Row: {
          created_at: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          presenter: string | null
          review_id: string
          sort_order: number | null
          status: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          presenter?: string | null
          review_id: string
          sort_order?: number | null
          status?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          presenter?: string | null
          review_id?: string
          sort_order?: number | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_agenda_items_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "management_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_decisions: {
        Row: {
          closed_date: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          owner_id: string | null
          priority: Database["public"]["Enums"]["decision_priority"]
          review_id: string | null
          status: Database["public"]["Enums"]["decision_status"]
          title: string
          updated_at: string | null
        }
        Insert: {
          closed_date?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          owner_id?: string | null
          priority?: Database["public"]["Enums"]["decision_priority"]
          review_id?: string | null
          status?: Database["public"]["Enums"]["decision_status"]
          title: string
          updated_at?: string | null
        }
        Update: {
          closed_date?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          owner_id?: string | null
          priority?: Database["public"]["Enums"]["decision_priority"]
          review_id?: string | null
          status?: Database["public"]["Enums"]["decision_status"]
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_decisions_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "management_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      risks: {
        Row: {
          category: Database["public"]["Enums"]["risk_category"]
          clause: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          impact: number
          likelihood: number
          mitigation: string | null
          owner_id: string | null
          risk_number: string | null
          status: Database["public"]["Enums"]["risk_status"]
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["risk_category"]
          clause?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          impact?: number
          likelihood?: number
          mitigation?: string | null
          owner_id?: string | null
          risk_number?: string | null
          status?: Database["public"]["Enums"]["risk_status"]
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["risk_category"]
          clause?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          impact?: number
          likelihood?: number
          mitigation?: string | null
          owner_id?: string | null
          risk_number?: string | null
          status?: Database["public"]["Enums"]["risk_status"]
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      scheduled_reports: {
        Row: {
          created_at: string | null
          created_by: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          next_run: string | null
          recipients: string[] | null
          template_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          next_run?: string | null
          recipients?: string[] | null
          template_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          next_run?: string | null
          recipients?: string[] | null
          template_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      smtp_settings: {
        Row: {
          created_at: string
          from_email: string
          from_name: string
          host: string
          id: string
          password: string | null
          port: number
          updated_at: string
          use_tls: boolean
          username: string | null
        }
        Insert: {
          created_at?: string
          from_email: string
          from_name?: string
          host: string
          id?: string
          password?: string | null
          port?: number
          updated_at?: string
          use_tls?: boolean
          username?: string | null
        }
        Update: {
          created_at?: string
          from_email?: string
          from_name?: string
          host?: string
          id?: string
          password?: string | null
          port?: number
          updated_at?: string
          use_tls?: boolean
          username?: string | null
        }
        Relationships: []
      }
      training_courses: {
        Row: {
          category: string | null
          clause: string | null
          created_at: string | null
          description: string | null
          duration_hours: number | null
          id: string
          is_mandatory: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          clause?: string | null
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          is_mandatory?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          clause?: string | null
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          is_mandatory?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      training_records: {
        Row: {
          certificate_url: string | null
          completed_date: string | null
          course_id: string
          created_at: string | null
          due_date: string | null
          employee_id: string | null
          id: string
          progress: number | null
          score: number | null
          status: Database["public"]["Enums"]["training_status"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          certificate_url?: string | null
          completed_date?: string | null
          course_id: string
          created_at?: string | null
          due_date?: string | null
          employee_id?: string | null
          id?: string
          progress?: number | null
          score?: number | null
          status?: Database["public"]["Enums"]["training_status"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          certificate_url?: string | null
          completed_date?: string | null
          course_id?: string
          created_at?: string | null
          due_date?: string | null
          employee_id?: string | null
          id?: string
          progress?: number | null
          score?: number | null
          status?: Database["public"]["Enums"]["training_status"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_records_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "training_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      cron_jobs_view: {
        Row: {
          active: boolean | null
          command: string | null
          database: string | null
          jobid: number | null
          jobname: string | null
          nodename: string | null
          nodeport: number | null
          schedule: string | null
          username: string | null
        }
        Insert: {
          active?: boolean | null
          command?: string | null
          database?: string | null
          jobid?: number | null
          jobname?: string | null
          nodename?: string | null
          nodeport?: number | null
          schedule?: string | null
          username?: string | null
        }
        Update: {
          active?: boolean | null
          command?: string | null
          database?: string | null
          jobid?: number | null
          jobname?: string | null
          nodename?: string | null
          nodeport?: number | null
          schedule?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_cron_job: {
        Args: {
          p_function_name: string
          p_job_name: string
          p_schedule: string
        }
        Returns: number
      }
      delete_cron_job: { Args: { job_id: number }; Returns: undefined }
      get_cron_jobs: {
        Args: never
        Returns: {
          active: boolean
          command: string
          database: string
          jobid: number
          jobname: string
          nodename: string
          nodeport: number
          schedule: string
          username: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      toggle_cron_job: {
        Args: { is_active: boolean; job_id: number }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "auditor" | "user"
      audit_status: "planned" | "in_progress" | "completed" | "cancelled"
      audit_type: "internal" | "external" | "surveillance" | "certification"
      capa_priority: "critical" | "high" | "medium" | "low"
      capa_status:
        | "open"
        | "in_progress"
        | "verification"
        | "closed"
        | "overdue"
      capa_type: "corrective" | "preventive"
      decision_priority: "critical" | "high" | "medium" | "low"
      decision_status: "open" | "in_progress" | "completed" | "overdue"
      document_status: "current" | "under_review" | "draft" | "obsolete"
      document_type:
        | "procedure"
        | "policy"
        | "form"
        | "work_instruction"
        | "manual"
      nc_status:
        | "open"
        | "investigating"
        | "corrective_action"
        | "verification"
        | "closed"
      nc_type: "major" | "minor" | "observation"
      report_status: "draft" | "generated" | "scheduled" | "archived"
      risk_category:
        | "operational"
        | "strategic"
        | "compliance"
        | "financial"
        | "technical"
      risk_status: "open" | "mitigating" | "closed" | "accepted"
      training_status: "not_started" | "in_progress" | "completed" | "overdue"
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
      app_role: ["admin", "manager", "auditor", "user"],
      audit_status: ["planned", "in_progress", "completed", "cancelled"],
      audit_type: ["internal", "external", "surveillance", "certification"],
      capa_priority: ["critical", "high", "medium", "low"],
      capa_status: ["open", "in_progress", "verification", "closed", "overdue"],
      capa_type: ["corrective", "preventive"],
      decision_priority: ["critical", "high", "medium", "low"],
      decision_status: ["open", "in_progress", "completed", "overdue"],
      document_status: ["current", "under_review", "draft", "obsolete"],
      document_type: [
        "procedure",
        "policy",
        "form",
        "work_instruction",
        "manual",
      ],
      nc_status: [
        "open",
        "investigating",
        "corrective_action",
        "verification",
        "closed",
      ],
      nc_type: ["major", "minor", "observation"],
      report_status: ["draft", "generated", "scheduled", "archived"],
      risk_category: [
        "operational",
        "strategic",
        "compliance",
        "financial",
        "technical",
      ],
      risk_status: ["open", "mitigating", "closed", "accepted"],
      training_status: ["not_started", "in_progress", "completed", "overdue"],
    },
  },
} as const
