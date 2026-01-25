import { FileText, AlertTriangle, ClipboardCheck, XCircle, CheckCircle2, Clock, Loader2 } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import ComplianceGauge from "@/components/dashboard/ComplianceGauge";
import RecentActivity from "@/components/dashboard/RecentActivity";
import UpcomingAudits from "@/components/dashboard/UpcomingAudits";
import RiskMatrix from "@/components/dashboard/RiskMatrix";
import NCTrend from "@/components/dashboard/NCTrend";
import ClauseCoverageWidget from "@/components/clauses/ClauseCoverageWidget";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useClauses } from "@/hooks/useClauses";

const Dashboard = () => {
  const { stats, loading } = useDashboardStats();
  const { getComplianceStats, loading: clausesLoading } = useClauses();
  const clauseStats = getComplianceStats();

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
          value={stats.activeDocuments.toString()}
          change="Current status"
          changeType="neutral"
          icon={FileText}
          iconColor="text-primary"
          delay={100}
        />
        <StatCard
          title="Open Risks"
          value={stats.openRisks.toString()}
          change={`${stats.highPriorityRisks} high priority`}
          changeType={stats.highPriorityRisks > 0 ? "negative" : "neutral"}
          icon={AlertTriangle}
          iconColor="text-warning"
          delay={200}
        />
        <StatCard
          title="Pending Audits"
          value={stats.pendingAudits.toString()}
          change={`${stats.auditsThisMonth} this month`}
          changeType="neutral"
          icon={ClipboardCheck}
          iconColor="text-info"
          delay={300}
        />
        <StatCard
          title="Open NCs"
          value={stats.openNCs.toString()}
          change={`${stats.closedThisMonth} closed this month`}
          changeType={stats.closedThisMonth > 0 ? "positive" : "neutral"}
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
                <span className="text-2xl font-bold">{stats.closedThisMonth}</span>
              </div>
              <p className="text-xs text-muted-foreground">Closed This Month</p>
            </div>
            <div className="glass-card p-4 text-center fade-in" style={{ animationDelay: "350ms" }}>
              <div className="flex items-center justify-center gap-2 text-warning mb-2">
                <Clock className="w-5 h-5" />
                <span className="text-2xl font-bold">{stats.openCAPAs}</span>
              </div>
              <p className="text-xs text-muted-foreground">Open CAPAs</p>
            </div>
            <div className="glass-card p-4 text-center fade-in" style={{ animationDelay: "400ms" }}>
              <div className="flex items-center justify-center gap-2 text-info mb-2">
                <FileText className="w-5 h-5" />
                <span className="text-2xl font-bold">{stats.activeDocuments}</span>
              </div>
              <p className="text-xs text-muted-foreground">Active Documents</p>
            </div>
            <div className="glass-card p-4 text-center fade-in" style={{ animationDelay: "450ms" }}>
              <div className="flex items-center justify-center gap-2 text-primary mb-2">
                <ClipboardCheck className="w-5 h-5" />
                <span className="text-2xl font-bold">{stats.trainingDue}</span>
              </div>
              <p className="text-xs text-muted-foreground">Training Overdue</p>
            </div>
          </div>

          {/* Risk Matrix */}
          <RiskMatrix />

          {/* NC Trend */}
          <NCTrend />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <ClauseCoverageWidget {...clauseStats} />
          <RecentActivity />
          <UpcomingAudits />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
