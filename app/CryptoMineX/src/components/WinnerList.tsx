import React from 'react';

import { Trophy, ExternalLink } from 'lucide-react';
import type { Winner } from '../types';

interface WinnerListProps {
  winners: Winner[];
}

export const WinnerList: React.FC<WinnerListProps> = ({ winners }) => {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h3 className="font-display font-bold">Winner List</h3>
      </div>
      <div className="divide-y divide-white/5">
        {winners.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Winners will be announced after the draw.
          </div>
        ) : (
          winners.map((winner, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                  #{idx + 1}
                </div>
                <div>
                  <p className="font-mono text-sm text-slate-300">
                    {winner.address.slice(0, 4)}...{winner.address.slice(-4)}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase">
                    {winner.matchingNumbers} Matches
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-solana-green">{winner.prize} SOL</p>
                <button className="text-[10px] text-solana-purple flex items-center gap-1 ml-auto hover:underline">
                  View <ExternalLink className="w-2 h-2" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
