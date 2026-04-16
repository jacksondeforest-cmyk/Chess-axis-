
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Crown, BookOpen, BarChart2, TrendingUp, Users, Swords,
  Clock, Brain, Search, Target, Layers, ChevronRight, ChevronDown,
  Star, Zap, Trophy, Flame, Eye, Share2, RefreshCw, Sun, Moon,
  Monitor, GitCompare, Map, ScanSearch, Sparkles, Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';

interface Section {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
      {children}
    </span>
  );
}

function InfoBox({ children, type = 'info' }: { children: React.ReactNode; type?: 'info' | 'tip' | 'note' }) {
  const cfg = {
    info: 'bg-primary/5 border-primary/20 text-primary',
    tip: 'bg-chart-2/5 border-chart-2/20 text-chart-2',
    note: 'bg-chart-4/5 border-chart-4/20 text-chart-4',
  };
  return (
    <div className={`rounded-lg border p-3 text-xs leading-relaxed ${cfg[type]}`}>
      {children}
    </div>
  );
}

function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h4 className="text-sm font-semibold mb-2 text-foreground">{title}</h4>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

function StatBullet({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="flex gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
      <p><span className="font-semibold text-foreground">{label}:</span> {desc}</p>
    </div>
  );
}

const SECTIONS: Section[] = [
  {
    id: 'landing',
    icon: Crown,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    title: 'Home Page (Landing)',
    subtitle: 'Where you start — search any player on any platform',
    content: (
      <div className="space-y-4">
        <SectionBlock title="What is this page?">
          <p>The Chess Axis home page is the first thing you see when you visit the site. Its entire purpose is to let you look up any chess player and launch their analytics dashboard. No account or login is required — just type a username and go.</p>
        </SectionBlock>
        <SectionBlock title="Platform Toggle">
          <p>At the top of the search card is a platform selector. Click either button to switch between:</p>
          <div className="space-y-1 mt-2">
            <StatBullet label="Lichess" desc="The free, open-source platform at lichess.org. Supports all Lichess usernames including titled players, bots, and casual accounts." />
            <StatBullet label="Chess.com" desc="The world's largest chess platform. Enter any Chess.com username to pull that player's stats and game history." />
          </div>
        </SectionBlock>
        <SectionBlock title="Username Search">
          <p>Type any valid username into the search bar. The app accepts any casing — it's not case-sensitive. Press <Chip>Enter</Chip> or click the <Chip>Analyze →</Chip> button to load the dashboard. If the username doesn't exist on the selected platform, you'll see a clear error.</p>
        </SectionBlock>
        <SectionBlock title="Demo Players">
          <p>Below the search bar, two pre-loaded demo players are available:</p>
          <div className="space-y-1 mt-2">
            <StatBullet label="Magnus Carlsen (DrNykterstein)" desc="World Chess Champion's Lichess account — perfect to see what high-level analytics look like." />
            <StatBullet label="Hikaru Nakamura" desc="Top streamer and GM — great for exploring lots of Blitz and Bullet data." />
          </div>
          <p className="mt-2">Click either demo button to instantly load their full analytics without typing anything.</p>
        </SectionBlock>
        <SectionBlock title="Feature Summary Cards">
          <p>Scrolling down shows 8 feature cards, a stats bar, and a bottom call-to-action. These explain every section of the dashboard so you know what to expect before searching.</p>
        </SectionBlock>
        <InfoBox type="tip">💡 You can analyze <strong>any</strong> player — not just yourself! Scout opponents, compare with friends, or study titled players to learn from their opening choices.</InfoBox>
      </div>
    ),
  },
  {
    id: 'overview',
    icon: BarChart2,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    title: 'Overview Tab',
    subtitle: 'Your complete performance snapshot at a glance',
    content: (
      <div className="space-y-4">
        <SectionBlock title="What is the Overview Tab?">
          <p>The Overview tab is the first thing you see after loading a player. It gives a full birds-eye view of that player's chess career — key numbers, charts, streaks, and an AI summary — all without having to dig into any other tab.</p>
        </SectionBlock>
        <SectionBlock title="Hero Stat Cards">
          <p>Four large stat cards appear at the top:</p>
          <div className="space-y-1 mt-2">
            <StatBullet label="Total Games" desc="The total number of games played across all formats and time controls on the selected platform. Also shows how many games were played this month." />
            <StatBullet label="Win Rate %" desc="The percentage of games won overall. Shown with the full W/L/D breakdown below it." />
            <StatBullet label="Best Rating" desc="The highest Elo rating achieved across all time controls (Bullet, Blitz, Rapid, Classical). Highlighted in gold if over 2000." />
            <StatBullet label="This Month" desc="Games played in the current calendar month — useful for tracking recent activity." />
          </div>
        </SectionBlock>
        <SectionBlock title="Win / Loss / Draw Donut Chart">
          <p>A donut (ring) chart visualizes the proportion of wins, losses, and draws. Hover over each slice to see the exact count. The chart uses color-coded segments: green for wins, muted for draws, red for losses.</p>
        </SectionBlock>
        <SectionBlock title="White vs. Black Bar Chart">
          <p>A bar chart comparing the player's win rate when playing White versus Black. Most players perform differently by color — this quickly shows if there's a significant gap. Hover each bar to see the exact win rate percentage.</p>
        </SectionBlock>
        <SectionBlock title="Streak Section">
          <p>Three streak badges are displayed:</p>
          <div className="space-y-1 mt-2">
            <StatBullet label="Current Streak" desc="Whether the player is currently on a win, loss, or draw streak, and how many games long it is." />
            <StatBullet label="Longest Win Streak" desc="The best consecutive win streak ever recorded in the fetched game history." />
            <StatBullet label="Longest Loss Streak" desc="The longest losing run — useful for identifying rough patches." />
          </div>
        </SectionBlock>
        <SectionBlock title="AI Overview & Insights">
          <p>At the bottom of the overview, AI-generated text analysis appears automatically. This includes:</p>
          <div className="space-y-1 mt-2">
            <StatBullet label="AI Overview" desc="A 2–4 sentence summary of the player's overall chess style, activity, and level." />
            <StatBullet label="Strengths" desc="A bullet list of things the player does well, derived from their stats." />
            <StatBullet label="Areas to Improve" desc="Specific weaknesses or gaps in their game to work on." />
            <StatBullet label="Report Card" desc="Letter grades (A through F) for Opening, Tactical, Endgame, Consistency, and Time Management." />
            <StatBullet label="Prediction" desc="An AI forecast of where the player's rating is likely heading based on recent trends." />
          </div>
        </SectionBlock>
        <InfoBox type="note">📌 The AI insights are generated fresh every time you load a player. They use GPT-4 to analyze the player's actual stats, so results are personalized and specific.</InfoBox>
      </div>
    ),
  },
  {
    id: 'time-controls',
    icon: Clock,
    iconColor: 'text-cyan-500',
    iconBg: 'bg-cyan-500/10',
    title: 'Time Controls Tab',
    subtitle: 'Your performance broken down by Bullet, Blitz, Rapid & Classical',
    content: (
      <div className="space-y-4">
        <SectionBlock title="What is this tab?">
          <p>Different time controls require very different skills — a Bullet expert might collapse in Classical games. The Time Controls tab breaks your stats down by every format you've played, letting you find where you're strongest and weakest.</p>
        </SectionBlock>
        <SectionBlock title="Time Control Cards">
          <p>Each time control you've played gets its own card showing:</p>
          <div className="space-y-1 mt-2">
            <StatBullet label="Current Rating" desc="Your Elo in that specific time control." />
            <StatBullet label="Rating Range" desc="Your minimum and maximum ratings achieved — shows how much your rating has fluctuated." />
            <StatBullet label="Win / Loss / Draw counts" desc="Absolute numbers for each outcome." />
            <StatBullet label="Win Rate" desc="Percentage of games won in this format." />
            <StatBullet label="Games Played" desc="Total games in this format." />
            <StatBullet label="Recent Form" desc="A row of colored dots (green = win, red = loss, gray = draw) showing your last 10 results in this format at a glance." />
          </div>
        </SectionBlock>
        <SectionBlock title="Comparison Chart">
          <p>A bar chart compares win rates across all time controls side by side. This makes it instantly clear which format you dominate and which you struggle in.</p>
        </SectionBlock>
        <SectionBlock title="Rating Comparison Chart">
          <p>A second chart compares your raw rating numbers across formats, so you can see if your Blitz rating is higher than your Rapid, for example.</p>
        </SectionBlock>
        <InfoBox type="tip">💡 Most players who want to improve should focus their practice on Rapid or Classical rather than Bullet — slower formats reward deeper thinking.</InfoBox>
      </div>
    ),
  },
  {
    id: 'openings',
    icon: BookOpen,
    iconColor: 'text-violet-500',
    iconBg: 'bg-violet-500/10',
    title: 'Openings Tab',
    subtitle: 'Discover which openings you play and how well you score in each',
    content: (
      <div className="space-y-4">
        <SectionBlock title="What is this tab?">
          <p>The Openings tab reveals your opening repertoire — which openings you play most, your win rate in each, and how you compare as White versus Black. Understanding your opening performance is one of the fastest ways to find rating points.</p>
        </SectionBlock>
        <SectionBlock title="First Move Frequency Chart (White)">
          <p>A pie chart shows which first moves you play most often when you have White pieces (e.g., 1.e4, 1.d4, 1.Nf3). The size of each slice represents how often you choose that move. This reveals your opening style — aggressive, positional, or varied.</p>
        </SectionBlock>
        <SectionBlock title="Win Rate by First Move">
          <p>A bar chart shows your win rate for each first move. You might play 1.e4 most often but win more games starting with 1.d4. This kind of insight can directly improve your results.</p>
        </SectionBlock>
        <SectionBlock title="Opening Tables (White & Black)">
          <p>Two detailed tables list your top openings split by color:</p>
          <div className="space-y-1 mt-2">
            <StatBullet label="ECO Code" desc="The Encyclopedia of Chess Openings code (e.g., B20 = Sicilian Defense). Click any name to research it." />
            <StatBullet label="Opening Name" desc="The full name of the opening or variation." />
            <StatBullet label="Games" desc="How many times you've played this opening." />
            <StatBullet label="Win Rate %" desc="Color-coded: green (≥55%) means strong, red (≤40%) means weak. A progress bar shows the rate visually." />
          </div>
        </SectionBlock>
        <SectionBlock title="AI Opening Insights">
          <p>Below the tables, AI-generated bullet points highlight your best and worst openings, patterns in your choices, and specific recommendations for openings to adopt or drop.</p>
        </SectionBlock>
        <InfoBox type="note">📌 Win rates under 40% in a frequently-played opening are a red flag. Consider switching to a different line, or studying the theory more deeply.</InfoBox>
      </div>
    ),
  },
  {
    id: 'opening-explorer',
    icon: Map,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-500/10',
    title: 'Opening Explorer Tab',
    subtitle: 'Drill into your opening tree move-by-move with a live board',
    content: (
      <div className="space-y-4">
        <SectionBlock title="What is the Opening Explorer?">
          <p>While the Openings tab gives a summary, the Explorer goes deeper. It builds an interactive opening tree from your actual game history, letting you navigate your specific lines move-by-move with a live chessboard.</p>
        </SectionBlock>
        <SectionBlock title="Interactive Board">
          <p>A fully interactive chess board is displayed on the left. As you click moves in the tree, the pieces move on the board so you can see exactly what position you're analyzing.</p>
        </SectionBlock>
        <SectionBlock title="Move Tree">
          <p>On the right is a tree of moves with stats for each branch:</p>
          <div className="space-y-1 mt-2">
            <StatBullet label="Move" desc="The chess move in algebraic notation (e.g., e4, Nf3)." />
            <StatBullet label="Games" desc="How many of your games went through this move." />
            <StatBullet label="Win Rate" desc="Your win rate in games that featured this line." />
            <StatBullet label="Depth" desc="You can click to go deeper into sub-variations, seeing exactly where you deviate from theory." />
          </div>
        </SectionBlock>
        <SectionBlock title="Color Toggle">
          <p>Switch between analyzing your games as White or Black. The board flips automatically so you always see it from your perspective.</p>
        </SectionBlock>
        <InfoBox type="tip">💡 Look for lines where you have many games but a low win rate — these are your most impactful improvement targets.</InfoBox>
      </div>
    ),
  },
  {
    id: 'opponents',
    icon: Users,
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-500/10',
    title: 'Opponents Tab',
    subtitle: 'Who you play against, your history with them, and your nemeses',
    content: (
      <div className="space-y-4">
        <SectionBlock title="What is this tab?">
          <p>The Opponents tab analyzes who you've played against. Understanding your performance against different skill levels and tracking your rivalry history can reveal hidden patterns in your game.</p>
        </SectionBlock>
        <SectionBlock title="Opponent Rating Breakdown">
          <p>Three cards show your win rate split by opponent strength:</p>
          <div className="space-y-1 mt-2">
            <StatBullet label="vs Higher-Rated" desc="Win rate against opponents rated above you — measures your 'upset' ability." />
            <StatBullet label="vs Similar-Rated" desc="Win rate against players near your level — the most accurate measure of true strength." />
            <StatBullet label="vs Lower-Rated" desc="Win rate against players below you — should be high; if it's not, you may have consistency issues." />
          </div>
        </SectionBlock>
        <SectionBlock title="Average Opponent Rating">
          <p>Shows the average Elo of your opponents. This helps contextualize your win rate — a 60% win rate against 200-point higher opponents is much more impressive than against lower-rated players.</p>
        </SectionBlock>
        <SectionBlock title="Most Frequent Opponents">
          <p>A table listing players you've faced the most, with your total games, wins, losses, draws, and win rate against each. Sorted by number of games played.</p>
        </SectionBlock>
        <SectionBlock title="Nemeses">
          <p>A special section called "Nemeses" highlights players you've played multiple times but have a poor record against — your personal chess arch-enemies. These are great targets to analyze and prepare for specifically.</p>
        </SectionBlock>
        <InfoBox type="note">📌 If your win rate vs lower-rated players is below 60%, you may be losing games you should win — this is often a psychological or time-management issue.</InfoBox>
      </div>
    ),
  },
  {
    id: 'scout',
    icon: ScanSearch,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-500/10',
    title: 'Scout Tab',
    subtitle: 'Deep-dive into any opponent\'s stats before you face them',
    content: (
      <div className="space-y-4">
        <SectionBlock title="What is the Scout Tab?">
          <p>The Scout tab lets you look up any other player's stats from within your own dashboard. Unlike going back to the home page, this is designed for quick opponent research — you can compare their openings, ratings, and tendencies against your own game.</p>
        </SectionBlock>
        <SectionBlock title="How to use it">
          <p>Enter any username in the search bar at the top of the Scout tab and select the platform (Lichess or Chess.com). Their stats load directly inside your dashboard — no navigation required.</p>
        </SectionBlock>
        <SectionBlock title="What you can see">
          <p>The Scout tab displays a full stat summary for the target player including:</p>
          <div className="space-y-1 mt-2">
            <StatBullet label="Rating & activity" desc="Their current Elo, total games, and win rate." />
            <StatBullet label="Openings" desc="The openings they play most as White and Black — great for pre-game preparation." />
            <StatBullet label="Strengths & weaknesses" desc="AI-generated analysis of what they do well and where they're vulnerable." />
            <StatBullet label="Recent form" desc="Their last few games to see if they're on a hot or cold streak." />
          </div>
        </SectionBlock>
        <InfoBox type="tip">💡 Before a tournament game, scout your opponent to find which openings they play as White. Then prepare a sharp line they're less familiar with.</InfoBox>
      </div>
    ),
  },
  {
    id: 'trends',
    icon: TrendingUp,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-500/10',
    title: 'Trends Tab',
    subtitle: 'Rating progression over time, day-of-week analysis, and format activity',
    content: (
      <div className="space-y-4">
        <SectionBlock title="What is the Trends Tab?">
          <p>The Trends tab shows how a player has evolved over time. Instead of static snapshots, this is about the journey — rating changes, activity patterns, and momentum. It's the tab that tells you if you're improving or plateauing.</p>
        </SectionBlock>
        <SectionBlock title="Rating Progression Chart">
          <p>An interactive line chart shows rating history across time controls (Bullet, Blitz, Rapid, Classical). Each format gets its own colored line. You can:</p>
          <div className="space-y-1 mt-2">
            <StatBullet label="Hover data points" desc="See the exact rating on any given date." />
            <StatBullet label="Filter time range" desc="Use the 3m / 6m / 12m / All buttons to zoom in on a specific period." />
            <StatBullet label="Compare formats" desc="See if your Blitz rating is climbing while Rapid is declining, for example." />
          </div>
        </SectionBlock>
        <SectionBlock title="Performance by Day of Week">
          <p>A 7-cell heatmap grid shows your win rate for each day of the week (Mon–Sun). Greener cells mean better performance. This reveals patterns like "I always lose on Mondays" or "I play my best chess on weekends."</p>
          <p className="mt-2">Each cell also shows the total number of games played on that day, so you can distinguish statistical flukes (1 game) from real patterns (50+ games).</p>
        </SectionBlock>
        <SectionBlock title="Time Control Distribution Bar Chart">
          <p>A bar chart shows how many games you've played in each format. This quickly shows whether you're primarily a Bullet player, a Rapid player, or well-balanced across formats.</p>
        </SectionBlock>
        <SectionBlock title="AI Trend Analysis">
          <p>At the bottom, AI-generated insights describe the key trends it detects — whether your rating is trending up or down, which format shows the most improvement, and a forward-looking prediction.</p>
        </SectionBlock>
        <InfoBox type="note">📌 Rating history loads separately from main stats (it's a larger dataset). If the chart is empty, wait a moment or switch away and back to this tab.</InfoBox>
      </div>
    ),
  },
  {
    id: 'recent-games',
    icon: Layers,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-500/10',
    title: 'Recent Games Tab',
    subtitle: 'Browse your latest games with an interactive board viewer',
    content: (
      <div className="space-y-4">
        <SectionBlock title="What is this tab?">
          <p>The Recent Games tab lists your most recently played games with a clean, expandable list view. It's designed for quickly reviewing what happened in your recent sessions.</p>
        </SectionBlock>
        <SectionBlock title="Results Summary Bar">
          <p>At the top, a quick summary shows your wins, losses, and draws in the fetched games, along with a colorful progress bar. This gives instant context — "I won 14 out of my last 20 games."</p>
        </SectionBlock>
        <SectionBlock title="Game List">
          <p>Each game is shown as a row containing:</p>
          <div className="space-y-1 mt-2">
            <StatBullet label="Result badge" desc="Colored Win/Loss/Draw badge." />
            <StatBullet label="Opponent" desc="Their username and rating in parentheses." />
            <StatBullet label="Time control" desc="An icon and label showing Bullet (⚡), Blitz (🔥), Rapid (🕐), or Classical (⏳)." />
            <StatBullet label="Opening" desc="The name of the opening played, if available." />
            <StatBullet label="Date" desc="When the game was played." />
          </div>
        </SectionBlock>
        <SectionBlock title="Expanding a Game">
          <p>Click any game row to expand it. This reveals a full game breakdown including:</p>
          <div className="space-y-1 mt-2">
            <StatBullet label="Interactive Chess Board" desc="The game is loaded onto a real chess board. Use the arrow buttons to step through every single move, watching the pieces move." />
            <StatBullet label="Player details" desc="Both players' usernames and ratings are shown." />
            <StatBullet label="Opening info" desc="The full ECO code and opening name." />
            <StatBullet label="View on platform link" desc="A direct link opens the game on Lichess or Chess.com, where you can see the full analysis engine, chat, and more." />
          </div>
        </SectionBlock>
        <InfoBox type="tip">💡 Use the interactive board to replay your losses and try to spot the exact move where things went wrong — this is one of the best ways to improve.</InfoBox>
      </div>
    ),
  },
  {
    id: 'game-phase',
    icon: Target,
    iconColor: 'text-pink-500',
    iconBg: 'bg-pink-500/10',
    title: 'Game Phase Tab',
    subtitle: 'Opening, Middlegame, and Endgame performance breakdown',
    content: (
      <div className="space-y-4">
        <SectionBlock title="What is the Game Phase Tab?">
          <p>Chess games have three distinct phases — Opening, Middlegame, and Endgame — and every player has different strengths in each. This tab analyzes which phase your games are being won and lost in.</p>
        </SectionBlock>
        <SectionBlock title="Phase Classification">
          <p>Games are automatically classified by how many moves were played:</p>
          <div className="space-y-1 mt-2">
            <StatBullet label="Opening (≤20 moves)" desc="Games that ended quickly — either a brilliant attack, a blunder in preparation, or a resignation after a well-played opening." />
            <StatBullet label="Middlegame (21–40 moves)" desc="The most complex phase. Tactical battles, piece coordination, and attacking/defensive play determine the outcome." />
            <StatBullet label="Endgame (40+ moves)" desc="Games that reached late-stage play — kings become active, pawn structure matters most, and technique is key." />
          </div>
        </SectionBlock>
        <SectionBlock title="Phase Cards">
          <p>Three cards show your win rate, win/draw/loss counts, a mini progress bar, and a trend indicator (↑ strong, → average, ↓ weak) for each phase.</p>
        </SectionBlock>
        <SectionBlock title="W/D/L Bar Chart by Phase">
          <p>A grouped bar chart shows your wins, draws, and losses across all three phases — letting you visually compare volume and results at a glance.</p>
        </SectionBlock>
        <SectionBlock title="Skill Radar Chart">
          <p>A radar (spider web) chart maps your abilities across 5 skill areas: Opening, Tactical, Endgame, Consistency, and Time Management. The scores come from the AI report card. A wide, even shape means well-rounded — spiky shapes reveal strengths and gaps.</p>
        </SectionBlock>
        <SectionBlock title="Phase Report Card">
          <p>Detailed AI grades with letter grades (A+ to F) and a written explanation for each skill area:</p>
          <div className="space-y-1 mt-2">
            <StatBullet label="Opening Knowledge" desc="How well-prepared your opening choices are." />
            <StatBullet label="Tactical Vision" desc="Your ability to spot and execute tactics." />
            <StatBullet label="Endgame Technique" desc="How well you convert advantages in the endgame." />
            <StatBullet label="Consistency" desc="Whether your results are stable or wildly variable." />
            <StatBullet label="Time Management" desc="How efficiently you use your clock." />
          </div>
        </SectionBlock>
        <SectionBlock title="Phase-Based Tips">
          <p>At the bottom, three personalized tip cards give targeted advice based on your actual win rates in each phase — whether you're strong, average, or struggling.</p>
        </SectionBlock>
        <InfoBox type="tip">💡 If your Opening win rate is low, study the Openings and Opening Explorer tabs. If your Endgame rate is low, practice King and Pawn endings online.</InfoBox>
      </div>
    ),
  },
  {
    id: 'compare',
    icon: GitCompare,
    iconColor: 'text-teal-500',
    iconBg: 'bg-teal-500/10',
    title: 'Compare Tab',
    subtitle: 'Head-to-head stats between two players side by side',
    content: (
      <div className="space-y-4">
        <SectionBlock title="What is the Compare Tab?">
          <p>The Compare tab lets you load a second player and place their stats next to yours side by side. Everything is synchronized — same format, same categories — making it easy to see exactly where one player is stronger.</p>
        </SectionBlock>
        <SectionBlock title="Loading a Comparison Player">
          <p>Enter a second username in the search field at the top of the Compare tab. You can choose the same platform or a different one. Their data is fetched in the background.</p>
        </SectionBlock>
        <SectionBlock title="Side-by-Side Stats">
          <p>Once both players are loaded, a comprehensive comparison appears with:</p>
          <div className="space-y-1 mt-2">
            <StatBullet label="Win Rate" desc="Who wins more games — shown with the difference highlighted." />
            <StatBullet label="Rating per format" desc="Ratings across Bullet, Blitz, Rapid, Classical shown in parallel." />
            <StatBullet label="Total games" desc="Activity comparison — who plays more chess." />
            <StatBullet label="Color performance" desc="Win rates as White and as Black for each player." />
            <StatBullet label="Openings" desc="Most-played openings for each player." />
          </div>
        </SectionBlock>
        <SectionBlock title="Radar Chart Comparison">
          <p>An overlapping radar chart plots both players on the same spider web. This makes it instantly clear who has a more well-rounded profile and where each player has an edge.</p>
        </SectionBlock>
        <InfoBox type="tip">💡 Compare yourself to a player just above your rating level to identify exactly which areas they outperform you in — those are your growth targets.</InfoBox>
      </div>
    ),
  },
  {
    id: 'ai-insights',
    icon: Sparkles,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    title: 'AI Insights Tab',
    subtitle: 'Deep GPT-4 powered analysis of your entire chess profile',
    content: (
      <div className="space-y-4">
        <SectionBlock title="What is the AI Insights Tab?">
          <p>The AI Insights tab is the most powerful section of Chess Axis. It uses GPT-4 to analyze your full stats profile and generate a rich, detailed written report on your chess. Unlike the brief AI snippets on the Overview tab, this is a complete breakdown.</p>
        </SectionBlock>
        <SectionBlock title="Overview Analysis">
          <p>A multi-sentence overview describes the player's style, activity level, platform history, and overall standing. This is a narrative description, not just numbers.</p>
        </SectionBlock>
        <SectionBlock title="Strengths">
          <p>A detailed bullet list of genuine strengths derived from the stats — for example: "Performs exceptionally well in Blitz format," "Shows strong results with the Sicilian Defense," or "Excellent record vs lower-rated players."</p>
        </SectionBlock>
        <SectionBlock title="Areas to Improve">
          <p>Specific, actionable weaknesses highlighted by the AI — for example: "Win rate drops significantly in Classical games," "Struggles with the Black pieces against 1.d4," or "Inconsistent performance on weekday evenings."</p>
        </SectionBlock>
        <SectionBlock title="Report Card">
          <p>Five skill categories graded A+ through F:</p>
          <div className="space-y-1 mt-2">
            <StatBullet label="Opening Knowledge" desc="Grade + written explanation of opening preparation quality." />
            <StatBullet label="Tactical Vision" desc="Grade + explanation of tactical strength based on accuracy patterns." />
            <StatBullet label="Endgame Technique" desc="Grade + explanation of endgame performance." />
            <StatBullet label="Consistency" desc="Grade + explanation of result stability over time." />
            <StatBullet label="Time Management" desc="Grade + explanation of clock usage habits across formats." />
          </div>
        </SectionBlock>
        <SectionBlock title="Opening Insights">
          <p>Specific observations about the opening choices — which ECOs are performing well, which openings the AI recommends exploring, and patterns in the repertoire.</p>
        </SectionBlock>
        <SectionBlock title="Prediction">
          <p>A forward-looking forecast: based on current trends, form, and patterns, where is the player's rating likely to go next? This is an educated AI prediction, not a guarantee.</p>
        </SectionBlock>
        <InfoBox type="note">📌 AI Insights generate automatically in the background when you first load a player. If they show as loading, wait 10–15 seconds — they're being freshly generated by GPT-4.</InfoBox>
      </div>
    ),
  },
  {
    id: 'header',
    icon: Monitor,
    iconColor: 'text-muted-foreground',
    iconBg: 'bg-muted',
    title: 'Dashboard Header & Controls',
    subtitle: 'Navigation, refresh, sharing, and theme controls',
    content: (
      <div className="space-y-4">
        <SectionBlock title="Sticky Header">
          <p>The dashboard header stays fixed at the top of the screen as you scroll. It always shows the current player's username, their platform badge, and peak rating.</p>
        </SectionBlock>
        <SectionBlock title="Back Button">
          <p>The ← arrow button on the left returns you to the home page to search a new player. Your previous search isn't remembered, so you'll need to type again.</p>
        </SectionBlock>
        <SectionBlock title="External Profile Link">
          <p>The "Profile" button with an external link icon opens the player's actual profile page on Lichess or Chess.com in a new tab. Useful for seeing their full bio, following them, or using the platform's own analysis tools.</p>
        </SectionBlock>
        <SectionBlock title="Share Stats Button">
          <p>The share icon (↗) opens the Share Stats modal. This generates a visual stats card with the player's key numbers that you can screenshot and post to social media, Discord, or anywhere else.</p>
        </SectionBlock>
        <SectionBlock title="Refresh Button">
          <p>The circular arrow (↻) reloads all data fresh from the platform's API. Use this if you've just finished games and want updated stats. The button spins while loading.</p>
        </SectionBlock>
        <SectionBlock title="Theme Toggle">
          <p>The sun/moon button switches between light and dark mode. Your preference is applied instantly across the entire app. Dark mode is recommended for extended evening sessions to reduce eye strain.</p>
        </SectionBlock>
        <SectionBlock title="Last Updated Timestamp">
          <p>On wider screens, you'll see a small "Updated [time]" label showing when the data was last fetched. This helps you know how fresh the information is.</p>
        </SectionBlock>
      </div>
    ),
  },
  {
    id: 'share',
    icon: Share2,
    iconColor: 'text-chart-3',
    iconBg: 'bg-chart-3/10',
    title: 'Share Stats Card',
    subtitle: 'Generate and share a beautiful visual stats summary',
    content: (
      <div className="space-y-4">
        <SectionBlock title="What is the Share Modal?">
          <p>The Share Stats modal generates a compact, visual stats card that summarizes the player's key numbers in a format designed to be screenshot and shared on social media, Discord, Reddit, or in chess communities.</p>
        </SectionBlock>
        <SectionBlock title="What's on the card?">
          <p>The share card shows:</p>
          <div className="space-y-1 mt-2">
            <StatBullet label="Username & platform" desc="Who the stats belong to." />
            <StatBullet label="Win / Draw / Loss counts" desc="Core result breakdown." />
            <StatBullet label="Win rate %" desc="Overall percentage." />
            <StatBullet label="Peak rating" desc="Best rating across all formats." />
            <StatBullet label="Total games" desc="Career game count." />
            <StatBullet label="Chess Axis branding" desc="The card includes the Chess Axis name so people know where to find their own stats." />
          </div>
        </SectionBlock>
        <SectionBlock title="How to share">
          <p>Click the share icon in the header, then take a screenshot of the modal that appears. You can then paste the image anywhere. Future updates may include a direct "Copy Image" button.</p>
        </SectionBlock>
        <InfoBox type="tip">💡 Sharing your stats card is a great way to celebrate a milestone — like hitting 2000 Blitz, reaching 1000 total games, or achieving a new win streak record.</InfoBox>
      </div>
    ),
  },
];

export default function GuidePage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setActiveSection(id);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 max-w-5xl flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-full h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-1">
                <Crown className="h-4 w-4 text-primary" />
              </div>
              <span className="font-bold">Chess Axis</span>
              <span className="text-muted-foreground">/ Guide</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full h-8 w-8">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-5xl py-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
            <Info className="h-3 w-3" /> Complete Reference Guide
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Everything about <span className="gradient-text">Chess Axis</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A complete walkthrough of every feature, every tab, every button, and every metric. Click any section to expand it fully.
          </p>
        </motion.div>

        {/* Quick nav */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-5 mb-8"
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Navigation</p>
          <div className="flex flex-wrap gap-2">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  if (!expanded.has(s.id)) toggleExpand(s.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all hover:border-primary/40 hover:bg-primary/5 ${activeSection === s.id ? 'border-primary/40 bg-primary/5 text-primary' : 'border-border text-muted-foreground'}`}
              >
                <s.icon className="h-3 w-3" />
                {s.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-3">
          {SECTIONS.map((section, i) => {
            const isOpen = expanded.has(section.id);
            return (
              <motion.div
                key={section.id}
                id={`section-${section.id}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <button
                  onClick={() => toggleExpand(section.id)}
                  className="w-full flex items-center gap-4 p-5 hover:bg-muted/30 transition-colors text-left"
                >
                  <div className={`rounded-xl ${section.iconBg} p-2.5 shrink-0`}>
                    <section.icon className={`h-5 w-5 ${section.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base">{section.title}</h3>
                      {section.id === 'ai-insights' && (
                        <span className="px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold leading-none">AI</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{section.subtitle}</p>
                  </div>
                  <div className="shrink-0 text-muted-foreground">
                    {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </div>
                </button>

                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-border px-5 py-5"
                  >
                    {section.content}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center rounded-2xl border border-border bg-card p-8"
        >
          <Crown className="h-10 w-10 text-primary mx-auto mb-3 opacity-80" />
          <h2 className="text-xl font-bold mb-2">Ready to analyze your chess?</h2>
          <p className="text-muted-foreground text-sm mb-5 max-w-sm mx-auto">
            Enter your username on the home page — no account needed. Supports both Lichess and Chess.com.
          </p>
          <Button onClick={() => navigate('/')} className="gap-2 font-semibold">
            Go to Chess Axis <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
