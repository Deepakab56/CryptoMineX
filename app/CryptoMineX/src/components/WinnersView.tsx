import React from 'react';
import { Trophy, Search, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

export const WinnersView: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-3xl font-display font-bold text-white">Winners</h2>
        <p className="text-slate-500 text-sm">Past lottery draws and prize winners</p>
      </div>

      <div className="flex gap-2">
        <button className="btn-outline text-xs bg-solana-green/10 border-solana-green">Round #41 - Apr 1, 2026</button>
        <button className="btn-outline text-xs border-white/10 text-slate-500">Round #40 - Mar 29, 2026</button>
        <button className="btn-outline text-xs border-white/10 text-slate-500">Round #39 - Mar 26, 2026</button>
      </div>

      <div className="glass-card p-8 flex justify-between items-center">
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-solana-green" /> Round #41
            </h3>
            <p className="text-xs text-slate-500">Apr 1, 2026 • 5 winners</p>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Winning Numbers</p>
            <div className="flex gap-2">
              {[3, 7, 12, 18, 21, 24].map((n) => (
                <div key={n} className="w-12 h-12 rounded-lg bg-solana-green text-black flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(20,241,149,0.3)]">
                  {n}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="text-right space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Jackpot</p>
          <p className="text-3xl font-display font-bold text-solana-green">118.4 SOL</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border bg-white/5 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by address..." 
            className="bg-transparent border-none outline-none text-sm w-full text-slate-300 placeholder:text-slate-600"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-border">
                <th className="p-4 font-bold uppercase tracking-widest">Rank</th>
                <th className="p-4 font-bold uppercase tracking-widest">Address</th>
                <th className="p-4 font-bold uppercase tracking-widest">Matches</th>
                <th className="p-4 font-bold uppercase tracking-widest">Prize</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { rank: '🥇', addr: 'Gx3k...9fQa', matches: 6, prize: '59.20 SOL', color: 'text-yellow-500' },
                { rank: '🥈', addr: 'BnWp...4tRz', matches: 5, prize: '23.68 SOL', color: 'text-solana-green' },
                { rank: '🥉', addr: 'KqYe...8mHj', matches: 5, prize: '23.68 SOL', color: 'text-solana-green' },
                { rank: '#4', addr: 'PvLs...2nXk', matches: 4, prize: '11.84 SOL', color: 'text-solana-green' },
                { rank: '#5', addr: 'TwAd...6pFc', matches: 3, prize: '5.92 SOL', color: 'text-solana-green' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold">{row.rank}</td>
                  <td className="p-4 font-mono text-slate-300 flex items-center gap-2">
                    {row.addr} <ExternalLink className="w-3 h-3 text-slate-600" />
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <div key={j} className={cn("w-2 h-2 rounded-full", j < row.matches ? "bg-solana-green" : "bg-slate-800")} />
                      ))}
                      <span className="ml-2 text-slate-500">{row.matches}/6</span>
                    </div>
                  </td>
                  <td className={cn("p-4 font-bold", row.color)}>{row.prize}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-6 text-center space-y-1">
          <p className="text-2xl font-display font-bold text-solana-green">41</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Rounds</p>
        </div>
        <div className="glass-card p-6 text-center space-y-1">
          <p className="text-2xl font-display font-bold text-solana-green">3,841 SOL</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Distributed</p>
        </div>
        <div className="glass-card p-6 text-center space-y-1">
          <p className="text-2xl font-display font-bold text-solana-green">287</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Winners</p>
        </div>
      </div>
    </div>
  );
};
