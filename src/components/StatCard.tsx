
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  gradient?: boolean;
  highlight?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function StatCard({ title, value, subtitle, icon, trend, trendLabel, gradient, highlight, className, children }: StatCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-chart-2' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground';

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        'rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md',
        highlight && 'border-primary/30 bg-primary/5',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && <div className="text-muted-foreground/60 shrink-0">{icon}</div>}
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div>
          <p className={cn('text-2xl font-bold tracking-tight tabular-nums', gradient && 'gradient-text')}>
            {value}
          </p>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {trend && trendLabel && (
          <div className={cn('flex items-center gap-1 text-xs font-medium', trendColor)}>
            <TrendIcon className="h-3 w-3" />
            {trendLabel}
          </div>
        )}
      </div>
      {children && <div className="mt-3">{children}</div>}
    </motion.div>
  );
}
