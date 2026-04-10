import { useEffect, useState } from "react";

export const useGameTimer = (startTime: number, endTime: number) => {
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    status: "idle" as "idle" | "upcoming" | "live" | "ended",
  });

  useEffect(() => {
    if (!startTime || !endTime) return;

    const interval = setInterval(() => {
      const now = Date.now();

      const start = startTime * 1000;
      const end = endTime * 1000;

      let diff = 0;
      let status: "idle" | "upcoming" | "live" | "ended" = "idle";

      
      if (now < start) {
        diff = start - now;
        status = "upcoming";
      }

     
      else if (now >= start && now <= end) {
        diff = end - now;
        status = "live";
      }

    
      else {
        diff = 0;
        status = "ended";
        clearInterval(interval);
      }

      setTime({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        status,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, endTime]);

  return time;
};