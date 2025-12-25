import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

export type Risk = Tables<"risks">;
export type RiskInsert = TablesInsert<"risks">;
export type RiskUpdate = TablesUpdate<"risks">;

export const useRisks = () => {
  const { user } = useAuth();

  const fetchRisks = async () => {
    const { data, error } = await supabase
      .from("risks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  };

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
    fetchRisks,
    createRisk,
    updateRisk,
    deleteRisk,
  };
};
