import React from "react";
import { cn } from "../lib/utils";
import type { TicketInfo } from "../context/dataContext";
import { User } from "lucide-react";

interface NumberGridProps {
  selectedNumbers: number[];
  onToggle: (num: number) => void;
  disabled?: boolean;
  tickets: TicketInfo[];
}

export const NumberGrid: React.FC<NumberGridProps> = ({
  selectedNumbers,
  onToggle,
  tickets,
  disabled,
}) => {
  return (
    <div className="grid grid-cols-5 gap-3">
      {Array.from({ length: 25 }, (_, i) => {
        const num = i + 1;
        const isSelected = selectedNumbers.includes(num);

        const ticket = tickets.find((t) => t.ticketNo === num);

        return (
          <button
            key={num}
            onClick={() => onToggle(num)}
            disabled={disabled}
            className={cn(
              "relative p-3 rounded-xl border text-center transition-all",
              "bg-black border-gray-700 text-white",
              isSelected && "bg-green-500 text-black border-green-400",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          >
      
            <div className="flex justify-between items-center text-xs opacity-70">
              <span>#{num}</span>
              <span className="flex items-center"><User className="w-4"/> {ticket?.users?.length ?? 0}</span>
            </div>

         
            <div className="text-lg font-bold my-2">{num}</div>

        
            <div className="text-xs opacity-80">
              {ticket ? Number(ticket.totalAmount) / 1e9 : 0} SOL
            </div>
          </button>
        );
      })}
    </div>
  );
};
