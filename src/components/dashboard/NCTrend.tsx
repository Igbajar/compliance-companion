import { TrendingDown, TrendingUp } from "lucide-react";

interface NCData {
  month: string;
  major: number;
  minor: number;
  observations: number;
}

const data: NCData[] = [
  { month: "Jul", major: 3, minor: 8, observations: 5 },
  { month: "Aug", major: 2, minor: 6, observations: 4 },
  { month: "Sep", major: 4, minor: 9, observations: 7 },
  { month: "Oct", major: 1, minor: 5, observations: 3 },
  { month: "Nov", major: 2, minor: 4, observations: 2 },
  { month: "Dec", major: 1, minor: 3, observations: 4 },
];

const maxValue = Math.max(...data.flatMap((d) => [d.major, d.minor, d.observations]));

const NCTrend = () => {
  const totalCurrent = data[data.length - 1].major + data[data.length - 1].minor;
  const totalPrevious = data[data.length - 2].major + data[data.length - 2].minor;
  const trend = ((totalCurrent - totalPrevious) / totalPrevious) * 100;
  const isPositive = trend < 0;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title mb-0">NC Trend (6 months)</h3>
        <div className={`flex items-center gap-1 text-sm ${isPositive ? "text-success" : "text-destructive"}`}>
          {isPositive ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
          <span className="font-medium">{Math.abs(trend).toFixed(0)}%</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 flex items-end gap-2">
        {data.map((item, index) => (
          <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col-reverse gap-0.5" style={{ height: "160px" }}>
              {/* Major */}
              <div
                className="w-full bg-destructive/80 rounded-t transition-all duration-500"
                style={{
                  height: `${(item.major / maxValue) * 100}%`,
                  animationDelay: `${index * 100}ms`,
                }}
              />
              {/* Minor */}
              <div
                className="w-full bg-warning/80 rounded-t transition-all duration-500"
                style={{
                  height: `${(item.minor / maxValue) * 100}%`,
                  animationDelay: `${index * 100 + 50}ms`,
                }}
              />
              {/* Observations */}
              <div
                className="w-full bg-info/80 rounded-t transition-all duration-500"
                style={{
                  height: `${(item.observations / maxValue) * 100}%`,
                  animationDelay: `${index * 100 + 100}ms`,
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{item.month}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-destructive/80" />
          <span className="text-xs text-muted-foreground">Major</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-warning/80" />
          <span className="text-xs text-muted-foreground">Minor</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-info/80" />
          <span className="text-xs text-muted-foreground">Observations</span>
        </div>
      </div>
    </div>
  );
};

export default NCTrend;
