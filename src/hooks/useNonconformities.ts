import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

export type Nonconformity = Tables<"nonconformities">;
export type NonconformityInsert = TablesInsert<"nonconformities">;
export type NonconformityUpdate = TablesUpdate<"nonconformities">;

export const useNonconformities = () => {
  const { user } = useAuth();

  const fetchNonconformities = async () => {
    const { data, error } = await supabase
      .from("nonconformities")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  };

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
    fetchNonconformities,
    createNonconformity,
    updateNonconformity,
    deleteNonconformity,
  };
};
