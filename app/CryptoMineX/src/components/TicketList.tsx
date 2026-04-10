import React from 'react';

import { Ticket as TicketIcon, Hash } from 'lucide-react';
import type { Ticket } from '../types';

interface TicketListProps {
  tickets: Ticket[];
}

export const TicketList: React.FC<TicketListProps> = ({ tickets }) => {
  if (tickets.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <TicketIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">You haven't purchased any tickets yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket) => (
        <div key={ticket.id} className="glass rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-solana-purple/20 p-2 rounded-lg">
              <TicketIcon className="w-5 h-5 text-solana-purple" />
            </div>
            <div>
              <div className="flex gap-1">
                {ticket.numbers.map((n) => (
                  <span key={n} className="text-sm font-mono bg-white/5 px-1.5 rounded">
                    {String(n).padStart(2, '0')}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">
                ID: {ticket.id.slice(0, 8)}...
              </p>
            </div>
          </div>
          {ticket.isWinner && (
            <span className="text-xs font-bold text-solana-green bg-solana-green/10 px-2 py-1 rounded-full uppercase">
              Winner
            </span>
          )}
        </div>
      ))}
    </div>
  );
};
