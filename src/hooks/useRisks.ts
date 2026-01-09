import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeSubscription } from "./useRealtimeSubscription";

export type Risk = Tables<"risks">;
export type RiskInsert = TablesInsert<"risks">;
export type RiskUpdate = TablesUpdate<"risks">;

export const useRisks = () => {
  const { user } = useAuth();
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRisks = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("risks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching risks:", error);
    } else {
      setRisks(data || []);
    }
    setLoading(false);
    return data;
  }, []);

  useEffect(() => {
    fetchRisks();
  }, [fetchRisks]);

  // Realtime subscriptions
  useRealtimeSubscription<Risk>(
    "risks",
    (newRisk) => setRisks((prev) => [newRisk, ...prev]),
    (updatedRisk) => setRisks((prev) => prev.map((r) => (r.id === updatedRisk.id ? updatedRisk : r))),
    ({ id }) => setRisks((prev) => prev.filter((r) => r.id !== id))
  );

  const createRisk = async (risk: Omit<RiskInsert, "owner_id">) => {
    const { data, error } = await supabase
      .from("risks")
      .insert({ ...risk, owner_id: user?.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateRisk = async (id: string, updates: RiskUpdate) => {
    const { data, error } = await supabase
      .from("risks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteRisk = async (id: string) => {
    const { error } = await supabase.from("risks").delete().eq("id", id);
    if (error) throw error;
  };

  return {
    risks,
    loading,
    fetchRisks,
    createRisk,
    updateRisk,
    deleteRisk,
  };
};
