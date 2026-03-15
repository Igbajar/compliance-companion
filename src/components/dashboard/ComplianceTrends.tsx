import { useEffect } from "react";
import { TrendingUp, TrendingDown, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts";
import { useComplianceSnapshots } from "@/hooks/useComplianceSnapshots";

const chartConfig = {
  compliance: { label: "Clause Compliance", color: "hsl(var(--primary))" },
  training: { label: "Training", color: "hsl(var(--info, 200 80% 55%))" },
  ncs: { label: "Open NCs", color: "hsl(var(--destructive))" },
};

export default function ComplianceTrends() {
  const { snapshots, loading, createSnapshot } = useComplianceSnapshots();

  // Auto-create snapshot if none exists for today
  useEffect(() => {
    if (!loading && snapshots.length === 0) {
      createSnapshot();
    }
  }, [loading, snapshots.length, createSnapshot]);

  const chartData = snapshots.map((s) => ({
    date: new Date(s.snapshot_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    compliance: Number(s.compliance_percentage),
    training: Number(s.training_compliance_pct),
    ncs: s.open_ncs,
  }));

  const latest = snapshots[snapshots.length - 1];
  const previous = snapshots[snapshots.length - 2];
  const trend = latest && previous
    ? Number(latest.compliance_percentage) - Number(previous.compliance_percentage)
    : 0;

  return (
    <div className="glass-card p-6 fade-in" style={{ animationDelay: "250ms" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="section-title mb-0">Compliance Trends</h3>
          <p className="text-xs text-muted-foreground">Weekly snapshots (12 weeks)</p>
        </div>
        <div className="flex items-center gap-2">
          {trend !== 0 && (
            <div className={`flex items-center gap-1 text-sm ${trend > 0 ? "text-success" : "text-destructive"}`}>
              {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="font-medium">{trend > 0 ? "+" : ""}{trend.toFixed(1)}%</span>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={createSnapshot} className="gap-1">
            <Camera className="w-3 h-3" /> Snapshot
          </Button>
        </div>
      </div>

      {chartData.length < 2 ? (
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          <p>Not enough data yet. Snapshots are taken weekly — click "Snapshot" to create one now.</p>
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="h-48 w-full">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
            <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="complianceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="compliance"
              stroke="hsl(var(--primary))"
              fill="url(#complianceFill)"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="training"
              stroke="hsl(var(--info, 200 80% 55%))"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="4 4"
            />
          </AreaChart>
        </ChartContainer>
      )}

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-6">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-primary" />
          <span className="text-xs text-muted-foreground">Clause Compliance</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 border-t-2 border-dashed border-info" />
          <span className="text-xs text-muted-foreground">Training</span>
        </div>
      </div>
    </div>
  );
}
