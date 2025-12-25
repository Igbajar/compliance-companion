import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

export type Audit = Tables<"audits">;
export type AuditInsert = TablesInsert<"audits">;
export type AuditUpdate = TablesUpdate<"audits">;

export const useAudits = () => {
  const { user } = useAuth();

  const fetchAudits = async () => {
    const { data, error } = await supabase
      .from("audits")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  };

  const createAudit = async (audit: Omit<AuditInsert, "lead_auditor_id">) => {
    const { data, error } = await supabase
      .from("audits")
      .insert({ ...audit, lead_auditor_id: user?.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateAudit = async (id: string, updates: AuditUpdate) => {
    const { data, error } = await supabase
      .from("audits")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteAudit = async (id: string) => {
    const { error } = await supabase.from("audits").delete().eq("id", id);
    if (error) throw error;
  };

  return {
    fetchAudits,
    createAudit,
    updateAudit,
    deleteAudit,
  };
};
