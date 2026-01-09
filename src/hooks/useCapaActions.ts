import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeSubscription } from "./useRealtimeSubscription";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type CAPAAction = Tables<"capa_actions">;
export type CAPAActionInsert = TablesInsert<"capa_actions">;
export type CAPAActionUpdate = TablesUpdate<"capa_actions">;

export const useCapaActions = () => {
  const [capaActions, setCapaActions] = useState<CAPAAction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchCapaActions = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("capa_actions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCapaActions(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching CAPA actions",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCapaActions();
  }, [fetchCapaActions]);

  // Realtime subscriptions
  useRealtimeSubscription<CAPAAction>(
    "capa_actions",
    (newCapa) => setCapaActions((prev) => [newCapa, ...prev]),
    (updatedCapa) => setCapaActions((prev) => prev.map((c) => (c.id === updatedCapa.id ? updatedCapa : c))),
    ({ id }) => setCapaActions((prev) => prev.filter((c) => c.id !== id))
  );

  const createCapaAction = async (capaAction: Omit<CAPAActionInsert, "owner_id">) => {
    try {
      const { data, error } = await supabase
        .from("capa_actions")
        .insert({ ...capaAction, owner_id: user?.id })
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "CAPA created",
        description: "The CAPA action has been created successfully.",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error creating CAPA",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateCapaAction = async (id: string, updates: CAPAActionUpdate) => {
    try {
      const { data, error } = await supabase
        .from("capa_actions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "CAPA updated",
        description: "The CAPA action has been updated successfully.",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error updating CAPA",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteCapaAction = async (id: string) => {
    try {
      const { error } = await supabase
        .from("capa_actions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast({
        title: "CAPA deleted",
        description: "The CAPA action has been deleted successfully.",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error deleting CAPA",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  return {
    capaActions,
    loading,
    fetchCapaActions,
    createCapaAction,
    updateCapaAction,
    deleteCapaAction,
  };
};
