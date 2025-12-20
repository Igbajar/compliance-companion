interface ComplianceGaugeProps {
  percentage: number;
  label: string;
  standard: string;
}

const ComplianceGauge = ({ percentage, label, standard }: ComplianceGaugeProps) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 80) return "hsl(var(--success))";
    if (percentage >= 60) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="140" height="140" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="12"
          />
          {/* Progress circle */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="progress-ring"
            style={{
              filter: `drop-shadow(0 0 8px ${getColor()})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground">{percentage}%</span>
          <span className="text-xs text-muted-foreground mt-1">{standard}</span>
        </div>
      </div>
      <p className="mt-3 text-sm font-medium text-foreground">{label}</p>
    </div>
  );
};

export default ComplianceGauge;
