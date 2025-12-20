import { cn } from "@/lib/utils";

interface Risk {
  id: string;
  name: string;
  likelihood: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
}

const risks: Risk[] = [
  { id: "1", name: "Supplier Failure", likelihood: 3, impact: 4 },
  { id: "2", name: "Data Breach", likelihood: 2, impact: 5 },
  { id: "3", name: "Equipment Malfunction", likelihood: 4, impact: 3 },
  { id: "4", name: "Regulatory Change", likelihood: 2, impact: 4 },
  { id: "5", name: "Staff Turnover", likelihood: 3, impact: 2 },
  { id: "6", name: "Quality Defect", likelihood: 3, impact: 3 },
];

const getCellColor = (likelihood: number, impact: number) => {
  const score = likelihood * impact;
  if (score >= 15) return "bg-destructive/30 border-destructive/50";
  if (score >= 8) return "bg-warning/30 border-warning/50";
  if (score >= 4) return "bg-info/30 border-info/50";
  return "bg-success/30 border-success/50";
};

const RiskMatrix = () => {
  const matrix = Array.from({ length: 5 }, (_, i) =>
    Array.from({ length: 5 }, (_, j) => ({
      likelihood: 5 - i,
      impact: j + 1,
      risks: risks.filter(
        (r) => r.likelihood === 5 - i && r.impact === j + 1
      ),
    }))
  );

  return (
    <div className="glass-card p-6">
      <h3 className="section-title">Risk Matrix</h3>
      <div className="flex gap-2">
        {/* Y-axis label */}
        <div className="flex flex-col justify-center items-center w-8">
          <span className="text-xs text-muted-foreground writing-mode-vertical transform -rotate-180" style={{ writingMode: "vertical-rl" }}>
            Likelihood →
          </span>
        </div>

        <div className="flex-1">
          {/* Matrix Grid */}
          <div className="grid grid-cols-5 gap-1">
            {matrix.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={cn(
                    "aspect-square rounded-md border flex items-center justify-center text-xs font-medium transition-all hover:scale-105 cursor-pointer",
                    getCellColor(cell.likelihood, cell.impact)
                  )}
                  title={`L:${cell.likelihood} x I:${cell.impact} = ${cell.likelihood * cell.impact}`}
                >
                  {cell.risks.length > 0 && (
                    <div className="w-5 h-5 rounded-full bg-foreground/90 text-background flex items-center justify-center text-[10px] font-bold">
                      {cell.risks.length}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* X-axis label */}
          <div className="mt-2 text-center">
            <span className="text-xs text-muted-foreground">Impact →</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-success/50" />
          <span className="text-xs text-muted-foreground">Low</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-info/50" />
          <span className="text-xs text-muted-foreground">Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-warning/50" />
          <span className="text-xs text-muted-foreground">High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-destructive/50" />
          <span className="text-xs text-muted-foreground">Critical</span>
        </div>
      </div>
    </div>
  );
};

export default RiskMatrix;
