import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Upload,
  Link2,
  FileText,
  Trash2,
  ExternalLink,
  History,
  Files,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ClauseWithDetails } from "@/hooks/useClauses";
import type { Tables } from "@/integrations/supabase/types";
import ClauseEvidenceUpload from "./ClauseEvidenceUpload";
import ClauseDocumentLinker from "./ClauseDocumentLinker";

interface ClauseCardProps {
  clause: ClauseWithDetails;
  allDocuments: Tables<"documents">[];
  onUploadEvidence: (clauseId: string, file: File, description?: string) => Promise<{ error: any }>;
  onDeleteEvidence: (evidenceId: string, clauseId?: string, fileName?: string) => Promise<{ error: any }>;
  onLinkDocument: (clauseId: string, documentId: string, documentTitle?: string) => Promise<{ error: any }>;
  onUnlinkDocument: (linkId: string, clauseId?: string, documentTitle?: string) => Promise<{ error: any }>;
  onOpenAuditTrail?: () => void;
  onOpenBulkUpload?: () => void;
}

export default function ClauseCard({
  clause,
  allDocuments,
  onUploadEvidence,
  onDeleteEvidence,
  onLinkDocument,
  onUnlinkDocument,
  onOpenAuditTrail,
  onOpenBulkUpload,
}: ClauseCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [linkerOpen, setLinkerOpen] = useState(false);

  const hasEvidence = clause.evidence.length > 0 || clause.linkedDocuments.length > 0;
  const totalEvidence = clause.evidence.length + clause.linkedDocuments.length;

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className={`border rounded-lg transition-colors ${hasEvidence ? "border-green-200 bg-green-50/30" : "border-border"}`}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 rounded-t-lg">
              <div className="flex items-center gap-3">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <div className="flex items-center gap-2">
                  {hasEvidence ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  )}
                  <Badge variant="outline" className="font-mono">
                    {clause.clause_number}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-sm">{clause.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {clause.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {totalEvidence > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {totalEvidence} evidence
                  </Badge>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenBulkUpload?.();
                      }}
                    >
                      <Files className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Bulk Upload</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadOpen(true);
                      }}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Upload Evidence</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLinkerOpen(true);
                      }}
                    >
                      <Link2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Link Document</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAuditTrail?.();
                      }}
                    >
                      <History className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View History</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="border-t px-4 py-3 space-y-3">
              {/* Linked Documents */}
              {clause.linkedDocuments.length > 0 && (
                <div>
                  <h5 className="text-xs font-medium text-muted-foreground mb-2">Linked Documents</h5>
                  <div className="space-y-2">
                    {clause.linkedDocuments.map((link) => (
                      <div
                        key={link.id}
                        className="flex items-center justify-between p-2 bg-background rounded border"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">{link.document?.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {link.document?.document_number}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          {link.document?.file_url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => window.open(link.document?.file_url!, "_blank")}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => onUnlinkDocument(link.id, clause.id, link.document?.title)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Uploaded Evidence */}
              {clause.evidence.length > 0 && (
                <div>
                  <h5 className="text-xs font-medium text-muted-foreground mb-2">Uploaded Evidence</h5>
                  <div className="space-y-2">
                    {clause.evidence.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex items-center justify-between p-2 bg-background rounded border"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <div>
                            <span className="text-sm">{ev.file_name}</span>
                            {ev.description && (
                              <p className="text-xs text-muted-foreground">{ev.description}</p>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(ev.file_size)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => window.open(ev.file_url, "_blank")}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => onDeleteEvidence(ev.id, clause.id, ev.file_name)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {totalEvidence === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No evidence attached. Upload files or link documents to demonstrate compliance.
                </p>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      <ClauseEvidenceUpload
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        clauseTitle={`${clause.clause_number} - ${clause.title}`}
        onUpload={(file, desc) => onUploadEvidence(clause.id, file, desc)}
      />

      <ClauseDocumentLinker
        open={linkerOpen}
        onOpenChange={setLinkerOpen}
        clauseTitle={`${clause.clause_number} - ${clause.title}`}
        linkedDocuments={clause.linkedDocuments}
        allDocuments={allDocuments}
        onLink={(docId) => onLinkDocument(clause.id, docId)}
        onUnlink={onUnlinkDocument}
      />
    </>
  );
}
