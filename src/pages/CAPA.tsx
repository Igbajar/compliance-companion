import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Search,
  XCircle,
  Target,
  Shield,
  Play,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import CAPAForm, { CAPAFormValues } from "@/components/capa/CAPAForm";
import { DeleteCAPADialog } from "@/components/capa/DeleteCAPADialog";
import { useCapaActions, type CAPAAction } from "@/hooks/useCapaActions";
import { format, differenceInDays } from "date-fns";

const workflowStages = [
  { id: "open", label: "Open", icon: FileText },
  { id: "in_progress", label: "In Progress", icon: Play },
  { id: "verification", label: "Verification", icon: CheckCircle2 },
  { id: "closed", label: "Closed", icon: Shield },
];

const getStatusBadge = (status: CAPAAction["status"]) => {
  const styles: Record<string, string> = {
    open: "bg-info/20 text-info border-info/30",
    in_progress: "bg-warning/20 text-warning border-warning/30",
    verification: "bg-primary/20 text-primary border-primary/30",
    closed: "bg-success/20 text-success border-success/30",
    overdue: "bg-destructive/20 text-destructive border-destructive/30",
  };
  return styles[status] || "bg-muted text-muted-foreground";
};

const statusLabels: Record<CAPAAction["status"], string> = {
  open: "Open",
  in_progress: "In Progress",
  verification: "Verification",
  closed: "Closed",
  overdue: "Overdue",
};

const getPriorityBadge = (priority: CAPAAction["priority"]) => {
  const styles: Record<string, string> = {
    critical: "bg-destructive/20 text-destructive border-destructive/30",
    high: "bg-destructive/20 text-destructive border-destructive/30",
    medium: "bg-warning/20 text-warning border-warning/30",
    low: "bg-success/20 text-success border-success/30",
  };
  return styles[priority] || "bg-muted text-muted-foreground";
};

const priorityLabels: Record<CAPAAction["priority"], string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const getTypeBadge = (type: CAPAAction["type"]) => {
  return type === "corrective" 
    ? "bg-destructive/20 text-destructive border-destructive/30"
    : "bg-info/20 text-info border-info/30";
};

const typeLabels: Record<CAPAAction["type"], string> = {
  corrective: "Corrective",
  preventive: "Preventive",
};

const getSLAStatus = (dueDate: string | null, status: CAPAAction["status"]) => {
  if (status === "closed") {
    return { class: "bg-success/20 text-success", text: "Completed", daysRemaining: 0 };
  }
  if (!dueDate) {
    return { class: "bg-muted text-muted-foreground", text: "No due date", daysRemaining: 0 };
  }
  
  const days = differenceInDays(new Date(dueDate), new Date());
  
  if (days < 0) {
    return { class: "bg-destructive/20 text-destructive", text: `${Math.abs(days)} days overdue`, daysRemaining: days };
  }
  if (days <= 7) {
    return { class: "bg-warning/20 text-warning", text: `${days} days remaining`, daysRemaining: days };
  }
  return { class: "bg-success/20 text-success", text: `${days} days remaining`, daysRemaining: days };
};

const getEffectivenessBadge = (effectiveness: string | null) => {
  const styles: Record<string, string> = {
    effective: "bg-success/20 text-success border-success/30",
    not_effective: "bg-destructive/20 text-destructive border-destructive/30",
    pending: "bg-warning/20 text-warning border-warning/30",
  };
  return styles[effectiveness || "pending"] || "bg-muted text-muted-foreground border-border";
};

export default function CAPA() {
  const { capaActions, loading, createCapaAction, updateCapaAction, deleteCapaAction } = useCapaActions();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<CAPAAction | null>(null);
  const [deleteAction, setDeleteAction] = useState<CAPAAction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredActions = capaActions.filter((action) => {
    const matchesSearch = 
      action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (action.capa_number?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesType = typeFilter === "all" || action.type === typeFilter;
    const matchesStatus = statusFilter === "all" || action.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || action.priority === priorityFilter;
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  // Stats calculations
  const openActions = capaActions.filter(a => a.status !== "closed").length;
  const overdueActions = capaActions.filter(a => {
    if (a.status === "closed" || !a.due_date) return false;
    return differenceInDays(new Date(a.due_date), new Date()) < 0;
  }).length;
  const atRiskActions = capaActions.filter(a => {
    if (a.status === "closed" || !a.due_date) return false;
    const days = differenceInDays(new Date(a.due_date), new Date());
    return days >= 0 && days <= 7;
  }).length;
  const closedCount = capaActions.filter(a => a.status === "closed").length;
  const effectiveCount = capaActions.filter(a => a.effectiveness === "effective").length;
  const effectivenessRate = closedCount > 0 ? Math.round((effectiveCount / closedCount) * 100) : 0;

  const handleCreateCAPA = async (data: CAPAFormValues) => {
    setIsSubmitting(true);
    try {
      await createCapaAction({
        title: data.title,
        type: data.type.toLowerCase() as "corrective" | "preventive",
        source: data.sourceType,
        source_reference: data.source,
        priority: data.priority.toLowerCase() as "critical" | "high" | "medium" | "low",
        department: data.department,
        due_date: format(data.dueDate, "yyyy-MM-dd"),
        root_cause: data.rootCause,
        description: data.description,
        verification_required: data.verificationRequired,
      });
      setIsCreateDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCAPA = async (data: CAPAFormValues) => {
    if (!editingAction) return;
    setIsSubmitting(true);
    try {
      await updateCapaAction(editingAction.id, {
        title: data.title,
        type: data.type.toLowerCase() as "corrective" | "preventive",
        source: data.sourceType,
        source_reference: data.source,
        priority: data.priority.toLowerCase() as "critical" | "high" | "medium" | "low",
        department: data.department,
        due_date: format(data.dueDate, "yyyy-MM-dd"),
        root_cause: data.rootCause,
        description: data.description,
        verification_required: data.verificationRequired,
      });
      setEditingAction(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteAction) return;
    setIsSubmitting(true);
    try {
      await deleteCapaAction(deleteAction.id);
      setDeleteAction(null);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CAPA Management</h1>
          <p className="text-muted-foreground mt-1">
            Corrective & Preventive Action tracking with SLA monitoring
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New CAPA
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
            <DialogHeader>
              <DialogTitle>Create New CAPA</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new Corrective or Preventive Action
              </DialogDescription>
            </DialogHeader>
            <CAPAForm
              onSubmit={handleCreateCAPA}
              onCancel={() => setIsCreateDialogOpen(false)}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingAction} onOpenChange={(open) => !open && setEditingAction(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle>Edit CAPA - {editingAction?.capa_number || editingAction?.id.slice(0, 8)}</DialogTitle>
            <DialogDescription>
              Update the details of this Corrective or Preventive Action
            </DialogDescription>
          </DialogHeader>
          {editingAction && (
            <CAPAForm
              isEditing
              defaultValues={{
                title: editingAction.title,
                type: (editingAction.type.charAt(0).toUpperCase() + editingAction.type.slice(1)) as "Corrective" | "Preventive",
                source: editingAction.source_reference || "",
                sourceType: (editingAction.source as any) || "Other",
                priority: (editingAction.priority.charAt(0).toUpperCase() + editingAction.priority.slice(1)) as "High" | "Medium" | "Low",
                owner: "",
                department: editingAction.department || "",
                dueDate: editingAction.due_date ? new Date(editingAction.due_date) : undefined,
                rootCause: editingAction.root_cause || "",
                description: editingAction.description || "",
                verificationRequired: editingAction.verification_required ?? true,
              }}
              onSubmit={handleEditCAPA}
              onCancel={() => setEditingAction(null)}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteCAPADialog
        open={!!deleteAction}
        onOpenChange={(open) => !open && setDeleteAction(null)}
        capa={deleteAction}
        onConfirm={handleDeleteConfirm}
        isDeleting={isSubmitting}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Actions</p>
                <p className="text-2xl font-bold text-foreground">{openActions}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-destructive">{overdueActions}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold text-warning">{atRiskActions}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-warning/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Closed</p>
                <p className="text-2xl font-bold text-success">{closedCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Effectiveness</p>
                <p className="text-2xl font-bold text-primary">{effectivenessRate}%</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="actions" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="actions">Action Tracker</TabsTrigger>
          <TabsTrigger value="workflow">Workflow Status</TabsTrigger>
        </TabsList>

        {/* Action Tracker Tab */}
        <TabsContent value="actions" className="space-y-4">
          {/* Filters */}
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by ID, title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-secondary/50 border-border"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[140px] bg-secondary/50 border-border">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="corrective">Corrective</SelectItem>
                      <SelectItem value="preventive">Preventive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px] bg-secondary/50 border-border">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="verification">Verification</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[130px] bg-secondary/50 border-border">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Table */}
          <Card className="glass-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>ID / Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>SLA Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {capaActions.length === 0
                          ? "No CAPA actions yet. Click 'New CAPA' to create one."
                          : "No CAPA actions match your filters."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredActions.map((action) => {
                      const sla = getSLAStatus(action.due_date, action.status);
                      return (
                        <TableRow key={action.id} className="border-border">
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">{action.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {action.capa_number || action.id.slice(0, 8)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getTypeBadge(action.type)}>
                              {typeLabels[action.type]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getPriorityBadge(action.priority)}>
                              {priorityLabels[action.priority]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusBadge(action.status)}>
                              {statusLabels[action.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={`text-xs px-2 py-1 rounded-full ${sla.class}`}>
                              {sla.text}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {action.due_date
                              ? format(new Date(action.due_date), "MMM dd, yyyy")
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setEditingAction(action)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => setDeleteAction(action)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow Tab */}
        <TabsContent value="workflow" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {workflowStages.map((stage) => {
              const StageIcon = stage.icon;
              const stageActions = capaActions.filter(a => a.status === stage.id);
              return (
                <Card key={stage.id} className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <StageIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{stage.label}</p>
                        <p className="text-xs text-muted-foreground">{stageActions.length} actions</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {stageActions.slice(0, 3).map((action) => (
                        <div
                          key={action.id}
                          className="p-2 rounded-lg bg-secondary/50 border border-border"
                        >
                          <p className="text-sm font-medium text-foreground truncate">
                            {action.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {action.capa_number || action.id.slice(0, 8)}
                          </p>
                        </div>
                      ))}
                      {stageActions.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center">
                          +{stageActions.length - 3} more
                        </p>
                      )}
                      {stageActions.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          No actions in this stage
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
