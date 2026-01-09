import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeSubscription } from "./useRealtimeSubscription";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Document = Tables<"documents">;
export type DocumentInsert = TablesInsert<"documents">;
export type DocumentUpdate = TablesUpdate<"documents">;

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching documents",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Realtime subscriptions
  useRealtimeSubscription<Document>(
    "documents",
    (newDoc) => setDocuments((prev) => [newDoc, ...prev]),
    (updatedDoc) => setDocuments((prev) => prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d))),
    ({ id }) => setDocuments((prev) => prev.filter((d) => d.id !== id))
  );

  const createDocument = async (document: Omit<DocumentInsert, "owner_id">) => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .insert({ ...document, owner_id: user?.id })
        .select()
        .single();

      if (error) throw error;
      
      // Realtime will handle state update
      toast({
        title: "Document created",
        description: "The document has been created successfully.",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error creating document",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateDocument = async (id: string, updates: DocumentUpdate) => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      
      // Realtime will handle state update
      toast({
        title: "Document updated",
        description: "The document has been updated successfully.",
      });
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error updating document",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      // Realtime will handle state update
      toast({
        title: "Document deleted",
        description: "The document has been deleted successfully.",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error deleting document",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  return {
    documents,
    loading,
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
  };
};
