import { useState } from "react";
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Users,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  TrendingUp,
  Eye,
  Edit,
  FileText,
  Bell,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Types
interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  competencies: CompetencyLevel[];
}

interface CompetencyLevel {
  competencyId: string;
  level: "none" | "basic" | "proficient" | "expert";
  required: "none" | "basic" | "proficient" | "expert";
}

interface Competency {
  id: string;
  name: string;
  category: string;
  isoClause?: string;
}

interface Training {
  id: string;
  title: string;
  type: "course" | "certification" | "workshop" | "on-the-job";
  provider: string;
  duration: string;
  competencies: string[];
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
}

interface Certification {
  id: string;
  employeeId: string;
  employeeName: string;
  certificationName: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  status: "valid" | "expiring-soon" | "expired";
  documentUrl?: string;
}

interface TrainingRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  trainingTitle: string;
  completionDate: string;
  score?: number;
  effectiveness: "not-evaluated" | "effective" | "partially-effective" | "ineffective";
}

// Sample Data
const competencies: Competency[] = [
  { id: "c1", name: "Internal Audit", category: "Quality", isoClause: "9.2" },
  { id: "c2", name: "Risk Assessment", category: "Quality", isoClause: "6.1" },
  { id: "c3", name: "Document Control", category: "Quality", isoClause: "7.5" },
  { id: "c4", name: "Root Cause Analysis", category: "Quality", isoClause: "10.2" },
  { id: "c5", name: "Process Mapping", category: "Operations", isoClause: "4.4" },
  { id: "c6", name: "Statistical Analysis", category: "Quality", isoClause: "9.1" },
  { id: "c7", name: "Information Security", category: "IT", isoClause: "A.7" },
  { id: "c8", name: "Incident Management", category: "IT", isoClause: "A.16" },
];

const employees: Employee[] = [
  {
    id: "e1",
    name: "John Smith",
    role: "Quality Manager",
    department: "Quality",
    competencies: [
      { competencyId: "c1", level: "expert", required: "expert" },
      { competencyId: "c2", level: "expert", required: "expert" },
      { competencyId: "c3", level: "proficient", required: "proficient" },
      { competencyId: "c4", level: "expert", required: "expert" },
      { competencyId: "c5", level: "proficient", required: "proficient" },
      { competencyId: "c6", level: "basic", required: "proficient" },
      { competencyId: "c7", level: "basic", required: "basic" },
      { competencyId: "c8", level: "none", required: "basic" },
    ],
  },
  {
    id: "e2",
    name: "Sarah Johnson",
    role: "Internal Auditor",
    department: "Quality",
    competencies: [
      { competencyId: "c1", level: "proficient", required: "expert" },
      { competencyId: "c2", level: "proficient", required: "proficient" },
      { competencyId: "c3", level: "proficient", required: "proficient" },
      { competencyId: "c4", level: "basic", required: "proficient" },
      { competencyId: "c5", level: "basic", required: "basic" },
      { competencyId: "c6", level: "none", required: "basic" },
      { competencyId: "c7", level: "none", required: "none" },
      { competencyId: "c8", level: "none", required: "none" },
    ],
  },
  {
    id: "e3",
    name: "Mike Chen",
    role: "IT Security Analyst",
    department: "IT",
    competencies: [
      { competencyId: "c1", level: "basic", required: "basic" },
      { competencyId: "c2", level: "proficient", required: "proficient" },
      { competencyId: "c3", level: "basic", required: "basic" },
      { competencyId: "c4", level: "proficient", required: "proficient" },
      { competencyId: "c5", level: "none", required: "none" },
      { competencyId: "c6", level: "none", required: "none" },
      { competencyId: "c7", level: "expert", required: "expert" },
      { competencyId: "c8", level: "expert", required: "expert" },
    ],
  },
  {
    id: "e4",
    name: "Emily Davis",
    role: "Process Engineer",
    department: "Operations",
    competencies: [
      { competencyId: "c1", level: "none", required: "basic" },
      { competencyId: "c2", level: "basic", required: "proficient" },
      { competencyId: "c3", level: "basic", required: "basic" },
      { competencyId: "c4", level: "proficient", required: "proficient" },
      { competencyId: "c5", level: "expert", required: "expert" },
      { competencyId: "c6", level: "proficient", required: "proficient" },
      { competencyId: "c7", level: "none", required: "none" },
      { competencyId: "c8", level: "none", required: "none" },
    ],
  },
];

const certifications: Certification[] = [
  {
    id: "cert1",
    employeeId: "e1",
    employeeName: "John Smith",
    certificationName: "ISO 9001 Lead Auditor",
    issuer: "BSI",
    issueDate: "2023-03-15",
    expiryDate: "2026-03-15",
    status: "valid",
  },
  {
    id: "cert2",
    employeeId: "e1",
    employeeName: "John Smith",
    certificationName: "Six Sigma Black Belt",
    issuer: "ASQ",
    issueDate: "2022-08-01",
    expiryDate: "2025-08-01",
    status: "valid",
  },
  {
    id: "cert3",
    employeeId: "e2",
    employeeName: "Sarah Johnson",
    certificationName: "ISO 9001 Internal Auditor",
    issuer: "IRCA",
    issueDate: "2023-06-20",
    expiryDate: "2025-01-20",
    status: "expiring-soon",
  },
  {
    id: "cert4",
    employeeId: "e3",
    employeeName: "Mike Chen",
    certificationName: "ISO 27001 Lead Implementer",
    issuer: "PECB",
    issueDate: "2023-01-10",
    expiryDate: "2026-01-10",
    status: "valid",
  },
  {
    id: "cert5",
    employeeId: "e3",
    employeeName: "Mike Chen",
    certificationName: "CISSP",
    issuer: "ISC2",
    issueDate: "2021-05-01",
    expiryDate: "2024-05-01",
    status: "expired",
  },
  {
    id: "cert6",
    employeeId: "e4",
    employeeName: "Emily Davis",
    certificationName: "Lean Six Sigma Green Belt",
    issuer: "IASSC",
    issueDate: "2024-02-15",
    expiryDate: "2027-02-15",
    status: "valid",
  },
];

const trainingRecords: TrainingRecord[] = [
  {
    id: "tr1",
    employeeId: "e1",
    employeeName: "John Smith",
    trainingTitle: "Advanced Root Cause Analysis",
    completionDate: "2024-11-15",
    score: 92,
    effectiveness: "effective",
  },
  {
    id: "tr2",
    employeeId: "e2",
    employeeName: "Sarah Johnson",
    trainingTitle: "Internal Audit Techniques",
    completionDate: "2024-10-20",
    score: 85,
    effectiveness: "effective",
  },
  {
    id: "tr3",
    employeeId: "e2",
    employeeName: "Sarah Johnson",
    trainingTitle: "Root Cause Analysis Basics",
    completionDate: "2024-12-01",
    score: 78,
    effectiveness: "partially-effective",
  },
  {
    id: "tr4",
    employeeId: "e3",
    employeeName: "Mike Chen",
    trainingTitle: "Incident Response Workshop",
    completionDate: "2024-09-10",
    score: 95,
    effectiveness: "effective",
  },
  {
    id: "tr5",
    employeeId: "e4",
    employeeName: "Emily Davis",
    trainingTitle: "Process Optimization",
    completionDate: "2024-12-10",
    effectiveness: "not-evaluated",
  },
];

// Helper functions
const getLevelValue = (level: string): number => {
  switch (level) {
    case "expert": return 3;
    case "proficient": return 2;
    case "basic": return 1;
    default: return 0;
  }
};

const getLevelColor = (level: string, required: string): string => {
  const levelVal = getLevelValue(level);
  const requiredVal = getLevelValue(required);
  
  if (requiredVal === 0) return "bg-muted/50";
  if (levelVal >= requiredVal) return "bg-success/80";
  if (levelVal === requiredVal - 1) return "bg-warning/80";
  return "bg-destructive/80";
};

const getLevelLabel = (level: string): string => {
  switch (level) {
    case "expert": return "E";
    case "proficient": return "P";
    case "basic": return "B";
    default: return "-";
  }
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case "valid":
      return "status-compliant";
    case "expiring-soon":
      return "status-partial";
    case "expired":
      return "status-non-compliant";
    default:
      return "";
  }
};

const getEffectivenessStyle = (effectiveness: string) => {
  switch (effectiveness) {
    case "effective":
      return "status-compliant";
    case "partially-effective":
      return "status-partial";
    case "ineffective":
      return "status-non-compliant";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const Training = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedCertStatus, setSelectedCertStatus] = useState<string>("all");

  // Calculate training gaps
  const trainingGaps = employees.flatMap((emp) =>
    emp.competencies
      .filter((comp) => getLevelValue(comp.level) < getLevelValue(comp.required))
      .map((comp) => {
        const competency = competencies.find((c) => c.id === comp.competencyId);
        return {
          employeeId: emp.id,
          employeeName: emp.name,
          role: emp.role,
          competencyName: competency?.name || "",
          currentLevel: comp.level,
          requiredLevel: comp.required,
          gap: getLevelValue(comp.required) - getLevelValue(comp.level),
        };
      })
  );

  // Stats
  const totalEmployees = employees.length;
  const totalGaps = trainingGaps.length;
  const expiringCerts = certifications.filter((c) => c.status === "expiring-soon").length;
  const expiredCerts = certifications.filter((c) => c.status === "expired").length;
  const trainingComplianceRate = Math.round(
    ((totalEmployees * competencies.length - totalGaps) /
      (totalEmployees * competencies.length)) *
      100
  );

  // Filter certifications
  const filteredCerts = certifications.filter((cert) => {
    const matchesSearch =
      cert.certificationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedCertStatus === "all" || cert.status === selectedCertStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Training & Competence Management</h1>
          <p className="text-muted-foreground mt-1">
            Track competencies, training gaps, and certifications across your organization
          </p>
        </div>
        <Button variant="gradient">
          <Plus className="w-4 h-4" />
          Add Training
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 fade-in" style={{ animationDelay: "100ms" }}>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Competence Score</p>
              <p className="text-2xl font-bold text-foreground mt-1">{trainingComplianceRate}%</p>
            </div>
            <div className="p-3 rounded-xl bg-success/20">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
          </div>
          <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-success rounded-full transition-all duration-500"
              style={{ width: `${trainingComplianceRate}%` }}
            />
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Training Gaps</p>
              <p className="text-2xl font-bold text-foreground mt-1">{totalGaps}</p>
            </div>
            <div className="p-3 rounded-xl bg-warning/20">
              <AlertTriangle className="w-6 h-6 text-warning" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Across {totalEmployees} employees</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Expiring Certifications</p>
              <p className="text-2xl font-bold text-warning mt-1">{expiringCerts}</p>
            </div>
            <div className="p-3 rounded-xl bg-warning/20">
              <Clock className="w-6 h-6 text-warning" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Within 90 days</p>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Expired Certifications</p>
              <p className="text-2xl font-bold text-destructive mt-1">{expiredCerts}</p>
            </div>
            <div className="p-3 rounded-xl bg-destructive/20">
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Require renewal</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="matrix" className="fade-in" style={{ animationDelay: "200ms" }}>
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger value="matrix" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="w-4 h-4 mr-2" />
            Competence Matrix
          </TabsTrigger>
          <TabsTrigger value="gaps" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Training Gaps
          </TabsTrigger>
          <TabsTrigger value="certifications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Award className="w-4 h-4 mr-2" />
            Certifications
          </TabsTrigger>
          <TabsTrigger value="records" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="w-4 h-4 mr-2" />
            Training Records
          </TabsTrigger>
        </TabsList>

        {/* Competence Matrix Tab */}
        <TabsContent value="matrix" className="mt-4">
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Role-Based Competence Matrix</h3>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-success/80" />
                    <span className="text-muted-foreground">Meets/Exceeds</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-warning/80" />
                    <span className="text-muted-foreground">1 Level Below</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-destructive/80" />
                    <span className="text-muted-foreground">2+ Levels Below</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-muted/50" />
                    <span className="text-muted-foreground">Not Required</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky left-0 bg-secondary/50 min-w-[200px]">
                      Employee
                    </th>
                    {competencies.map((comp) => (
                      <th
                        key={comp.id}
                        className="p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center min-w-[100px]"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="truncate max-w-[80px]" title={comp.name}>
                            {comp.name}
                          </span>
                          {comp.isoClause && (
                            <span className="text-primary text-[10px]">{comp.isoClause}</span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                      <td className="p-3 sticky left-0 bg-card">
                        <div>
                          <p className="text-sm font-medium text-foreground">{emp.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {emp.role} • {emp.department}
                          </p>
                        </div>
                      </td>
                      {competencies.map((comp) => {
                        const empComp = emp.competencies.find((c) => c.competencyId === comp.id);
                        return (
                          <td key={comp.id} className="p-3 text-center">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center mx-auto text-xs font-bold text-white cursor-pointer hover:scale-110 transition-transform",
                                getLevelColor(empComp?.level || "none", empComp?.required || "none")
                              )}
                              title={`Current: ${empComp?.level || "none"} | Required: ${empComp?.required || "none"}`}
                            >
                              {getLevelLabel(empComp?.level || "none")}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Training Gaps Tab */}
        <TabsContent value="gaps" className="mt-4">
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Training Gap Analysis</h3>
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Competency
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Current Level
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Required Level
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Gap
                    </th>
                    <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {trainingGaps.map((gap, index) => (
                    <tr key={index} className="table-row">
                      <td className="p-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{gap.employeeName}</p>
                          <p className="text-xs text-muted-foreground">{gap.role}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-foreground">{gap.competencyName}</span>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "status-badge capitalize",
                          gap.currentLevel === "none" ? "bg-muted text-muted-foreground" : "bg-warning/20 text-warning"
                        )}>
                          {gap.currentLevel}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="status-badge capitalize bg-primary/20 text-primary">
                          {gap.requiredLevel}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {Array.from({ length: gap.gap }).map((_, i) => (
                              <div key={i} className="w-2 h-4 bg-destructive rounded-sm" />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {gap.gap} level{gap.gap > 1 ? "s" : ""}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <GraduationCap className="w-4 h-4 mr-1" />
                            Assign Training
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Certifications Tab */}
        <TabsContent value="certifications" className="mt-4">
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search certifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <select
                    value={selectedCertStatus}
                    onChange={(e) => setSelectedCertStatus(e.target.value)}
                    className="h-10 px-3 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="all">All Status</option>
                    <option value="valid">Valid</option>
                    <option value="expiring-soon">Expiring Soon</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Certification
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Issuer
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Issue Date
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Expiry Date
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCerts.map((cert) => (
                    <tr key={cert.id} className="table-row">
                      <td className="p-4">
                        <span className="text-sm font-medium text-foreground">{cert.employeeName}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-primary" />
                          <span className="text-sm text-foreground">{cert.certificationName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">{cert.issuer}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">{cert.issueDate}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{cert.expiryDate}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={cn("status-badge capitalize flex items-center gap-1.5", getStatusStyle(cert.status))}>
                          {cert.status === "valid" && <CheckCircle className="w-3 h-3" />}
                          {cert.status === "expiring-soon" && <Clock className="w-3 h-3" />}
                          {cert.status === "expired" && <XCircle className="w-3 h-3" />}
                          {cert.status.replace("-", " ")}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="w-4 h-4" />
                          </Button>
                          {cert.status !== "valid" && (
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Bell className="w-4 h-4 text-warning" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Training Records Tab */}
        <TabsContent value="records" className="mt-4">
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Training Records & Effectiveness</h3>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Record
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Training
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Completion Date
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Score
                    </th>
                    <th className="text-left p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Effectiveness
                    </th>
                    <th className="text-right p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {trainingRecords.map((record) => (
                    <tr key={record.id} className="table-row">
                      <td className="p-4">
                        <span className="text-sm font-medium text-foreground">{record.employeeName}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-primary" />
                          <span className="text-sm text-foreground">{record.trainingTitle}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">{record.completionDate}</span>
                      </td>
                      <td className="p-4">
                        {record.score ? (
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-2 bg-secondary rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  record.score >= 80 ? "bg-success" : record.score >= 60 ? "bg-warning" : "bg-destructive"
                                )}
                                style={{ width: `${record.score}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-foreground">{record.score}%</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={cn("status-badge capitalize", getEffectivenessStyle(record.effectiveness))}>
                          {record.effectiveness.replace("-", " ")}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Training;
