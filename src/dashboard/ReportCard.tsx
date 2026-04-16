
import { GenerateInsightsOutputType } from 'zite-endpoints-sdk';

type ReportCard = GenerateInsightsOutputType['insights']['reportCard'];

const GRADE_COLOR: Record<string, string> = {
  'A+': 'text-chart-2', 'A': 'text-chart-2', 'A-': 'text-chart-2',
  'B+': 'text-primary', 'B': 'text-primary', 'B-': 'text-primary',
  'C+': 'text-accent', 'C': 'text-accent', 'C-': 'text-accent',
  'D': 'text-destructive',
};

const GRADE_BG: Record<string, string> = {
  'A+': 'bg-chart-2/10 border-chart-2/20', 'A': 'bg-chart-2/10 border-chart-2/20', 'A-': 'bg-chart-2/10 border-chart-2/20',
  'B+': 'bg-primary/10 border-primary/20', 'B': 'bg-primary/10 border-primary/20', 'B-': 'bg-primary/10 border-primary/20',
  'C+': 'bg-accent/10 border-accent/20', 'C': 'bg-accent/10 border-accent/20', 'C-': 'bg-accent/10 border-accent/20',
  'D': 'bg-destructive/10 border-destructive/20',
};

function GradeItem({ label, grade, explanation }: { label: string; grade: string; explanation: string }) {
  const color = GRADE_COLOR[grade] || 'text-muted-foreground';
  const bg = GRADE_BG[grade] || 'bg-muted border-border';
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
      <div className={`flex-shrink-0 w-10 h-10 rounded-lg border flex items-center justify-center font-bold text-lg ${bg} ${color}`}>{grade}</div>
      <div className="min-w-0">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{explanation}</p>
      </div>
    </div>
  );
}

export default function ReportCard({ reportCard }: { reportCard: ReportCard }) {
  const items = [
    { label: 'Openings', ...reportCard.openings },
    { label: 'Tactical Play', ...reportCard.tactical },
    { label: 'Endgame', ...reportCard.endgame },
    { label: 'Consistency', ...reportCard.consistency },
    { label: 'Time Management', ...reportCard.timeManagement },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <p className="text-sm font-semibold mb-4 flex items-center gap-2">
        <span className="text-lg">📋</span> Performance Report Card
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map(item => <GradeItem key={item.label} label={item.label} grade={item.grade} explanation={item.explanation} />)}
      </div>
    </div>
  );
}
