// CountdownTimer.tsx
import React, { useState, useEffect, useRef } from "react";

interface CountdownTimerProps {
  startTime: number;
  endTime: number;
  onEnd?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  startTime,
  endTime,
  onEnd,
}) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [status, setStatus] = useState<"upcoming" | "live" | "ended">("upcoming");
  const hasEnded = useRef(false);

  // ✅ endTime badla = naya round = timer reset
  useEffect(() => {
    hasEnded.current = false; // ✅ reset karo
    setStatus("upcoming");
  }, [endTime]);

  useEffect(() => {
    if (!startTime || !endTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const start = startTime * 1000;
      const end = endTime * 1000;

      if (now < start) {
        setTimeLeft(Math.floor((start - now) / 1000));
        setStatus("upcoming");
      } else if (now >= start && now <= end) {
        setTimeLeft(Math.floor((end - now) / 1000));
        setStatus("live");
      } else {
        setTimeLeft(0);
        setStatus("ended");

        if (!hasEnded.current) {
          hasEnded.current = true;
          onEnd?.();
        }
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, endTime]); // ✅ dono watch karo

  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm font-semibold text-slate-400">
        {status === "upcoming" && "Game starts in"}
        {status === "live" && "Game ends in"}
        {status === "ended" && "⏳ Revealing winner..."}
      </p>

      <div className="flex gap-4 justify-center">
        {[
          { label: "Mins", value: minutes },
          { label: "Secs", value: seconds },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center">
            <div className="bg-white/5 border border-white/10 w-16 h-16 rounded-xl
                           flex items-center justify-center text-2xl font-bold text-solana-green">
              {String(item.value).padStart(2, "0")}
            </div>
            <span className="text-[10px] uppercase mt-2 text-slate-500 font-bold">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};