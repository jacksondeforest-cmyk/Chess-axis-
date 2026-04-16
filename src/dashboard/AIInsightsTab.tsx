
import { GenerateInsightsOutputType } from 'zite-endpoints-sdk';
import { motion } from 'framer-motion';
import { Sparkles, Target, Zap, ChevronRight, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import InsightCard from '@/components/InsightCard';
import ReportCard from '@/components/dashboard/ReportCard';
import ScrollReveal from '@/components/ScrollReveal';

type Insights = GenerateInsightsOutputType['insights'];

interface Props { insights: Insights | null; isLoading: boolean; username: string; }

function BetaBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-primary/25 bg-primary/10 text-primary text-[10px] font-bold leading-none tracking-wide">
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="shrink-0">
        <path d="M4 0.5L4.9 2.8L7.3 3L5.5 4.7L6 7.1L4 5.9L2 7.1L2.5 4.7L0.7 3L3.1 2.8L4 0.5Z" fill="currentColor"/>
      </svg>
      BETA
    </span>
  );
}

const PRIORITY_CONFIG = {
  high: { label: 'High Priority', bg: 'bg-destructive/10 border-destructive/25 text-destructive', dot: 'bg-destructive' },
  medium: { label: 'Medium', bg: 'bg-accent/10 border-accent/25 text-accent', dot: 'bg-accent' },
  low: { label: 'Low', bg: 'bg-chart-5/10 border-chart-5/25 text-chart-5', dot: 'bg-chart-5' },
};

function PriorityCard({ item, index }: { item: NonNullable<Insights>['trainingPriorities'][0]; index: number }) {
  const cfg = PRIORITY_CONFIG[item.priority];
  return (
    <ScrollReveal delay={index * 0.08}>
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-semibold shrink-0 ${cfg.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm mb-1">{item.area}</p>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{item.description}</p>
            <div className="flex items-start gap-2 bg-muted/40 rounded-lg p-3">
              <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">{item.advice}</p>
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
}

function QuickWinCard({ items }: { items: string[] }) {
  return (
    <div className="rounded-xl border border-chart-2/20 bg-chart-2/5 p-5 shadow-sm">
      <p className="text-sm font-semibold mb-3 flex items-center gap-2 text-chart-2">
        <Zap className="h-4 w-4" />Quick Wins — Easy improvements right now
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((win, i) => (
          <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-background/50 border border-chart-2/10">
            <Star className="h-3.5 w-3.5 text-chart-2 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">{win}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <Skeleton className="shimmer h-5 w-48 mb-4" />
        <Skeleton className="shimmer h-4 w-full mb-2" />
        <Skeleton className="shimmer h-4 w-5/6 mb-2" />
        <Skeleton className="shimmer h-4 w-4/6" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5">
          <Skeleton className="shimmer h-4 w-32 mb-3" />
          <Skeleton className="shimmer h-3 w-full mb-2" />
          <Skeleton className="shimmer h-3 w-5/6" />
        </div>
      ))}
    </div>
  );
}

export default function AIInsightsTab({ insights, isLoading, username }: Props) {
  if (isLoading) return <LoadingSkeleton />;

  if (!insights) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Sparkles className="h-12 w-12 text-primary/40 mb-4" />
        <h3 className="text-lg font-semibold mb-2">AI Insights Unavailable</h3>
        <p className="text-muted-foreground text-sm">Could not generate insights. Please refresh the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Summary — Hero card */}
      <ScrollReveal>
        <motion.div
          className="rounded-2xl border border-primary/25 bg-primary/5 p-6 shadow-sm relative overflow-hidden"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-8 translate-x-8 blur-2xl pointer-events-none" />
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-2.5 shrink-0 relative">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-semibold text-primary">AI Executive Summary</p>
                <BetaBadge />
              </div>
              <p className="text-sm leading-relaxed text-foreground">{insights.executiveSummary}</p>
            </div>
          </div>
        </motion.div>
      </ScrollReveal>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ScrollReveal delay={0.05}>
          <InsightCard type="success" title="Your Strengths" insights={insights.strengths} />
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <InsightCard type="warning" title="Areas to Improve" insights={insights.weaknesses} />
        </ScrollReveal>
      </div>

      {/* Training Priorities */}
      <ScrollReveal delay={0.1}>
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-base">Training Priorities</h3>
            <span className="text-xs text-muted-foreground">— ranked by impact on your rating</span>
          </div>
          <div className="space-y-3">
            {insights.trainingPriorities.map((item, i) => (
              <PriorityCard key={i} item={item} index={i} />
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* Quick Wins */}
      {insights.quickWins.length > 0 && (
        <ScrollReveal delay={0.15}>
          <QuickWinCard items={insights.quickWins} />
        </ScrollReveal>
      )}

      {/* Report Card */}
      <ScrollReveal delay={0.2}>
        <ReportCard reportCard={insights.reportCard} />
      </ScrollReveal>

      {/* Opening Insights */}
      {insights.openingInsights.length > 0 && (
        <ScrollReveal delay={0.25}>
          <InsightCard type="info" title="Opening Analysis" insights={insights.openingInsights} />
        </ScrollReveal>
      )}

      {/* Prediction */}
      {insights.prediction && (
        <ScrollReveal delay={0.3}>
          <InsightCard type="prediction" title="Rating Prediction" insights={[insights.prediction, insights.trendsInsight].filter(Boolean)} />
        </ScrollReveal>
      )}
    </div>
  );
}
