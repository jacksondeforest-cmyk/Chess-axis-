
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, ChevronRight, Zap, Crown, Star, TrendingUp, Brain,
  Swords, BarChart2, Clock, Users, BookOpen, Target, Sun, Moon, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/context/ThemeContext';

const LICHESS_ICON = () => (
  <svg viewBox="0 0 50 50" className="w-5 h-5" fill="currentColor">
    <path d="M38.956.5c-3.53.418-6.452 2.633-8.297 5.275L19.05 2.207v14.097l-2.773-4.644c-1.84-3.083-4.755-5.074-8.127-5.532C5.916 5.81 3.5 8.034 3.5 10.878v27.74C3.5 44.72 7.28 48.5 11.88 48.5h26.24C42.72 48.5 46.5 44.72 46.5 38.618V11.178C46.5 5.884 43.024 2.2 38.956.5zM11.88 44.5c-3.312 0-6-2.688-6-6v-27.74c0-1.038.84-1.878 1.878-1.878.43 0 .855.152 1.193.438C11.08 11.06 12.83 13.2 13.73 15.75l4.32 7.24V7.207l10.57 3.775c.59 2.08.6 4.37-.02 6.57L25 21.75v13.06l-2.22-5.97c-.81-2.18-2.65-3.67-4.78-3.67H11.88zm30.62-5.882c0 3.312-2.688 6-6 6H11.88l15.49-15.493V21.75l3.46-4.458c1.13-1.456 2.88-2.292 4.65-2.292h5.02v23.618z"/>
  </svg>
);

const CHESSCOM_ICON = () => (
  <svg viewBox="0 0 50 50" className="w-5 h-5" fill="currentColor">
    <path d="M25 2C12.318 2 2 12.318 2 25s10.318 23 23 23 23-10.318 23-23S37.682 2 25 2zm0 4c10.477 0 19 8.523 19 19s-8.523 19-19 19S6 34.477 6 25 14.523 6 25 6zm-5 8v22h10V14h-10zm2 2h6v18h-6V16z"/>
  </svg>
);

const DEMO_PLAYERS = [
  { name: 'DrNykterstein', platform: 'lichess', label: 'Magnus Carlsen' },
  { name: 'hikaru', platform: 'lichess', label: 'Hikaru Nakamura' },
];

const FEATURES = [
  {
    icon: BarChart2,
    title: 'Performance Overview',
    description: 'See your win/draw/loss rates, best streaks, accuracy trends, and overall stats across all time controls at a glance.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Rating History',
    description: 'Track your rating progression over time with interactive charts. Spot improvement phases and identify when your game dipped.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: BookOpen,
    title: 'Opening Explorer',
    description: 'Discover which openings you play most and how well you perform in each. Find your strongest lines and biggest weak spots.',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    icon: Brain,
    title: 'AI Insights',
    description: 'Get personalized AI-generated analysis of your play style, patterns, and actionable tips to improve your game faster.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Users,
    title: 'Opponent Scout',
    description: 'Analyze players you\'ve faced before or prepare for upcoming opponents — see their patterns, weaknesses, and tendencies.',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
  },
  {
    icon: Clock,
    title: 'Time Control Breakdown',
    description: 'Compare your performance across Bullet, Blitz, Rapid, and Classical. Find out which format suits your style best.',
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: Swords,
    title: 'Recent Games',
    description: 'Browse your latest games with an interactive board viewer, move-by-move replay, and result summaries.',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    icon: Target,
    title: 'Player Compare',
    description: 'Head-to-head comparison between two players — ratings, win rates, openings, and time controls side by side.',
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
  },
];

const STATS = [
  { value: '10+', label: 'Analytics Tabs' },
  { value: '2', label: 'Platforms Supported' },
  { value: 'AI', label: 'Powered Insights' },
  { value: '∞', label: 'Games Analyzed' },
];

export default function LandingPage() {
  const [username, setUsername] = useState('');
  const [platform, setPlatform] = useState<'lichess' | 'chesscom'>('lichess');
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleAnalyze = (u = username, p = platform) => {
    if (!u.trim()) return;
    navigate(`/player/${p}/${u.trim()}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 border border-primary/20 p-1.5">
            <Crown className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-lg tracking-tight">Chess Axis</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => navigate('/guide')} className="gap-1.5 text-muted-foreground">
            <HelpCircle className="h-4 w-4" /> Guide
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-4 py-16 md:py-24 flex flex-col items-center text-center chess-board-bg">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
              <Zap className="h-3 w-3" /> Lichess &amp; Chess.com Analytics
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="gradient-text">Chess Axis</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto mb-10">
              Your personal chess analytics dashboard. Enter any username to unlock deep stats, AI insights, opening analysis, and much more.
            </p>

            {/* Search Card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-lg max-w-lg mx-auto"
            >
              <div className="flex gap-2 mb-5 p-1 rounded-xl bg-muted">
                {(['lichess', 'chesscom'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${platform === p ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {p === 'lichess' ? <LICHESS_ICON /> : <CHESSCOM_ICON />}
                    {p === 'lichess' ? 'Lichess' : 'Chess.com'}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                    placeholder="Enter username…"
                    className="pl-9 h-12 text-base bg-muted/50"
                    autoFocus
                  />
                </div>
                <Button onClick={() => handleAnalyze()} disabled={!username.trim()} size="lg" className="h-12 px-6 gap-2 font-semibold">
                  Analyze <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2.5 flex items-center gap-1.5 justify-center">
                  <Star className="h-3 w-3" /> Try a demo player
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {DEMO_PLAYERS.map(d => (
                    <button
                      key={d.name}
                      onClick={() => handleAnalyze(d.name, d.platform as 'lichess' | 'chesscom')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-sm transition-colors"
                    >
                      {d.platform === 'lichess' ? <LICHESS_ICON /> : <CHESSCOM_ICON />}
                      <span className="font-medium">{d.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Stats Bar */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-y border-border bg-muted/30 py-8 px-4"
        >
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-primary mb-1">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Features Grid */}
        <section className="px-4 py-16 md:py-24 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to improve</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Chess Axis gives you a complete picture of your chess — from opening prep to endgame tendencies.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
              >
                <div className={`rounded-lg ${f.bg} p-2.5 w-fit mb-3`}>
                  <f.icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="px-4 py-16 text-center border-t border-border bg-muted/20"
        >
          <Crown className="h-10 w-10 text-primary mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to level up your chess?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Just enter your username — no account needed. Works with Lichess and Chess.com.
          </p>
          <Button size="lg" className="gap-2 font-semibold" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Get Started <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.section>
      </main>

      <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
        Chess Axis — Analytics for serious players
      </footer>
    </div>
  );
}
