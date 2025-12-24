import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Document = Tables<"documents">;
export type DocumentInsert = TablesInsert<"documents">;
export type DocumentUpdate = TablesUpdate<"documents">;

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchDocuments = async () => {
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
  };

  const createDocument = async (document: Omit<DocumentInsert, "owner_id">) => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .insert({ ...document, owner_id: user?.id })
        .select()
        .single();

      if (error) throw error;
      
      setDocuments((prev) => [data, ...prev]);
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
      
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === id ? data : doc))
      );
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
      
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
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

  useEffect(() => {
    fetchDocuments();
  }, []);

  return {
    documents,
    loading,
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
  };
};
