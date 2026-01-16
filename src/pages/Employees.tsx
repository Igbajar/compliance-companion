import { useState } from "react";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Mail,
  Phone,
  Building2,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useEmployees, Employee, EmployeeInsert, EmployeeUpdate } from "@/hooks/useEmployees";
import EmployeeFormDialog from "@/components/employees/EmployeeFormDialog";
import DeleteEmployeeDialog from "@/components/employees/DeleteEmployeeDialog";

const statusStyles: Record<string, string> = {
  active: "bg-success/20 text-success",
  inactive: "bg-muted text-muted-foreground",
  on_leave: "bg-warning/20 text-warning",
};

const statusLabels: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  on_leave: "On Leave",
};

const Employees = () => {
  const { employees, loading, createEmployee, updateEmployee, deleteEmployee } = useEmployees();

  const [searchQuery, setSearchQuery] = useState("");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats
  const activeCount = employees.filter((e) => e.status === "active").length;
  const departments = [...new Set(employees.map((e) => e.department).filter(Boolean))];

  // Filter
  const filteredEmployees = employees.filter(
    (e) =>
      e.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.job_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = () => {
    setSelectedEmployee(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormDialogOpen(true);
  };

  const handleDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (data: EmployeeInsert | EmployeeUpdate) => {
    setIsSubmitting(true);
    try {
      if (selectedEmployee) {
        await updateEmployee(selectedEmployee.id, data);
      } else {
        await createEmployee(data as EmployeeInsert);
      }
      setFormDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEmployee) return;
    await deleteEmployee(selectedEmployee.id);
    setDeleteDialogOpen(false);
    setSelectedEmployee(null);
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
          <h1 className="text-2xl font-bold text-foreground">Employee Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage employees and their training assignments
          </p>
        </div>
        <Button variant="gradient" onClick={handleCreate}>
          <Plus className="w-4 h-4" />
          Add Employee
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 fade-in" style={{ animationDelay: "100ms" }}>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Employees</p>
              <p className="text-2xl font-bold text-foreground mt-1">{employees.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-primary/20">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-success mt-1">{activeCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-success/20">
              <Briefcase className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Departments</p>
              <p className="text-2xl font-bold text-foreground mt-1">{departments.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-warning/20">
              <Building2 className="w-6 h-6 text-warning" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card p-4 fade-in" style={{ animationDelay: "200ms" }}>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 fade-in" style={{ animationDelay: "300ms" }}>
        {filteredEmployees.map((employee) => (
          <div key={employee.id} className="glass-card p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-foreground">{employee.full_name}</h3>
                {employee.job_title && (
                  <p className="text-sm text-muted-foreground">{employee.job_title}</p>
                )}
              </div>
              <Badge className={cn("text-xs", statusStyles[employee.status || "active"])}>
                {statusLabels[employee.status || "active"]}
              </Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="truncate">{employee.email}</span>
              </div>
              {employee.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{employee.phone}</span>
                </div>
              )}
              {employee.department && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  <span>{employee.department}</span>
                </div>
              )}
            </div>

            {employee.employee_number && (
              <p className="text-xs text-muted-foreground mt-3">
                ID: {employee.employee_number}
              </p>
            )}

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border">
              <Button size="sm" variant="ghost" onClick={() => handleEdit(employee)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDelete(employee)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {filteredEmployees.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No employees found
          </div>
        )}
      </div>

      {/* Dialogs */}
      <EmployeeFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        employee={selectedEmployee}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteEmployeeDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        employeeName={selectedEmployee?.full_name || ""}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default Employees;
