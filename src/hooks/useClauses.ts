import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeSubscription } from "./useRealtimeSubscription";
import type { Tables } from "@/integrations/supabase/types";

// Audit trail type (table added via migration)
export interface ClauseAuditTrail {
  id: string;
  clause_id: string;
  action_type: 'evidence_added' | 'evidence_removed' | 'document_linked' | 'document_unlinked';
  user_id: string | null;
  user_email: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

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

  // Log audit trail entry
  const logAuditTrail = async (
    clauseId: string,
    actionType: 'evidence_added' | 'evidence_removed' | 'document_linked' | 'document_unlinked',
    details: Record<string, unknown>
  ) => {
    try {
      await supabase.from("clause_audit_trail" as any).insert({
        clause_id: clauseId,
        action_type: actionType,
        user_id: user?.id,
        user_email: user?.email,
        details,
      } as any);
    } catch (error) {
      console.error("Failed to log audit trail:", error);
    }
  };

  const uploadEvidence = async (
    clauseId: string,
    file: File,
    description?: string
  ) => {
    try {
      // Upload file to storage
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

      // Log audit trail
      await logAuditTrail(clauseId, 'evidence_added', {
        file_name: file.name,
        file_size: file.size,
        description,
      });

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

  // Bulk upload multiple files
  const uploadMultipleEvidence = async (
    clauseId: string,
    files: File[],
    description?: string
  ): Promise<{ error: any; successCount: number; failCount: number }> => {
    let successCount = 0;
    let failCount = 0;

    for (const file of files) {
      const result = await uploadEvidence(clauseId, file, description);
      if (result.error) {
        failCount++;
      } else {
        successCount++;
      }
    }

    if (successCount > 0 && failCount === 0) {
      toast({
        title: "All files uploaded",
        description: `Successfully uploaded ${successCount} file(s).`,
      });
    } else if (successCount > 0 && failCount > 0) {
      toast({
        title: "Partial upload",
        description: `Uploaded ${successCount} file(s), ${failCount} failed.`,
        variant: "destructive",
      });
    }

    return { error: failCount > 0 ? new Error("Some files failed to upload") : null, successCount, failCount };
  };

  const deleteEvidence = async (evidenceId: string, clauseId?: string, fileName?: string) => {
    try {
      // Get evidence details before deletion if not provided
      let evidenceClauseId = clauseId;
      let evidenceFileName = fileName;
      
      if (!evidenceClauseId || !evidenceFileName) {
        const { data: evidence } = await supabase
          .from("clause_evidence")
          .select("clause_id, file_name")
          .eq("id", evidenceId)
          .single();
        
        if (evidence) {
          evidenceClauseId = evidence.clause_id;
          evidenceFileName = evidence.file_name;
        }
      }

      const { error } = await supabase
        .from("clause_evidence")
        .delete()
        .eq("id", evidenceId);

      if (error) throw error;

      // Log audit trail
      if (evidenceClauseId) {
        await logAuditTrail(evidenceClauseId, 'evidence_removed', {
          evidence_id: evidenceId,
          file_name: evidenceFileName,
        });
      }

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

  const linkDocument = async (clauseId: string, documentId: string, documentTitle?: string) => {
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

      // Log audit trail
      await logAuditTrail(clauseId, 'document_linked', {
        document_id: documentId,
        document_title: documentTitle,
      });

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

  const unlinkDocument = async (linkId: string, clauseId?: string, documentTitle?: string) => {
    try {
      // Get link details before deletion if not provided
      let linkClauseId = clauseId;
      let linkDocumentTitle = documentTitle;
      
      if (!linkClauseId) {
        const { data: link } = await supabase
          .from("clause_document_links")
          .select("clause_id, document:documents(title)")
          .eq("id", linkId)
          .single();
        
        if (link) {
          linkClauseId = link.clause_id;
          linkDocumentTitle = (link.document as any)?.title;
        }
      }

      const { error } = await supabase
        .from("clause_document_links")
        .delete()
        .eq("id", linkId);

      if (error) throw error;

      // Log audit trail
      if (linkClauseId) {
        await logAuditTrail(linkClauseId, 'document_unlinked', {
          link_id: linkId,
          document_title: linkDocumentTitle,
        });
      }

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

  // Fetch audit trail for a specific clause
  const fetchAuditTrail = async (clauseId: string): Promise<ClauseAuditTrail[]> => {
    try {
      const { data, error } = await supabase
        .from("clause_audit_trail" as any)
        .select("*")
        .eq("clause_id", clauseId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as ClauseAuditTrail[];
    } catch (error) {
      console.error("Error fetching audit trail:", error);
      return [];
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
    uploadMultipleEvidence,
    deleteEvidence,
    linkDocument,
    unlinkDocument,
    getComplianceStats,
    fetchAuditTrail,
  };
};
