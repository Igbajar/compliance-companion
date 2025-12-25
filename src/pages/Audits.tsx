import { useState, useEffect } from "react";
import { ClipboardCheck, Plus, Calendar, User, MapPin, Clock, CheckCircle, AlertCircle, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAudits, Audit } from "@/hooks/useAudits";
import { AuditFormDialog } from "@/components/audits/AuditFormDialog";
import { DeleteAuditDialog } from "@/components/audits/DeleteAuditDialog";
import { useToast } from "@/hooks/use-toast";

const getStatusStyle = (status: Audit["status"]) => {
  switch (status) {
    case "completed":
      return "status-compliant";
    case "in_progress":
      return "status-partial";
    case "planned":
      return "status-open";
    case "cancelled":
      return "status-non-compliant";
    default:
      return "";
  }
};

const getTypeStyle = (type: Audit["type"]) => {
  switch (type) {
    case "internal":
      return "bg-primary/20 text-primary";
    case "external":
      return "bg-info/20 text-info";
    case "surveillance":
      return "bg-warning/20 text-warning";
    case "certification":
      return "bg-success/20 text-success";
    default:
      return "";
  }
};

const Audits = () => {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { fetchAudits, createAudit, updateAudit, deleteAudit } = useAudits();
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchAudits();
      setAudits(data);
    } catch (error) {
      toast({ title: "Error loading audits", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (data: any) => {
    try {
      await createAudit(data);
      toast({ title: "Audit scheduled successfully" });
      loadData();
    } catch (error) {
      toast({ title: "Error creating audit", variant: "destructive" });
    }
  };

  const handleUpdate = async (data: any) => {
    if (!selectedAudit) return;
    try {
      await updateAudit(selectedAudit.id, data);
      toast({ title: "Audit updated successfully" });
      loadData();
    } catch (error) {
      toast({ title: "Error updating audit", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!selectedAudit) return;
    try {
      await deleteAudit(selectedAudit.id);
      toast({ title: "Audit deleted successfully" });
      setDeleteOpen(false);
      setSelectedAudit(null);
      loadData();
    } catch (error) {
      toast({ title: "Error deleting audit", variant: "destructive" });
    }
  };

  const openCreateForm = () => {
    setSelectedAudit(null);
    setIsEditing(false);
    setFormOpen(true);
  };

  const openEditForm = (audit: Audit) => {
    setSelectedAudit(audit);
    setIsEditing(true);
    setFormOpen(true);
  };

  const openDeleteDialog = (audit: Audit) => {
    setSelectedAudit(audit);
    setDeleteOpen(true);
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
          <h1 className="text-2xl font-bold text-foreground">Audit Management</h1>
          <p className="text-muted-foreground mt-1">
            Plan, execute, and track internal and external audits
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-secondary rounded-lg p-1">
            <button
              onClick={() => setView("list")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              List
            </button>
            <button
              onClick={() => setView("calendar")}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                view === "calendar" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Calendar
            </button>
          </div>
          <Button variant="gradient" onClick={openCreateForm}>
            <Plus className="w-4 h-4" />
            Schedule Audit
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 fade-in" style={{ animationDelay: "100ms" }}>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info/20">
              <Calendar className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {audits.filter((a) => a.status === "planned").length}
              </p>
              <p className="text-xs text-muted-foreground">Planned</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/20">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {audits.filter((a) => a.status === "in_progress").length}
              </p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/20">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {audits.filter((a) => a.status === "completed").length}
              </p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/20">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {audits.reduce((acc, a) => acc + (a.major_findings || 0), 0)}
              </p>
              <p className="text-xs text-muted-foreground">Major Findings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Audits List */}
      <div className="space-y-4 fade-in" style={{ animationDelay: "200ms" }}>
        {audits.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-muted-foreground">No audits scheduled</p>
          </div>
        ) : (
          audits.map((audit) => (
            <div key={audit.id} className="glass-card p-6 hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-secondary">
                    <ClipboardCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{audit.title}</h3>
                      <span className={cn("status-badge capitalize", getTypeStyle(audit.type))}>
                        {audit.type}
                      </span>
                      <span className={cn("status-badge capitalize", getStatusStyle(audit.status))}>
                        {audit.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      {(audit.start_date || audit.end_date) && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{audit.start_date || "TBD"} - {audit.end_date || "TBD"}</span>
                        </div>
                      )}
                      {audit.department && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{audit.department}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Findings Summary */}
                  {(audit.status === "completed" || audit.status === "in_progress") && (
                    <div className="flex items-center gap-4 mr-4">
                      <div className="text-center">
                        <p className="text-xl font-bold text-destructive">{audit.major_findings || 0}</p>
                        <p className="text-xs text-muted-foreground">Major</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-warning">{audit.minor_findings || 0}</p>
                        <p className="text-xs text-muted-foreground">Minor</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditForm(audit)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => openDeleteDialog(audit)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AuditFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={isEditing ? handleUpdate : handleCreate}
        defaultValues={selectedAudit || undefined}
        isEditing={isEditing}
      />

      <DeleteAuditDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        auditTitle={selectedAudit?.title || ""}
      />
    </div>
  );
};

export default Audits;
