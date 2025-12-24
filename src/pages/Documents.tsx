import { useState } from "react";
import { FileText, Plus, Search, Filter, Eye, Edit, Trash2, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDocuments, type Document } from "@/hooks/useDocuments";
import { DocumentFormDialog } from "@/components/documents/DocumentFormDialog";
import { DeleteDocumentDialog } from "@/components/documents/DeleteDocumentDialog";
import { format } from "date-fns";

const getStatusStyle = (status: Document["status"]) => {
  switch (status) {
    case "current":
      return "status-compliant";
    case "under_review":
      return "status-partial";
    case "draft":
      return "status-open";
    case "obsolete":
      return "status-non-compliant";
    default:
      return "";
  }
};

const getStatusIcon = (status: Document["status"]) => {
  switch (status) {
    case "current":
      return CheckCircle;
    case "under_review":
      return Clock;
    case "draft":
      return Edit;
    case "obsolete":
      return XCircle;
    default:
      return FileText;
  }
};

const getTypeStyle = (type: Document["type"]) => {
  switch (type) {
    case "policy":
      return "bg-primary/20 text-primary";
    case "procedure":
      return "bg-info/20 text-info";
    case "work_instruction":
      return "bg-success/20 text-success";
    case "form":
      return "bg-warning/20 text-warning";
    case "manual":
      return "bg-muted text-muted-foreground";
    default:
      return "";
  }
};

const typeLabels: Record<Document["type"], string> = {
  procedure: "Procedure",
  policy: "Policy",
  form: "Form",
  work_instruction: "Work Instruction",
  manual: "Manual",
};

const statusLabels: Record<Document["status"], string> = {
  current: "Current",
  under_review: "Under Review",
  draft: "Draft",
  obsolete: "Obsolete",
};

const Documents = () => {
  const { documents, loading, createDocument, updateDocument, deleteDocument } = useDocuments();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.document_number?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesType = selectedType === "all" || doc.type === selectedType;
    const matchesStatus = selectedStatus === "all" || doc.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreate = () => {
    setSelectedDocument(null);
    setIsFormOpen(true);
  };

  const handleEdit = (doc: Document) => {
    setSelectedDocument(doc);
    setIsFormOpen(true);
  };

  const handleDelete = (doc: Document) => {
    setSelectedDocument(doc);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      if (selectedDocument) {
        await updateDocument(selectedDocument.id, values);
      } else {
        await createDocument(values);
      }
      setIsFormOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDocument) return;
    setIsSubmitting(true);
    try {
      await deleteDocument(selectedDocument.id);
      setIsDeleteOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Document Control</h1>
          <p className="text-muted-foreground mt-1">
            Manage your ISO documents with version control and approval workflows
          </p>
        </div>
        <Button variant="gradient" onClick={handleCreate}>
          <Plus className="w-4 h-4" />
          New Document
        </Button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 fade-in" style={{ animationDelay: "100ms" }}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-10 px-3 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Types</option>
              <option value="policy">Policy</option>
              <option value="procedure">Procedure</option>
              <option value="work_instruction">Work Instruction</option>
              <option value="form">Form</option>
              <option value="manual">Manual</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-10 px-3 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="under_review">Under Review</option>
              <option value="current">Current</option>
              <option value="obsolete">Obsolete</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="glass-card overflow-hidden fade-in" style={{ animationDelay: "200ms" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Document
                </th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Version
                </th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Clause
                </th>
                <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    {documents.length === 0
                      ? "No documents yet. Click 'New Document' to create one."
                      : "No documents match your filters."}
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const StatusIcon = getStatusIcon(doc.status);
                  return (
                    <tr key={doc.id} className="table-row">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-secondary">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{doc.title}</p>
                            {doc.document_number && (
                              <p className="text-xs text-muted-foreground">{doc.document_number}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={cn("status-badge", getTypeStyle(doc.type))}>
                          {typeLabels[doc.type]}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium text-foreground">
                          v{doc.version || "1.0"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={cn("status-badge flex items-center gap-1.5", getStatusStyle(doc.status))}>
                          <StatusIcon className="w-3 h-3" />
                          {statusLabels[doc.status]}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-primary font-medium">
                          {doc.clause || "-"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">
                          {doc.updated_at
                            ? format(new Date(doc.updated_at), "MMM dd, yyyy")
                            : "-"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(doc)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(doc)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Dialog */}
      <DocumentFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        document={selectedDocument}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Delete Dialog */}
      <DeleteDocumentDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        document={selectedDocument}
        onConfirm={handleDeleteConfirm}
        isDeleting={isSubmitting}
      />
    </div>
  );
};

export default Documents;
