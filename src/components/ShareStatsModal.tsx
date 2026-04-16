
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import type { FetchPlayerStatsOutputType } from 'zite-endpoints-sdk';

type Stats = FetchPlayerStatsOutputType['stats'];
interface Props { isOpen: boolean; onClose: () => void; stats: Stats; username: string; platform: string; }

function drawCard(stats: Stats, username: string, platform: string): string {
  const canvas = document.createElement('canvas');
  const W = 1200, H = 630;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#090e1c'); bg.addColorStop(0.6, '#111830'); bg.addColorStop(1, '#0d1428');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // Subtle chess board
  ctx.fillStyle = 'rgba(120, 100, 200, 0.035)';
  for (let i = 0; i < 9; i++) for (let j = 0; j < 5; j++) if ((i + j) % 2 === 0) ctx.fillRect(i * 140, j * 140, 140, 140);

  // Accent line
  const accentLine = ctx.createLinearGradient(0, 0, 600, 0);
  accentLine.addColorStop(0, 'rgba(124, 110, 240, 0.8)'); accentLine.addColorStop(1, 'rgba(124, 110, 240, 0)');
  ctx.fillStyle = accentLine; ctx.fillRect(60, 64, 400, 2);

  // App name
  ctx.font = 'bold 14px system-ui, sans-serif'; ctx.fillStyle = 'rgba(160, 140, 240, 0.7)';
  ctx.fillText('CHESS ANALYTICS', 60, 56);

  // Username
  ctx.font = `bold ${username.length > 15 ? 52 : 68}px system-ui, sans-serif`; ctx.fillStyle = '#f0f6fc';
  ctx.fillText(username.slice(0, 20), 60, 175);

  // Platform badge
  ctx.font = 'bold 15px system-ui, sans-serif'; ctx.fillStyle = 'rgba(124, 110, 240, 0.9)';
  ctx.fillText(platform === 'lichess' ? '♞ LICHESS' : '♝ CHESS.COM', 60, 210);

  // Best rating
  const bestRating = Math.max(...Object.values(stats.ratings).map(r => r.rating).filter(r => r > 0), 0);
  const bestFormat = [...Object.entries(stats.ratings)].sort((a, b) => b[1].games - a[1].games)[0]?.[0] || '';
  ctx.font = 'bold 80px system-ui, sans-serif'; ctx.fillStyle = 'rgba(250, 185, 65, 0.95)';
  ctx.fillText(String(bestRating), 60, 320);
  ctx.font = '18px system-ui, sans-serif'; ctx.fillStyle = 'rgba(160, 160, 200, 0.7)';
  ctx.fillText(`${bestFormat} rating`, 60, 350);

  // Stat grid (bottom left)
  const leftStats = [
    { label: 'Total Games', value: stats.overall.totalGames.toLocaleString() },
    { label: 'Win Rate', value: `${stats.overall.winRate}%` },
    { label: 'Best Streak', value: `${stats.overall.longestWinStreak}W` },
    { label: 'This Month', value: String(stats.overall.gamesThisMonth) },
  ];
  leftStats.forEach((s, i) => {
    const x = 60 + (i % 2) * 220, y = 420 + Math.floor(i / 2) * 90;
    ctx.font = 'bold 32px system-ui, sans-serif'; ctx.fillStyle = '#f0f6fc';
    ctx.fillText(s.value, x, y);
    ctx.font = '13px system-ui, sans-serif'; ctx.fillStyle = 'rgba(160,160,200,0.6)';
    ctx.fillText(s.label, x, y + 22);
  });

  // Right panel separator
  ctx.fillStyle = 'rgba(120, 100, 200, 0.15)'; ctx.fillRect(600, 80, 1, 470);

  // Right side content
  const topOpening = stats.openings.asWhite[0];
  if (topOpening) {
    ctx.font = '13px system-ui, sans-serif'; ctx.fillStyle = 'rgba(160,160,200,0.6)'; ctx.fillText('FAVORITE OPENING', 640, 130);
    ctx.font = `bold ${topOpening.name.length > 28 ? 22 : 26}px system-ui, sans-serif`; ctx.fillStyle = '#f0f6fc';
    ctx.fillText(topOpening.name.slice(0, 32), 640, 168);
    ctx.font = 'bold 22px system-ui, sans-serif'; ctx.fillStyle = 'rgba(80, 200, 130, 0.9)';
    ctx.fillText(`${topOpening.winRate}% win rate · ${topOpening.games} games`, 640, 200);
  }

  // W/L/D bar
  const total = stats.overall.wins + stats.overall.losses + stats.overall.draws;
  if (total > 0) {
    const bx = 640, by = 250, bw = 500, bh = 28;
    ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 8); ctx.fill();
    const ww = (stats.overall.wins / total) * bw;
    const dw = (stats.overall.draws / total) * bw;
    ctx.fillStyle = 'rgba(80, 200, 130, 0.85)'; ctx.beginPath(); ctx.roundRect(bx, by, ww, bh, [8, 0, 0, 8]); ctx.fill();
    ctx.fillStyle = 'rgba(150,150,190,0.5)'; ctx.fillRect(bx + ww, by, dw, bh);
    ctx.fillStyle = 'rgba(220, 80, 80, 0.75)'; ctx.beginPath(); ctx.roundRect(bx + ww + dw, by, bw - ww - dw, bh, [0, 8, 8, 0]); ctx.fill();
    ctx.font = '13px system-ui, sans-serif'; ctx.fillStyle = 'rgba(160,160,200,0.6)';
    ctx.fillText(`${stats.overall.wins}W   ${stats.overall.draws}D   ${stats.overall.losses}L`, bx, by + 46);
  }

  // Day of week
  const bestDay = [...stats.dayOfWeek].filter(d => d.games > 2).sort((a, b) => b.winRate - a.winRate)[0];
  if (bestDay) {
    ctx.font = '13px system-ui, sans-serif'; ctx.fillStyle = 'rgba(160,160,200,0.6)'; ctx.fillText('BEST DAY TO PLAY', 640, 345);
    ctx.font = 'bold 28px system-ui, sans-serif'; ctx.fillStyle = 'rgba(250,185,65,0.9)';
    ctx.fillText(`${bestDay.day}  —  ${bestDay.winRate}% wins`, 640, 380);
  }

  // Color split
  ctx.font = '13px system-ui, sans-serif'; ctx.fillStyle = 'rgba(160,160,200,0.6)'; ctx.fillText('WIN RATE', 640, 435);
  ctx.font = 'bold 22px system-ui, sans-serif'; ctx.fillStyle = '#f0f6fc';
  ctx.fillText(`♔ White: ${stats.colorStats.white.winRate}%`, 640, 465);
  ctx.fillText(`♚ Black: ${stats.colorStats.black.winRate}%`, 640, 497);

  // Footer
  ctx.fillStyle = 'rgba(120,100,200,0.2)'; ctx.fillRect(0, 590, W, 1);
  ctx.font = '13px system-ui, sans-serif'; ctx.fillStyle = 'rgba(120,120,160,0.4)';
  ctx.fillText('chess-analytics.app', W - 210, 618);

  return canvas.toDataURL('image/png');
}

export default function ShareStatsModal({ isOpen, onClose, stats, username, platform }: Props) {
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (isOpen && stats) setPreviewUrl(drawCard(stats, username, platform));
  }, [isOpen, stats, username, platform]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `${username}-chess-stats.png`;
    link.href = previewUrl;
    link.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Share2 className="h-4 w-4" />Share Your Stats</DialogTitle>
        </DialogHeader>
        {previewUrl && <img src={previewUrl} alt="Stats card preview" className="w-full rounded-xl border border-border shadow-md" />}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handleDownload} className="gap-2"><Download className="h-4 w-4" />Download PNG</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
