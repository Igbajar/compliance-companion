import { Calendar, User, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Audit {
  id: string;
  title: string;
  type: "internal" | "external" | "surveillance";
  date: string;
  auditor: string;
  department: string;
  status: "scheduled" | "in-progress" | "completed";
}

const audits: Audit[] = [
  {
    id: "1",
    title: "ISO 9001 Internal Audit",
    type: "internal",
    date: "Dec 22, 2024",
    auditor: "Sarah Johnson",
    department: "Production",
    status: "scheduled",
  },
  {
    id: "2",
    title: "ISO 27001 Surveillance",
    type: "surveillance",
    date: "Dec 28, 2024",
    auditor: "External - BSI",
    department: "IT Security",
    status: "scheduled",
  },
  {
    id: "3",
    title: "ISO 14001 Environmental",
    type: "internal",
    date: "Jan 5, 2025",
    auditor: "Mike Chen",
    department: "Operations",
    status: "scheduled",
  },
];

const getTypeStyle = (type: Audit["type"]) => {
  switch (type) {
    case "internal":
      return "status-badge status-compliant";
    case "external":
      return "status-badge status-open";
    case "surveillance":
      return "status-badge status-partial";
    default:
      return "status-badge";
  }
};

const UpcomingAudits = () => {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title mb-0">Upcoming Audits</h3>
        <Button variant="ghost" size="sm" className="text-primary">
          View All
        </Button>
      </div>
      <div className="space-y-4">
        {audits.map((audit, index) => (
          <div
            key={audit.id}
            className="p-4 rounded-lg bg-secondary/50 border border-border/50 fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="text-sm font-medium text-foreground">{audit.title}</h4>
              <span className={getTypeStyle(audit.type)}>
                {audit.type.charAt(0).toUpperCase() + audit.type.slice(1)}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <span>{audit.date}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="w-3.5 h-3.5" />
                <span>{audit.auditor}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                <span>{audit.department}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingAudits;
