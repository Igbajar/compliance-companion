import { FileText, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "document" | "risk" | "audit" | "nc" | "approval";
  title: string;
  description: string;
  time: string;
  user: string;
}

const activities: Activity[] = [
  {
    id: "1",
    type: "document",
    title: "Quality Manual v3.2",
    description: "Document approved and released",
    time: "10 min ago",
    user: "Sarah Johnson",
  },
  {
    id: "2",
    type: "risk",
    title: "Supplier Non-Delivery Risk",
    description: "Risk score updated to High",
    time: "1 hour ago",
    user: "Mike Chen",
  },
  {
    id: "3",
    type: "nc",
    title: "NC-2024-042",
    description: "Corrective action completed",
    time: "2 hours ago",
    user: "Emily Davis",
  },
  {
    id: "4",
    type: "audit",
    title: "Internal Audit - Production",
    description: "Audit scheduled for next week",
    time: "3 hours ago",
    user: "John Smith",
  },
  {
    id: "5",
    type: "approval",
    title: "Work Instruction WI-045",
    description: "Pending your approval",
    time: "5 hours ago",
    user: "Lisa Wang",
  },
];

const getIcon = (type: Activity["type"]) => {
  switch (type) {
    case "document":
      return FileText;
    case "risk":
      return AlertTriangle;
    case "audit":
      return CheckCircle;
    case "nc":
      return XCircle;
    case "approval":
      return Clock;
    default:
      return FileText;
  }
};

const getIconColor = (type: Activity["type"]) => {
  switch (type) {
    case "document":
      return "text-primary bg-primary/20";
    case "risk":
      return "text-warning bg-warning/20";
    case "audit":
      return "text-success bg-success/20";
    case "nc":
      return "text-destructive bg-destructive/20";
    case "approval":
      return "text-info bg-info/20";
    default:
      return "text-primary bg-primary/20";
  }
};

const RecentActivity = () => {
  return (
    <div className="glass-card p-6">
      <h3 className="section-title">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = getIcon(activity.type);
          return (
            <div
              key={activity.id}
              className="flex items-start gap-4 slide-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={cn("p-2 rounded-lg", getIconColor(activity.type))}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activity.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{activity.user}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
