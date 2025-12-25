import { useState, useEffect } from "react";
import { XCircle, Plus, Search, Filter, Eye, Edit, AlertTriangle, CheckCircle2, Clock, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNonconformities, Nonconformity } from "@/hooks/useNonconformities";
import { NCFormDialog } from "@/components/nonconformities/NCFormDialog";
import { DeleteNCDialog } from "@/components/nonconformities/DeleteNCDialog";
import { useToast } from "@/hooks/use-toast";

const getTypeStyle = (type: Nonconformity["type"]) => {
  switch (type) {
    case "major":
      return "bg-destructive/20 text-destructive";
    case "minor":
      return "bg-warning/20 text-warning";
    case "observation":
      return "bg-info/20 text-info";
    default:
      return "";
  }
};

const getStatusStyle = (status: Nonconformity["status"]) => {
  switch (status) {
    case "open":
      return "bg-destructive/20 text-destructive";
    case "investigating":
      return "bg-warning/20 text-warning";
    case "corrective_action":
      return "bg-info/20 text-info";
    case "verification":
      return "bg-primary/20 text-primary";
    case "closed":
      return "bg-success/20 text-success";
    default:
      return "";
  }
};

const getSourceStyle = (source: string | null) => {
  switch (source?.toLowerCase()) {
    case "audit":
      return "bg-primary/20 text-primary";
    case "customer":
      return "bg-destructive/20 text-destructive";
    case "internal":
      return "bg-info/20 text-info";
    case "supplier":
      return "bg-warning/20 text-warning";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const Nonconformities = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [nonconformities, setNonconformities] = useState<Nonconformity[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedNC, setSelectedNC] = useState<Nonconformity | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { fetchNonconformities, createNonconformity, updateNonconformity, deleteNonconformity } = useNonconformities();
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchNonconformities();
      setNonconformities(data);
    } catch (error) {
      toast({ title: "Error loading nonconformities", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (data: any) => {
    try {
      await createNonconformity(data);
      toast({ title: "Nonconformity created successfully" });
      loadData();
    } catch (error) {
      toast({ title: "Error creating nonconformity", variant: "destructive" });
    }
  };

  const handleUpdate = async (data: any) => {
    if (!selectedNC) return;
    try {
      await updateNonconformity(selectedNC.id, data);
      toast({ title: "Nonconformity updated successfully" });
      loadData();
    } catch (error) {
      toast({ title: "Error updating nonconformity", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!selectedNC) return;
    try {
      await deleteNonconformity(selectedNC.id);
      toast({ title: "Nonconformity deleted successfully" });
      setDeleteOpen(false);
      setSelectedNC(null);
      loadData();
    } catch (error) {
      toast({ title: "Error deleting nonconformity", variant: "destructive" });
    }
  };

  const openCreateForm = () => {
    setSelectedNC(null);
    setIsEditing(false);
    setFormOpen(true);
  };

  const openEditForm = (nc: Nonconformity) => {
    setSelectedNC(nc);
    setIsEditing(true);
    setFormOpen(true);
  };

  const openDeleteDialog = (nc: Nonconformity) => {
    setSelectedNC(nc);
    setDeleteOpen(true);
  };

  const filteredNCs = nonconformities.filter((nc) => {
    const matchesSearch =
      nc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (nc.nc_number?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesType = selectedType === "all" || nc.type === selectedType;
    const matchesStatus = selectedStatus === "all" || nc.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const openNCs = nonconformities.filter((nc) => nc.status !== "closed");
  const overdueNCs = openNCs.filter((nc) => nc.due_date && new Date(nc.due_date) < new Date());

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
          <h1 className="text-2xl font-bold text-foreground">Nonconformity Management</h1>
          <p className="text-muted-foreground mt-1">
            Track and resolve nonconformities with root cause analysis
          </p>
        </div>
        <Button variant="gradient" onClick={openCreateForm}>
          <Plus className="w-4 h-4" />
          Log NC
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 fade-in" style={{ animationDelay: "100ms" }}>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Open</span>
            <XCircle className="w-4 h-4 text-destructive" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{openNCs.length}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Major</span>
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </div>
          <p className="text-2xl font-bold text-destructive mt-2">
            {nonconformities.filter((nc) => nc.type === "major" && nc.status !== "closed").length}
          </p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Minor</span>
            <AlertTriangle className="w-4 h-4 text-warning" />
          </div>
          <p className="text-2xl font-bold text-warning mt-2">
            {nonconformities.filter((nc) => nc.type === "minor" && nc.status !== "closed").length}
          </p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Overdue</span>
            <Clock className="w-4 h-4 text-destructive" />
          </div>
          <p className="text-2xl font-bold text-destructive mt-2">{overdueNCs.length}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Closed (Month)</span>
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl font-bold text-success mt-2">
            {nonconformities.filter((nc) => nc.status === "closed").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 fade-in" style={{ animationDelay: "150ms" }}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search nonconformities..."
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
              <option value="major">Major</option>
              <option value="minor">Minor</option>
              <option value="observation">Observation</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-10 px-3 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="corrective_action">Corrective Action</option>
              <option value="verification">Verification</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* NC List */}
      <div className="space-y-4 fade-in" style={{ animationDelay: "200ms" }}>
        {filteredNCs.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <p className="text-muted-foreground">No nonconformities found</p>
          </div>
        ) : (
          filteredNCs.map((nc) => {
            const isOverdue = nc.status !== "closed" && nc.due_date && new Date(nc.due_date) < new Date();
            return (
              <div
                key={nc.id}
                className={cn(
                  "glass-card p-6 transition-all",
                  isOverdue && "border-destructive/50"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-xl",
                      nc.type === "major" ? "bg-destructive/20" : nc.type === "minor" ? "bg-warning/20" : "bg-info/20"
                    )}>
                      <XCircle className={cn(
                        "w-6 h-6",
                        nc.type === "major" ? "text-destructive" : nc.type === "minor" ? "text-warning" : "text-info"
                      )} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{nc.title}</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {nc.nc_number && (
                          <span className="text-sm text-muted-foreground">{nc.nc_number}</span>
                        )}
                        <span className={cn("status-badge capitalize", getTypeStyle(nc.type))}>
                          {nc.type}
                        </span>
                        {nc.source && (
                          <span className={cn("status-badge capitalize", getSourceStyle(nc.source))}>
                            {nc.source}
                          </span>
                        )}
                        <span className={cn("status-badge capitalize", getStatusStyle(nc.status))}>
                          {nc.status.replace("_", " ")}
                        </span>
                        {isOverdue && (
                          <span className="status-badge bg-destructive text-destructive-foreground">
                            Overdue
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {nc.department && <span>Dept: {nc.department}</span>}
                        {nc.clause && (
                          <>
                            <span>•</span>
                            <span>Clause: {nc.clause}</span>
                          </>
                        )}
                        {nc.due_date && (
                          <>
                            <span>•</span>
                            <span>Due: {nc.due_date}</span>
                          </>
                        )}
                      </div>
                      {nc.root_cause && (
                        <div className="mt-3 p-3 rounded-lg bg-secondary/50">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Root Cause:</p>
                          <p className="text-sm text-foreground">{nc.root_cause}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditForm(nc)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => openDeleteDialog(nc)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <NCFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={isEditing ? handleUpdate : handleCreate}
        defaultValues={selectedNC || undefined}
        isEditing={isEditing}
      />

      <DeleteNCDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        ncTitle={selectedNC?.title || ""}
      />
    </div>
  );
};

export default Nonconformities;
