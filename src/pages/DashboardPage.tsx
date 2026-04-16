
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPlayerStats, generateInsights, fetchRatingHistory } from 'zite-endpoints-sdk';
import type { FetchPlayerStatsOutputType, GenerateInsightsOutputType, FetchRatingHistoryOutputType } from 'zite-endpoints-sdk';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Sun, Moon, RefreshCw, ArrowLeft, Crown, ExternalLink, Share2, Sparkles } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import SkeletonDashboard from '@/components/SkeletonDashboard';
import OverviewTab from '@/components/dashboard/OverviewTab';
import TimeControlsTab from '@/components/dashboard/TimeControlsTab';
import OpeningsTab from '@/components/dashboard/OpeningsTab';
import OpponentsTab from '@/components/dashboard/OpponentsTab';
import TrendsTab from '@/components/dashboard/TrendsTab';
import RecentGamesTab from '@/components/dashboard/RecentGamesTab';
import AIInsightsTab from '@/components/dashboard/AIInsightsTab';
import OpeningExplorerTab from '@/components/dashboard/OpeningExplorerTab';
import CompareTab from '@/components/dashboard/CompareTab';
import OpponentScoutTab from '@/components/dashboard/OpponentScoutTab';
import GamePhaseTab from '@/components/dashboard/GamePhaseTab';
import ShareStatsModal from '@/components/ShareStatsModal';
import { toast } from 'sonner';

type Stats = FetchPlayerStatsOutputType['stats'];
type Insights = GenerateInsightsOutputType['insights'];
type RatingHistory = FetchRatingHistoryOutputType['history'];

const LICHESS_BADGE = () => <span className="px-2 py-0.5 rounded-md bg-primary/15 text-primary text-xs font-semibold">Lichess</span>;
const CHESSCOM_BADGE = () => <span className="px-2 py-0.5 rounded-md bg-chart-2/15 text-chart-2 text-xs font-semibold">Chess.com</span>;

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'time-controls', label: 'Time Controls' },
  { id: 'openings', label: 'Openings' },
  { id: 'opening-explorer', label: 'Explorer' },
  { id: 'opponents', label: 'Opponents' },
  { id: 'scout', label: 'Scout' },
  { id: 'trends', label: 'Trends' },
  { id: 'recent-games', label: 'Recent Games' },
  { id: 'game-phase', label: 'Game Phase' },
  { id: 'compare', label: 'Compare' },
  { id: 'ai-insights', label: 'AI Insights', isNew: true },
];

export default function DashboardPage() {
  const { platform, username } = useParams<{ platform: string; username: string }>();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [stats, setStats] = useState<Stats | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [ratingHistory, setRatingHistory] = useState<RatingHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [shareOpen, setShareOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!username || !platform) return;
    setIsLoading(true); setError(null);
    try {
      const result = await fetchPlayerStats({ username, platform: platform as 'lichess' | 'chesscom' });
      setStats(result.stats);
      setLastUpdated(new Date());

      setIsLoadingInsights(true);
      const insightResult = await generateInsights({
        username,
        stats: {
          overall: result.stats.overall,
          ratings: Object.fromEntries(Object.entries(result.stats.ratings).map(([k, v]) => [k, { rating: v.rating, games: v.games, wins: v.wins, losses: v.losses, draws: v.draws }])),
          colorStats: { white: { games: result.stats.colorStats.white.games, wins: result.stats.colorStats.white.wins, winRate: result.stats.colorStats.white.winRate }, black: { games: result.stats.colorStats.black.games, wins: result.stats.colorStats.black.wins, winRate: result.stats.colorStats.black.winRate } },
          openings: { asWhite: result.stats.openings.asWhite.slice(0, 5).map(o => ({ name: o.name, games: o.games, winRate: o.winRate })), asBlack: result.stats.openings.asBlack.slice(0, 5).map(o => ({ name: o.name, games: o.games, winRate: o.winRate })) },
          opponents: { avgOpponentRating: result.stats.opponents.avgOpponentRating, vsHigherRated: result.stats.opponents.vsHigherRated, vsLowerRated: result.stats.opponents.vsLowerRated },
          timeControls: result.stats.timeControls.map(tc => ({ name: tc.name, games: tc.games, winRate: tc.winRate, rating: tc.rating })),
          dayOfWeek: result.stats.dayOfWeek,
        },
      }).catch(() => null);
      if (insightResult) setInsights(insightResult.insights);
    } catch (e: any) {
      setError(e.message || 'Failed to load stats');
      toast.error(e.message || 'Failed to load stats');
    } finally {
      setIsLoading(false); setIsLoadingInsights(false);
    }
  }, [username, platform]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (activeTab === 'trends' && !ratingHistory && stats) {
      fetchRatingHistory({ username: username!, platform: platform as 'lichess' | 'chesscom' }).then(r => setRatingHistory(r.history)).catch(() => {});
    }
  }, [activeTab, ratingHistory, stats, username, platform]);

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">♟</div>
          <h2 className="text-2xl font-bold mb-2">Player Not Found</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate('/')} className="gap-2"><ArrowLeft className="h-4 w-4" />Back to Search</Button>
        </div>
      </div>
    );
  }

  const bestRating = stats ? Math.max(...Object.values(stats.ratings).map(r => r.rating).filter(r => r > 0), 0) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-full h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
            <Crown className="h-5 w-5 text-primary hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">{username}</span>
              {platform === 'lichess' ? <LICHESS_BADGE /> : <CHESSCOM_BADGE />}
              {bestRating > 0 && <span className="text-accent font-bold text-sm hidden sm:block">{bestRating}</span>}
            </div>
            {lastUpdated && <span className="text-xs text-muted-foreground hidden md:block">Updated {lastUpdated.toLocaleTimeString()}</span>}
          </div>
          <div className="flex items-center gap-1.5">
            {stats && <Button variant="ghost" size="sm" asChild className="gap-1.5 hidden sm:flex"><a href={stats.profile.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5" />Profile</a></Button>}
            {stats && (
              <Button variant="ghost" size="icon" onClick={() => setShareOpen(true)} className="rounded-full h-8 w-8" title="Share stats card">
                <Share2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={loadData} disabled={isLoading} className="rounded-full h-8 w-8"><RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /></Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full h-8 w-8">{theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <SkeletonDashboard />
      ) : (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 flex flex-wrap h-auto gap-1 bg-muted/50 p-1 w-full sm:w-auto">
              {TABS.map(tab => (
                <TabsTrigger key={tab.id} value={tab.id} className="text-xs sm:text-sm">
                  {tab.id === 'ai-insights' ? (
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-primary" />
                      {tab.label}
                      <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold leading-none">NEW</span>
                    </span>
                  ) : tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview"><OverviewTab stats={stats!} insights={insights} isLoadingInsights={isLoadingInsights} /></TabsContent>
            <TabsContent value="time-controls"><TimeControlsTab stats={stats!} /></TabsContent>
            <TabsContent value="openings"><OpeningsTab stats={stats!} insights={insights} /></TabsContent>
            <TabsContent value="opening-explorer"><OpeningExplorerTab stats={stats!} username={username!} platform={platform!} /></TabsContent>
            <TabsContent value="opponents"><OpponentsTab stats={stats!} /></TabsContent>
            <TabsContent value="scout"><OpponentScoutTab /></TabsContent>
            <TabsContent value="trends"><TrendsTab stats={stats!} ratingHistory={ratingHistory} insights={insights} /></TabsContent>
            <TabsContent value="recent-games"><RecentGamesTab stats={stats!} /></TabsContent>
            <TabsContent value="game-phase"><GamePhaseTab stats={stats!} insights={insights} /></TabsContent>
            <TabsContent value="compare"><CompareTab stats={stats!} username={username!} platform={platform!} /></TabsContent>
            <TabsContent value="ai-insights"><AIInsightsTab insights={insights} isLoading={isLoadingInsights} username={username || ''} /></TabsContent>
          </Tabs>
        </div>
      )}

      {stats && (
        <ShareStatsModal isOpen={shareOpen} onClose={() => setShareOpen(false)} stats={stats} username={username || ''} platform={platform || ''} />
      )}
    </div>
  );
}
