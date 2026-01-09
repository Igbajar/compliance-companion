import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeSubscription } from "./useRealtimeSubscription";

export type Audit = Tables<"audits">;
export type AuditInsert = TablesInsert<"audits">;
export type AuditUpdate = TablesUpdate<"audits">;

export const useAudits = () => {
  const { user } = useAuth();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAudits = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("audits")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching audits:", error);
    } else {
      setAudits(data || []);
    }
    setLoading(false);
    return data;
  }, []);

  useEffect(() => {
    fetchAudits();
  }, [fetchAudits]);

  // Realtime subscriptions
  useRealtimeSubscription<Audit>(
    "audits",
    (newAudit) => setAudits((prev) => [newAudit, ...prev]),
    (updatedAudit) => setAudits((prev) => prev.map((a) => (a.id === updatedAudit.id ? updatedAudit : a))),
    ({ id }) => setAudits((prev) => prev.filter((a) => a.id !== id))
  );

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
    audits,
    loading,
    fetchAudits,
    createAudit,
    updateAudit,
    deleteAudit,
  };
};
