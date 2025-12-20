import { FileText, AlertTriangle, ClipboardCheck, XCircle, CheckCircle2, Clock } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import ComplianceGauge from "@/components/dashboard/ComplianceGauge";
import RecentActivity from "@/components/dashboard/RecentActivity";
import UpcomingAudits from "@/components/dashboard/UpcomingAudits";
import RiskMatrix from "@/components/dashboard/RiskMatrix";
import NCTrend from "@/components/dashboard/NCTrend";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="fade-in">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your ISO compliance status and key metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Documents"
          value="284"
          change="+12 this month"
          changeType="positive"
          icon={FileText}
          iconColor="text-primary"
          delay={100}
        />
        <StatCard
          title="Open Risks"
          value="18"
          change="3 high priority"
          changeType="negative"
          icon={AlertTriangle}
          iconColor="text-warning"
          delay={200}
        />
        <StatCard
          title="Pending Audits"
          value="5"
          change="2 this month"
          changeType="neutral"
          icon={ClipboardCheck}
          iconColor="text-info"
          delay={300}
        />
        <StatCard
          title="Open NCs"
          value="7"
          change="-4 vs last month"
          changeType="positive"
          icon={XCircle}
          iconColor="text-destructive"
          delay={400}
        />
      </div>

      {/* Compliance Gauges */}
      <div className="glass-card p-6 fade-in" style={{ animationDelay: "200ms" }}>
        <h3 className="section-title">Compliance Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
          <ComplianceGauge percentage={92} label="Quality Management" standard="ISO 9001" />
          <ComplianceGauge percentage={87} label="Information Security" standard="ISO 27001" />
          <ComplianceGauge percentage={78} label="Environmental" standard="ISO 14001" />
          <ComplianceGauge percentage={95} label="OH&S" standard="ISO 45001" />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 text-center fade-in" style={{ animationDelay: "300ms" }}>
              <div className="flex items-center justify-center gap-2 text-success mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-2xl font-bold">42</span>
              </div>
              <p className="text-xs text-muted-foreground">Closed This Month</p>
            </div>
            <div className="glass-card p-4 text-center fade-in" style={{ animationDelay: "350ms" }}>
              <div className="flex items-center justify-center gap-2 text-warning mb-2">
                <Clock className="w-5 h-5" />
                <span className="text-2xl font-bold">8</span>
              </div>
              <p className="text-xs text-muted-foreground">Pending Approvals</p>
            </div>
            <div className="glass-card p-4 text-center fade-in" style={{ animationDelay: "400ms" }}>
              <div className="flex items-center justify-center gap-2 text-info mb-2">
                <FileText className="w-5 h-5" />
                <span className="text-2xl font-bold">15</span>
              </div>
              <p className="text-xs text-muted-foreground">Docs for Review</p>
            </div>
            <div className="glass-card p-4 text-center fade-in" style={{ animationDelay: "450ms" }}>
              <div className="flex items-center justify-center gap-2 text-primary mb-2">
                <ClipboardCheck className="w-5 h-5" />
                <span className="text-2xl font-bold">3</span>
              </div>
              <p className="text-xs text-muted-foreground">Training Due</p>
            </div>
          </div>

          {/* Risk Matrix */}
          <RiskMatrix />

          {/* NC Trend */}
          <NCTrend />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <RecentActivity />
          <UpcomingAudits />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
