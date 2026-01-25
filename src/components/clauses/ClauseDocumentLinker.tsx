import { useState } from "react";
import { Link2, Unlink, FileText, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Tables } from "@/integrations/supabase/types";
import type { ClauseDocumentLink } from "@/hooks/useClauses";

interface ClauseDocumentLinkerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clauseTitle: string;
  linkedDocuments: (ClauseDocumentLink & { document?: Tables<"documents"> })[];
  allDocuments: Tables<"documents">[];
  onLink: (documentId: string) => Promise<{ error: any }>;
  onUnlink: (linkId: string) => Promise<{ error: any }>;
}

const typeLabels: Record<string, string> = {
  procedure: "Procedure",
  policy: "Policy",
  form: "Form",
  work_instruction: "Work Instruction",
  manual: "Manual",
};

const statusStyles: Record<string, string> = {
  current: "bg-green-100 text-green-700",
  under_review: "bg-yellow-100 text-yellow-700",
  draft: "bg-blue-100 text-blue-700",
  obsolete: "bg-gray-100 text-gray-700",
};

export default function ClauseDocumentLinker({
  open,
  onOpenChange,
  clauseTitle,
  linkedDocuments,
  allDocuments,
  onLink,
  onUnlink,
}: ClauseDocumentLinkerProps) {
  const [search, setSearch] = useState("");
  const [linking, setLinking] = useState<string | null>(null);
  const [unlinking, setUnlinking] = useState<string | null>(null);

  const linkedDocIds = new Set(linkedDocuments.map((l) => l.document_id));
  
  const availableDocuments = allDocuments.filter(
    (doc) =>
      !linkedDocIds.has(doc.id) &&
      (doc.title.toLowerCase().includes(search.toLowerCase()) ||
        doc.document_number?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleLink = async (documentId: string) => {
    setLinking(documentId);
    await onLink(documentId);
    setLinking(null);
  };

  const handleUnlink = async (linkId: string) => {
    setUnlinking(linkId);
    await onUnlink(linkId);
    setUnlinking(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Link Documents</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Manage documents linked to: <strong>{clauseTitle}</strong>
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Linked Documents */}
          <div>
            <h4 className="text-sm font-medium mb-2">Linked Documents ({linkedDocuments.length})</h4>
            {linkedDocuments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center bg-muted/50 rounded-lg">
                No documents linked to this clause yet
              </p>
            ) : (
              <ScrollArea className="h-[150px]">
                <div className="space-y-2">
                  {linkedDocuments.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {link.document?.title || "Unknown Document"}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {link.document?.document_number}
                            </span>
                            {link.document?.status && (
                              <Badge
                                variant="secondary"
                                className={`text-xs ${statusStyles[link.document.status]}`}
                              >
                                {link.document.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnlink(link.id)}
                        disabled={unlinking === link.id}
                        className="text-destructive hover:text-destructive"
                      >
                        {unlinking === link.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Unlink className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Available Documents */}
          <div>
            <h4 className="text-sm font-medium mb-2">Available Documents</h4>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <ScrollArea className="h-[200px]">
              {availableDocuments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  {search ? "No matching documents found" : "All documents are already linked"}
                </p>
              ) : (
                <div className="space-y-2">
                  {availableDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{doc.title}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {doc.document_number}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {typeLabels[doc.type] || doc.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLink(doc.id)}
                        disabled={linking === doc.id}
                      >
                        {linking === doc.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Link2 className="h-4 w-4 mr-1" />
                            Link
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
