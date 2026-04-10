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
  const [status, setStatus] = useState<
    "upcoming" | "live" | "ended"
  >("upcoming");

  const hasEnded = useRef(false); // ✅ prevent multiple calls

  useEffect(() => {
    if (!startTime || !endTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const start = startTime * 1000;
      const end = endTime * 1000;

      let diff = 0;
      let currentStatus: "upcoming" | "live" | "ended" = "upcoming";

      if (now < start) {
        diff = Math.floor((start - now) / 1000);
        currentStatus = "upcoming";
      } else if (now >= start && now <= end) {
        diff = Math.floor((end - now) / 1000);
        currentStatus = "live";
      } else {
        diff = 0;
        currentStatus = "ended";

        if (!hasEnded.current) {
          hasEnded.current = true;
          onEnd?.(); // ✅ call only once
        }

        clearInterval(interval);
      }

      setTimeLeft(diff);
      setStatus(currentStatus);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, endTime]); // ✅ FIXED

  const days = Math.floor(timeLeft / (24 * 3600));
  const hours = Math.floor((timeLeft % (24 * 3600)) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm font-semibold text-slate-400">
        {status === "upcoming" && "Game starts in"}
        {status === "live" && "Game ends in"}
        {status === "ended" && "Game Ended"}
      </p>

      <div className="flex gap-4 justify-center">
        {[
          { label: "Days", value: days },
          { label: "Hours", value: hours },
          { label: "Mins", value: minutes },
          { label: "Secs", value: seconds },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center">
            <div className="bg-white/5 border border-white/10 w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-solana-green">
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