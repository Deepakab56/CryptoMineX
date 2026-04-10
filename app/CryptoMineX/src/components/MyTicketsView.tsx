import React from 'react';
import { Ticket as TicketIcon } from 'lucide-react';
import type { Ticket } from '../types';


interface MyTicketsViewProps {
  tickets: Ticket[];
}

export const MyTicketsView: React.FC<MyTicketsViewProps> = ({ tickets }) => {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-3xl font-display font-bold text-white">My Tickets</h2>
        <p className="text-slate-500 text-sm">{tickets.length} tickets purchased</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'TOTAL', value: tickets.length },
          { label: 'WINNERS', value: 0 },
          { label: 'TO CLAIM', value: 0 },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-8 text-center space-y-2">
            <p className="text-4xl font-display font-bold text-solana-green">{stat.value}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-20 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
          <TicketIcon className="w-8 h-8 text-slate-700" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-slate-300">No tickets yet</h3>
          <p className="text-sm text-slate-500">Head to the dashboard to buy your first ticket</p>
        </div>
      </div>
    </div>
  );
};
