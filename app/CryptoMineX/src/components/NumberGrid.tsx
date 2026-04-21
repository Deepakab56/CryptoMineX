import React, { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import type { TicketInfo } from "../context/dataContext";
import { motion, AnimatePresence } from "framer-motion";

interface NumberGridProps {
  selectedNumbers: number[];
  onToggle: (num: number) => void;
  disabled?: boolean;
  tickets: TicketInfo[];
  gameStatus: "live" | "ended" | "reset" | "waiting";
  winnerNumber?: number | null;
}

export const NumberGrid: React.FC<NumberGridProps> = ({
  selectedNumbers,
  onToggle,
  tickets,
  disabled,
  gameStatus,
  winnerNumber,
}) => {
  const [hiddenNumbers, setHiddenNumbers]     = useState<number[]>([]);
  const [winnerRevealed, setWinnerRevealed]   = useState(false);
  const [showDistributing, setShowDistributing] = useState(false);
  const [distributingStep, setDistributingStep] = useState(0);

  // ✅ Shuffle appear state
  const [visibleNumbers, setVisibleNumbers]   = useState<number[]>(
    Array.from({ length: 25 }, (_, i) => i + 1) // initially all visible
  );

  const isWaiting = gameStatus === "waiting";

  // ✅ Winner animation flow
  useEffect(() => {
    if (gameStatus === "ended" && winnerNumber) {
      setHiddenNumbers([]);
      setWinnerRevealed(false);
      setShowDistributing(false);
      setDistributingStep(0);

      const others = Array.from({ length: 25 }, (_, i) => i + 1)
        .filter(n => n !== winnerNumber)
        .sort(() => Math.random() - 0.5);

      others.forEach((num, index) => {
        setTimeout(() => {
          setHiddenNumbers(prev => [...prev, num]);

          if (index === others.length - 1) {
            setTimeout(() => {
              setWinnerRevealed(true);

              // Step 3: Distributing
              setTimeout(() => {
                setShowDistributing(true);
                setDistributingStep(1);

                setTimeout(() => {
                  setDistributingStep(2);

                  setTimeout(() => {
                    setDistributingStep(3);
                  }, 2000);

                }, 3000);
              }, 2000);

            }, 400);
          }
        }, index * 150);
      });
    }

    // ✅ Reset pe sab clear karo — boxes abhi nahi dikhaoge
    if (gameStatus === "reset") {
      setHiddenNumbers([]);
      setWinnerRevealed(false);
      setShowDistributing(false);
      setDistributingStep(0);
      setVisibleNumbers([]); // ✅ sab hide
    }

    // ✅ Live pe shuffle style mein appear karo
    if (gameStatus === "live") {
      setHiddenNumbers([]);
      setWinnerRevealed(false);
      setShowDistributing(false);
      setDistributingStep(0);
      setVisibleNumbers([]); // ✅ pehle sab hatao

      // ✅ Random order mein ek ek appear
      const shuffled = Array.from({ length: 25 }, (_, i) => i + 1)
        .sort(() => Math.random() - 0.5);

      shuffled.forEach((num, index) => {
        setTimeout(() => {
          setVisibleNumbers(prev => [...prev, num]);
        }, index * 80); // 80ms * 25 = ~2s
      });
    }
  }, [gameStatus, winnerNumber]);

  return (
    <div className="relative min-h-[300px]">

      {/* ── Waiting Overlay ───────────────────────── */}
      <AnimatePresence>
        {isWaiting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col items-center
                       justify-center bg-black/70 rounded-2xl backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 border-2 border-green-400
                         border-t-transparent rounded-full mb-4"
            />
            <div className="flex gap-1 mb-3">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="w-2 h-2 bg-green-400 rounded-full"
                />
              ))}
            </div>
            <p className="text-green-400 text-sm font-bold">🎲 Revealing Winner...</p>
            <p className="text-slate-500 text-xs mt-1">Switchboard VRF processing</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Distributing Overlay ──────────────────── */}
      <AnimatePresence>
        {showDistributing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col items-center
                       justify-center rounded-2xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-6xl mb-4"
            >
              👑
            </motion.div>

            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-yellow-400 text-2xl font-black mb-2"
            >
              #{winnerNumber} Wins!
            </motion.p>

            <AnimatePresence mode="wait">
              {distributingStep === 1 && (
                <motion.div
                  key="distributing"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  className="flex flex-col items-center gap-2 mt-4"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-yellow-400
                               border-t-transparent rounded-full"
                  />
                  <p className="text-yellow-400 text-sm font-bold">
                    💰 Distributing rewards...
                  </p>
                </motion.div>
              )}

              {distributingStep === 2 && (
                <motion.div
                  key="sent"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-2 mt-4"
                >
                  <p className="text-green-400 text-lg font-black">
                    ✅ Rewards Sent!
                  </p>
                </motion.div>
              )}

              {distributingStep === 3 && (
                <motion.div
                  key="nextround"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-2 mt-4"
                >
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                        className="w-2 h-2 bg-slate-400 rounded-full"
                      />
                    ))}
                  </div>
                  <p className="text-slate-400 text-sm font-bold">
                    🔄 Next round starting...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Number Grid ───────────────────────────── */}
      <div className={cn(
        "grid grid-cols-5 gap-3",
        isWaiting && "blur-sm pointer-events-none",
        showDistributing && "blur-md pointer-events-none opacity-20",
      )}>
        {Array.from({ length: 25 }, (_, i) => {
          const num = i + 1;
          const isSelected    = selectedNumbers.includes(num);
          const ticket        = tickets.find(t => t.ticketNo === num);
          const isWinner      = num === winnerNumber;
          const isHidden      = hiddenNumbers.includes(num);
          const showWinner    = winnerRevealed && isWinner;

          // ✅ Live mein — sirf visible numbers dikhao
          const isVisible = gameStatus === "live"
            ? visibleNumbers.includes(num)
            : !isHidden; // ended mein hiddenNumbers se control

          return (
            <AnimatePresence key={num}>
              {isVisible && (
                <motion.button
                  layout
                  onClick={() =>
                    !disabled && gameStatus === "live" && onToggle(num)
                  }
                  disabled={disabled || gameStatus !== "live"}

                  // ✅ Shuffle appear — scale + rotate se aao
                  initial={{
                    scale: 0,
                    opacity: 0,
                    rotate: Math.random() > 0.5 ? 90 : -90, // random direction
                    y: Math.random() > 0.5 ? -20 : 20,
                  }}
                  animate={{
                    scale: showWinner ? [1, 1.3, 1.15] : 1,
                    opacity: 1,
                    rotate: 0,
                    y: 0,
                    boxShadow: showWinner
                      ? ["0 0 0px #facc15", "0 0 40px #facc15",
                         "0 0 80px #facc15", "0 0 40px #facc15"]
                      : isSelected
                      ? "0 0 15px rgba(74,222,128,0.4)"
                      : "0 0 0px transparent",
                  }}

                  // ✅ Hide hote waqt fly off
                  exit={{
                    scale: 0,
                    opacity: 0,
                    rotate: Math.random() > 0.5 ? 45 : -45,
                    y: -30,
                    transition: { duration: 0.25, ease: "easeIn" },
                  }}

                  whileTap={{ scale: 0.88 }}
                  whileHover={
                    gameStatus === "live" && !isSelected
                      ? { scale: 1.05, borderColor: "#4ade80" }
                      : {}
                  }

                  transition={{
                    scale: {
                      duration: showWinner ? 0.5 : 0.2,
                      repeat: showWinner ? Infinity : 0,
                      repeatType: "reverse",
                    },
                    rotate: { duration: 0.3, ease: "backOut" },
                    y:      { duration: 0.3, ease: "backOut" },
                    opacity: { duration: 0.2 },
                    boxShadow: {
                      duration: showWinner ? 1.2 : 0.15,
                      repeat: showWinner ? Infinity : 0,
                      repeatType: "reverse",
                    },
                  }}

                  className={cn(
                    "relative p-3 rounded-xl border text-center transition-colors duration-150",
                    "bg-black border-gray-700 text-white",
                    isSelected && "bg-green-500/20 border-green-400 text-green-300",
                    showWinner && "bg-yellow-400 text-black border-yellow-300 font-black",
                    gameStatus === "live" && !isSelected && "hover:border-gray-500 cursor-pointer",
                    (disabled || gameStatus !== "live") && "cursor-not-allowed"
                  )}
                >
                  <div className="flex justify-between text-xs opacity-60">
                    <span>#{num}</span>
                    <span>{ticket?.users?.length ?? 0}👤</span>
                  </div>
                  <div className="text-xl font-bold my-1">{num}</div>
                  <div className="text-xs opacity-70">
                    {ticket
                      ? (Number(ticket.totalAmount) / 1e9).toFixed(2)
                      : "0.00"} SOL
                  </div>

                  <AnimatePresence>
                    {showWinner && (
                      <motion.div
                        initial={{ scale: 0, y: -10 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl"
                      >
                        👑
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              )}
            </AnimatePresence>
          );
        })}
      </div>
    </div>
  );
};