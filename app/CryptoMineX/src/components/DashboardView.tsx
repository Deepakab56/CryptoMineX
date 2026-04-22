import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Coins,
  Users,
  Ticket as TicketIcon,
  Clock,
  Sparkles,
  Trophy,
} from "lucide-react";
import { CountdownTimer } from "./CountdownTimer";
import { NumberGrid } from "./NumberGrid";
import type { LotteryState } from "../types";
import { useMyContext } from "../context/dataContext";
import { useProgram } from "../utils/intance";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useGameTimer } from "../utils/parseTimer";
import {
  getGlobalPda,
  getRoundPda,
  getTicketpda,
  getTreasuryAccount,
  getUserTicketPda,
} from "../utils/getPda";
import { BN } from "bn.js";
import { LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";

interface DashboardViewProps {
  lotteryState: LotteryState;
  selectedNumbers: number[];
  onNumberToggle: (num: number) => void;
  onBuyTicket: () => void;
  isBuying: boolean;
  connected: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  lotteryState,
  selectedNumbers,
  onNumberToggle,
  onBuyTicket,
  isBuying,
  connected,
}) => {
  const { program, provider, programId } = useProgram();
  const wallet = useAnchorWallet();
  const connection = useConnection();
  const {
    roundData,
    getdata,
    getRoundData,
    getTicketData,
    tickets,
    gameStatus,
    setGameStatus,
    winnerNumber,
    setWinnerNumber,
  } = useMyContext();

  useEffect(() => {
    getRoundData();
    getTicketData();
    getdata();
  }, [connection, wallet]);

  // DashboardView.tsx

  const handlebuyticket = async () => {
    try {
      if (!program || !wallet?.publicKey || !provider) return;

      const globalPda = getGlobalPda(programId);
      const roundPda = getRoundPda(roundData.currentRound, programId);
      const transaction = new Transaction();

      for (let i = 0; i < selectedNumbers.length; i++) {
        const ticketNo = selectedNumbers[i];

        const ticketPda = getTicketpda(
          roundData.currentRound,
          programId,
          ticketNo,
        );
        const userTicketPda = getUserTicketPda(
          roundData.currentRound,
          programId,
          wallet.publicKey,
          ticketNo,
        );
        const treasury = getTreasuryAccount(roundData.currentRound, programId);

        const ix = await program.methods
          .buyTicket(ticketNo, new BN(LAMPORTS_PER_SOL / 10))
          .accounts({
            globalAccount: globalPda,
            roundAccount: roundPda,
            ticketAccount: ticketPda,
            userAccount: userTicketPda,
            treasury: treasury,
          })
          .instruction();

        transaction.add(ix);


        
      }

      const txHash = await provider.sendAndConfirm(transaction);
      console.log("TX:", txHash);

      // ✅ Fix 1: Selected numbers clear karo
      onNumberToggle(-1); // parent ko signal do clear karne ka

      // ✅ Fix 2: Sirf zaroorat wala data fetch karo
      await getRoundData();
      await getTicketData();
      // getdata() mat karo — unnecessary hai
    } catch (error) {
      console.error("Buy ticket error:", error);
    }
  };

  // ✅ gameStatus watch karo
  useEffect(() => {
    if (gameStatus === "reset") {
      console.log("🔄 New round — clearing old data...");

      // Old data turant clear karo
      setWinnerNumber(null);

      // ✅ Thodi der baad naya data fetch karo
      // (backend ko new round create karne ka time do)
      const timer = setTimeout(async () => {
        await getRoundData(); // naya round_id aayega
        await getTicketData(); // fresh tickets
        await getdata();
        setGameStatus("live"); // ✅ ab live karo
      }, 3000); // 3s wait — backend new round banaye

      return () => clearTimeout(timer);
    }
  }, [gameStatus]);

  useEffect(() => {
    const handleReset = async () => {
      console.log("🔄 Reset triggered from animation");

      setGameStatus("reset");
      setWinnerNumber(null);

      // wait backend
      await new Promise((r) => setTimeout(r, 5000));

      await getRoundData();
      await getTicketData();

      setGameStatus("live");
    };

    window.addEventListener("ROUND_RESET", handleReset);

    return () => {
      window.removeEventListener("ROUND_RESET", handleReset);
    };
  }, []);

  return (
    <div className="space-y-12">
      {/* Title Section */}
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-display font-bold text-white tracking-tight">
          Block <span className="text-solana-green">Dapp</span>
        </h1>
        <p className="text-slate-500 font-medium">
          Pick any numbers • Win big • Provably fair on Solana
        </p>
      </div>

      {/* Countdown Section */}
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <Clock className="w-3 h-3" /> Draw Closes In
        </div>
        <CountdownTimer
          startTime={roundData.startTime}
          endTime={roundData.endTime}
          onEnd={async () => {
            const roundPda = getRoundPda(roundData.currentRound, programId);

            let onChainRound;
            try {
              onChainRound = await program.account.round.fetch(roundPda);
            } catch (err) {
              console.log("Fetch error:", err);
              return;
            }

            console.log("🔍 End check — users:", onChainRound.users.length);

            // ─── CASE 1: Koi user nahi ───────────────────────────
            if (onChainRound.users.length === 0) {
              console.log("👻 No users — waiting for backend...");
              setGameStatus("reset");

              const currentRoundId = roundData.currentRound;

              const waitForNewRound = async () => {
                let retries = 0;
                const MAX = 40; // 40 * 5s = 200s max
                const INTERVAL = 5000; // ✅ 5s — close round delay handle

                while (retries < MAX) {
                  // ✅ Pehle wait karo — backend ko time do
                  await new Promise((r) => setTimeout(r, INTERVAL));

                  try {
                    const globalPda = getGlobalPda(programId);
                    const globalData = await program.account.globalState.fetch(
                      globalPda,
                    );

                    const newRoundId = globalData.roundId.toString();

                    console.log(
                      `⏳ Waiting new round... current: ${currentRoundId},`,
                      `chain: ${newRoundId} (attempt ${retries + 1}/${MAX})`,
                    );

                    // ✅ Round ID badla = naya round ready
                    if (newRoundId !== currentRoundId) {
                      console.log("🟢 New round detected:", newRoundId);

                      // ✅ Thoda aur wait — round account initialize ho jaye
                      await new Promise((r) => setTimeout(r, 3000));

                      await getRoundData();
                      await getTicketData();
                      setGameStatus("live");
                      return;
                    }

                    // ✅ Round ID same but isRoundActive true = naya round chal raha
                    if (
                      globalData.isRoundActive &&
                      newRoundId !== currentRoundId
                    ) {
                      console.log("🟢 Round active:", newRoundId);
                      await getRoundData();
                      await getTicketData();
                      setGameStatus("live");
                      return;
                    }
                  } catch (err) {
                    console.log("⚠️ Poll error (retrying):", err.message);
                  }

                  retries++;
                }

                // ❌ Timeout — manually refresh
                console.log("⏰ Timeout — force refresh");
                await getRoundData();
                await getTicketData();
                setGameStatus("live");
              };

              waitForNewRound();
              return;
            }

            // ─── CASE 2: Users hain — winner poll karo ───────────
            setGameStatus("waiting");

            const pollWinner = async () => {
              let retries = 0;
              const MAX_RETRIES = 20; // 20 * 5s = 100s
              const INTERVAL = 5000; // ✅ 5s interval

              while (retries < MAX_RETRIES) {
                await new Promise((r) => setTimeout(r, INTERVAL));

                try {
                  const fresh = await program.account.round.fetch(roundPda);
                  console.log(
                    `🔍 Poll winner... ticket: ${fresh.winnerTicket}`,
                    `(attempt ${retries + 1}/${MAX_RETRIES})`,
                  );

                  if (fresh.winnerTicket && fresh.winnerTicket !== 0) {
                    setWinnerNumber(fresh.winnerTicket);
                    setGameStatus("ended");

                    setTimeout(async () => {
                      setGameStatus("reset");
                      setWinnerNumber(null);

                      // ✅ Backend ko new round banane ka time do
                      await new Promise((r) => setTimeout(r, 8000));
                      await getRoundData();
                      await getTicketData();
                      setGameStatus("live");
                    }, 6000);

                    return;
                  }
                } catch (err) {
                  console.log("⚠️ Poll error:", err);
                }

                retries++;
              }

              console.log("⏰ Poll timeout — force reset");
              setGameStatus("reset");
              await getRoundData();
              await getTicketData();
              setGameStatus("live");
            };

            pollWinner();
          }}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-card p-8 text-center space-y-4">
            <div className="flex flex-col items-center gap-2">
              <Trophy className="w-8 h-8 text-solana-green/50" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Current Jackpot
              </span>
            </div>
            <div className="space-y-1">
              <h2 className="text-4xl font-display font-bold text-white">
                {Number(roundData?.totalAmount) / 1e9}
              </h2>
              <p className="text-solana-green font-bold text-sm">SOL</p>
              {/* <p className="text-slate-500 text-xs">{roundData?.totalAmount}</p> */}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-4 text-center space-y-1">
              <Users className="w-5 h-5 text-solana-green mx-auto mb-2" />
              <p className="text-xl font-display font-bold text-white">
                {roundData?.users?.length}
              </p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Players
              </p>
            </div>
            <div className="glass-card p-4 text-center space-y-1">
              <TicketIcon className="w-5 h-5 text-solana-green mx-auto mb-2" />
              <p className="text-xl font-display font-bold text-white">
                {tickets.reduce((val, data) => val + data.users.length, 0)}
              </p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Tickets
              </p>
            </div>
          </div>
        </div>

        {/* Center Column */}
        <div className="lg:col-span-6 glass-card p-8 space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-display font-bold text-white">
                Pick Your Numbers
              </h3>
              <p className="text-xs text-slate-500">Choose 1–25</p>
            </div>
            <button className="btn-outline text-xs flex items-center gap-2">
              <Sparkles className="w-3 h-3" /> Quick Pick
            </button>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-lg">
              <NumberGrid
                selectedNumbers={selectedNumbers}
                onToggle={onNumberToggle}
                tickets={tickets}
                gameStatus={gameStatus}
                winnerNumber={winnerNumber}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Ticket Cost</span>
              <span className="text-white font-bold">
                {(selectedNumbers.length * 0.1).toFixed(3)} SOL{" "}
                <span className="text-slate-500 font-normal">(≈$14.50)</span>
              </span>
            </div>
            <button
              onClick={handlebuyticket}
              disabled={!connected || selectedNumbers.length === 0 || isBuying}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isBuying
                ? "Processing..."
                : `${(selectedNumbers.length * 0.1).toFixed(3)} SOL`}
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-3 space-y-6">
          {/* <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border bg-white/5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Recent Entries
              </span>
            </div>
            <div className="divide-y divide-border">
              {[
                {
                  addr: "Gx3k...9fQa",
                  time: "2m ago",
                  nums: [3, 7, 12, 18, 21, 25],
                },
                {
                  addr: "BnWp...4tRz",
                  time: "5m ago",
                  nums: [1, 5, 9, 14, 20, 24],
                },
                {
                  addr: "KqYe...8mHj",
                  time: "9m ago",
                  nums: [2, 6, 11, 15, 19, 23],
                },
                {
                  addr: "PvLs...2nXk",
                  time: "12m ago",
                  nums: [4, 8, 13, 17, 22, 25],
                },
              ].map((entry, i) => (
                <div key={i} className="p-4 space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-300 font-mono">
                      {entry.addr}
                    </span>
                    <span className="text-slate-500">{entry.time}</span>
                  </div>
                  <div className="flex gap-1">
                    {entry.nums.map((n) => (
                      <span
                        key={n}
                        className="text-[8px] font-bold bg-white/5 w-5 h-5 flex items-center justify-center rounded border border-white/5 text-slate-400"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div> */}

          <div className="glass-card p-4 space-y-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Round Info
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Round</span>
                <span className="text-solana-green font-bold">
                  #{roundData?.currentRound}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className="text-solana-green font-bold">
                  {roundData?.isRoundActive == false
                    ? "deactivate"
                    : "activate"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Oracle</span>
                <span className="text-solana-green font-bold">
                  Switchboard VRF
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Program</span>
                <span className="text-solana-green font-bold">
                  {programId.toString().substring(0, 3)}...
                  {programId.toString().substring(41, 44)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
