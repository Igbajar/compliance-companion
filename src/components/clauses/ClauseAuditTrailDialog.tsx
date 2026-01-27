import { useState, useEffect } from "react";
import { format } from "date-fns";
import { History, FileText, Link2, Trash2, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ClauseAuditTrail } from "@/hooks/useClauses";

interface ClauseAuditTrailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clauseTitle: string;
  auditTrail: ClauseAuditTrail[];
  loading?: boolean;
}

const actionConfig = {
  evidence_added: {
    icon: FileText,
    label: "Evidence Added",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  evidence_removed: {
    icon: Trash2,
    label: "Evidence Removed",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
  document_linked: {
    icon: Link2,
    label: "Document Linked",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  document_unlinked: {
    icon: Trash2,
    label: "Document Unlinked",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  },
};

export default function ClauseAuditTrailDialog({
  open,
  onOpenChange,
  clauseTitle,
  auditTrail,
  loading,
}: ClauseAuditTrailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Audit Trail
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Change history for: <strong>{clauseTitle}</strong>
          </p>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading audit trail...
            </div>
          ) : auditTrail.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No changes recorded yet for this clause.
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
              
              <div className="space-y-4">
                {auditTrail.map((entry, index) => {
                  const config = actionConfig[entry.action_type];
                  const Icon = config.icon;
                  const details = entry.details as Record<string, unknown> | null;
                  
                  return (
                    <div key={entry.id} className="relative pl-10">
                      {/* Timeline dot */}
                      <div className={`absolute left-2 top-2 w-5 h-5 rounded-full flex items-center justify-center ${config.color}`}>
                        <Icon className="h-3 w-3" />
                      </div>
                      
                      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <Badge variant="outline" className={config.color}>
                            {config.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(entry.created_at), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                        
                        {/* Details */}
                        <div className="text-sm space-y-1">
                          {details?.file_name && (
                            <p className="text-foreground">
                              <span className="text-muted-foreground">File:</span> {String(details.file_name)}
                            </p>
                          )}
                          {details?.document_title && (
                            <p className="text-foreground">
                              <span className="text-muted-foreground">Document:</span> {String(details.document_title)}
                            </p>
                          )}
                          {details?.description && (
                            <p className="text-foreground">
                              <span className="text-muted-foreground">Description:</span> {String(details.description)}
                            </p>
                          )}
                        </div>
                        
                        {/* User */}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{entry.user_email || "Unknown user"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
