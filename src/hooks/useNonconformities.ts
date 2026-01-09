import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeSubscription } from "./useRealtimeSubscription";

export type Nonconformity = Tables<"nonconformities">;
export type NonconformityInsert = TablesInsert<"nonconformities">;
export type NonconformityUpdate = TablesUpdate<"nonconformities">;

export const useNonconformities = () => {
  const { user } = useAuth();
  const [nonconformities, setNonconformities] = useState<Nonconformity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNonconformities = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("nonconformities")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching nonconformities:", error);
    } else {
      setNonconformities(data || []);
    }
    setLoading(false);
    return data;
  }, []);

  useEffect(() => {
    fetchNonconformities();
  }, [fetchNonconformities]);

  // Realtime subscriptions
  useRealtimeSubscription<Nonconformity>(
    "nonconformities",
    (newNc) => setNonconformities((prev) => [newNc, ...prev]),
    (updatedNc) => setNonconformities((prev) => prev.map((n) => (n.id === updatedNc.id ? updatedNc : n))),
    ({ id }) => setNonconformities((prev) => prev.filter((n) => n.id !== id))
  );

  const createNonconformity = async (nc: Omit<NonconformityInsert, "owner_id">) => {
    const { data, error } = await supabase
      .from("nonconformities")
      .insert({ ...nc, owner_id: user?.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateNonconformity = async (id: string, updates: NonconformityUpdate) => {
    const { data, error } = await supabase
      .from("nonconformities")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteNonconformity = async (id: string) => {
    const { error } = await supabase.from("nonconformities").delete().eq("id", id);
    if (error) throw error;
  };

  return {
    nonconformities,
    loading,
    fetchNonconformities,
    createNonconformity,
    updateNonconformity,
    deleteNonconformity,
  };
};
