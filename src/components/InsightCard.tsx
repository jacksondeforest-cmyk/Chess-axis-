
import { Lightbulb, TrendingUp, Target, Sparkles, AlertTriangle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type InsightType = 'info' | 'success' | 'warning' | 'prediction' | 'tactical';

interface InsightCardProps {
  type?: InsightType;
  title?: string;
  insights: string[];
  className?: string;
}

const CONFIG: Record<InsightType, { icon: React.ElementType; border: string; bg: string; text: string; iconColor: string }> = {
  info: { icon: Lightbulb, border: 'border-primary/25', bg: 'bg-primary/5', text: 'text-foreground', iconColor: 'text-primary' },
  success: { icon: TrendingUp, border: 'border-chart-2/25', bg: 'bg-chart-2/5', text: 'text-foreground', iconColor: 'text-chart-2' },
  warning: { icon: AlertTriangle, border: 'border-accent/25', bg: 'bg-accent/5', text: 'text-foreground', iconColor: 'text-accent' },
  prediction: { icon: Sparkles, border: 'border-chart-5/25', bg: 'bg-chart-5/5', text: 'text-foreground', iconColor: 'text-chart-5' },
  tactical: { icon: Zap, border: 'border-chart-3/25', bg: 'bg-chart-3/5', text: 'text-foreground', iconColor: 'text-chart-3' },
};

export default function InsightCard({ type = 'info', title, insights, className }: InsightCardProps) {
  const cfg = CONFIG[type];
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={cn('rounded-xl border p-4', cfg.border, cfg.bg, className)}
    >
      <div className="flex items-start gap-3">
        <div className={cn('mt-0.5 shrink-0 rounded-lg p-1.5', cfg.bg, 'border', cfg.border)}>
          <Icon className={cn('h-4 w-4', cfg.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          {title && <p className="text-sm font-semibold mb-1.5">{title}</p>}
          <ul className="space-y-1.5">
            {insights.map((insight, i) => (
              <li key={i} className="text-sm text-muted-foreground leading-relaxed">
                {insight}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
