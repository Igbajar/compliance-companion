import { CheckCircle, XCircle, FileText, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ClauseCoverageWidgetProps {
  total: number;
  compliant: number;
  nonCompliant: number;
  percentage: number;
}

export default function ClauseCoverageWidget({
  total,
  compliant,
  nonCompliant,
  percentage,
}: ClauseCoverageWidgetProps) {
  const getPercentageColor = (pct: number) => {
    if (pct >= 80) return "text-green-600";
    if (pct >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (pct: number) => {
    if (pct >= 80) return "bg-green-500";
    if (pct >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Clause Coverage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Overall Compliance</span>
          <span className={`text-2xl font-bold ${getPercentageColor(percentage)}`}>
            {percentage}%
          </span>
        </div>
        
        <div className="relative">
          <Progress value={percentage} className="h-3" />
          <div
            className={`absolute top-0 left-0 h-3 rounded-full transition-all ${getProgressColor(percentage)}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-semibold">{total}</span>
            </div>
            <p className="text-xs text-muted-foreground">Total Clauses</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-lg font-semibold text-green-600">{compliant}</span>
            </div>
            <p className="text-xs text-muted-foreground">With Evidence</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-lg font-semibold text-red-600">{nonCompliant}</span>
            </div>
            <p className="text-xs text-muted-foreground">Gaps</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
