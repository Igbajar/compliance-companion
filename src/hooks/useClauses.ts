import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeSubscription } from "./useRealtimeSubscription";
import type { Tables } from "@/integrations/supabase/types";

export type IsoClause = Tables<"iso_clauses">;
export type ClauseEvidence = Tables<"clause_evidence">;
export type ClauseDocumentLink = Tables<"clause_document_links">;

export interface ClauseWithDetails extends IsoClause {
  evidence: ClauseEvidence[];
  linkedDocuments: (ClauseDocumentLink & { document?: Tables<"documents"> })[];
}

export const useClauses = () => {
  const [clauses, setClauses] = useState<ClauseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchClauses = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch clauses
      const { data: clausesData, error: clausesError } = await supabase
        .from("iso_clauses")
        .select("*")
        .order("clause_number");

      if (clausesError) throw clausesError;

      // Fetch all evidence
      const { data: evidenceData, error: evidenceError } = await supabase
        .from("clause_evidence")
        .select("*")
        .order("created_at", { ascending: false });

      if (evidenceError) throw evidenceError;

      // Fetch all document links with document details
      const { data: linksData, error: linksError } = await supabase
        .from("clause_document_links")
        .select("*, document:documents(*)");

      if (linksError) throw linksError;

      // Combine data
      const clausesWithDetails: ClauseWithDetails[] = (clausesData || []).map((clause) => ({
        ...clause,
        evidence: (evidenceData || []).filter((e) => e.clause_id === clause.id),
        linkedDocuments: (linksData || []).filter((l) => l.clause_id === clause.id).map((link) => ({
          ...link,
          document: link.document as Tables<"documents"> | undefined,
        })),
      }));

      setClauses(clausesWithDetails);
    } catch (error: any) {
      toast({
        title: "Error fetching clauses",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchClauses();
  }, [fetchClauses]);

  // Realtime subscriptions
  useRealtimeSubscription<ClauseEvidence>(
    "clause_evidence",
    () => fetchClauses(),
    () => fetchClauses(),
    () => fetchClauses()
  );

  useRealtimeSubscription<ClauseDocumentLink>(
    "clause_document_links",
    () => fetchClauses(),
    () => fetchClauses(),
    () => fetchClauses()
  );

  const uploadEvidence = async (
    clauseId: string,
    file: File,
    description?: string
  ) => {
    try {
      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${clauseId}/${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from("evidence")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("evidence")
        .getPublicUrl(fileName);

      // Create evidence record
      const { error: insertError } = await supabase
        .from("clause_evidence")
        .insert({
          clause_id: clauseId,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_type: file.type,
          file_size: file.size,
          description,
          uploaded_by: user?.id,
        });

      if (insertError) throw insertError;

      toast({
        title: "Evidence uploaded",
        description: "The evidence file has been attached to the clause.",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error uploading evidence",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const deleteEvidence = async (evidenceId: string) => {
    try {
      const { error } = await supabase
        .from("clause_evidence")
        .delete()
        .eq("id", evidenceId);

      if (error) throw error;

      toast({
        title: "Evidence deleted",
        description: "The evidence file has been removed.",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error deleting evidence",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const linkDocument = async (clauseId: string, documentId: string) => {
    try {
      const { error } = await supabase
        .from("clause_document_links")
        .insert({
          clause_id: clauseId,
          document_id: documentId,
          linked_by: user?.id,
        });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already linked",
            description: "This document is already linked to this clause.",
            variant: "destructive",
          });
          return { error };
        }
        throw error;
      }

      toast({
        title: "Document linked",
        description: "The document has been linked to the clause.",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error linking document",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const unlinkDocument = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from("clause_document_links")
        .delete()
        .eq("id", linkId);

      if (error) throw error;

      toast({
        title: "Document unlinked",
        description: "The document has been removed from the clause.",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error unlinking document",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  // Calculate compliance stats
  const getComplianceStats = useCallback(() => {
    const total = clauses.length;
    const compliant = clauses.filter(
      (c) => c.evidence.length > 0 || c.linkedDocuments.length > 0
    ).length;
    const percentage = total > 0 ? Math.round((compliant / total) * 100) : 0;
    
    return {
      total,
      compliant,
      nonCompliant: total - compliant,
      percentage,
    };
  }, [clauses]);

  return {
    clauses,
    loading,
    fetchClauses,
    uploadEvidence,
    deleteEvidence,
    linkDocument,
    unlinkDocument,
    getComplianceStats,
  };
};
