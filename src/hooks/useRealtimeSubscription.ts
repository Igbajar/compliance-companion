import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type TableName = "documents" | "risks" | "audits" | "nonconformities" | "capa_actions" | "training_records" | "training_courses" | "clause_evidence" | "clause_document_links" | "iso_clauses";

export const useRealtimeSubscription = <T extends Record<string, unknown>>(
  tableName: TableName,
  onInsert?: (payload: T) => void,
  onUpdate?: (payload: T) => void,
  onDelete?: (payload: { id: string }) => void
) => {
  useEffect(() => {
    const channel = supabase
      .channel(`${tableName}-changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: tableName,
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          console.log(`Realtime ${tableName} change:`, payload);
          
          if (payload.eventType === "INSERT" && onInsert) {
            onInsert(payload.new as T);
          } else if (payload.eventType === "UPDATE" && onUpdate) {
            onUpdate(payload.new as T);
          } else if (payload.eventType === "DELETE" && onDelete) {
            const oldRecord = payload.old as unknown as { id: string };
            onDelete({ id: oldRecord.id });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableName, onInsert, onUpdate, onDelete]);
};
