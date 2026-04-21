import React, { useState, useMemo } from "react";
import {
  WalletMultiButton,
  WalletModalProvider,
} from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

import { DashboardView } from "./components/DashboardView";
import { MyTicketsView } from "./components/MyTicketsView";
import { WinnersView } from "./components/WinnersView";

import { cn } from "./lib/utils";

// Default styles for wallet adapter
import "@solana/wallet-adapter-react-ui/styles.css";
import type { LotteryState, Ticket } from "./types";
import Admin from "./components/Admin";
import { MyContextProvider } from "./context/dataContext";

const LOTTERY_END_TIME = Date.now() + 1000 * 60 * 60 * 24 * 2; // 2 days from now

type View = "dashboard" | "my-tickets" | "winners" | "admin";

const AppContent = () => {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [lotteryState, setLotteryState] = useState<LotteryState>({
    jackpot: 124.5,
    participants: 312,
    endTime: LOTTERY_END_TIME,
    ticketPrice: 0.1,
    isDrawCompleted: false,
  });
  const [isBuying, setIsBuying] = useState(false);

  // anchor integration
  const { publicKey, connected } = useWallet();
  const shortAddress = publicKey
    ? publicKey.toBase58().slice(0, 4) + "..." + publicKey.toBase58().slice(-4)
    : "";

 const handleNumberToggle = (num: number) => {
    // ✅ -1 = clear all (after buy ticket)
    if (num === -1) {
        setSelectedNumbers([]);
        return;
    }

    if (selectedNumbers.includes(num)) {
        setSelectedNumbers(prev => prev.filter(n => n !== num));
    } else if (selectedNumbers.length < 25) {
        setSelectedNumbers(prev => [...prev, num]);
    }
};

  const buyTicket = async () => {
    if (!connected || selectedNumbers.length === 0) return;

    setIsBuying(true);
    // Simulate transaction
    setTimeout(() => {
      const newTicket: Ticket = {
        id: Math.random().toString(36).substr(2, 9),
        owner: publicKey?.toBase58() || "",
        numbers: [...selectedNumbers].sort((a, b) => a - b),
        timestamp: Date.now(),
      };

      setTickets((prev) => [newTicket, ...prev]);
      setLotteryState((prev) => ({
        ...prev,
        jackpot: prev.jackpot + prev.ticketPrice,
        participants: prev.participants + 1,
      }));
      setSelectedNumbers([]);
      setIsBuying(false);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#14F195", "#9945FF"],
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border sticky top-0 bg-dark-bg/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-solana-green rounded-lg flex items-center justify-center">
              <Sparkles className="text-black w-5 h-5" />
            </div>
            <span className="font-display font-bold text-white text-lg">
              Solana <span className="text-solana-green">Dapp</span>
            </span>
          </div>

          <nav className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView("dashboard")}
              className={cn(
                "nav-link",
                currentView === "dashboard" && "nav-link-active",
              )}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView("my-tickets")}
              className={cn(
                "nav-link",
                currentView === "my-tickets" && "nav-link-active",
              )}
            >
              My Tickets
            </button>
            <button
              onClick={() => setCurrentView("winners")}
              className={cn(
                "nav-link",
                currentView === "winners" && "nav-link-active",
              )}
            >
              Winners
            </button>
            <button
              onClick={() => setCurrentView("admin")}
              className={cn(
                "nav-link",
                currentView === "admin" && "nav-link-active",
              )}
            >
              admin
            </button>
          </nav>

          <div className="flex items-center gap-4">
            {connected ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-solana-green/10 border border-solana-green/20">
                <div className="w-2 h-2 rounded-full bg-solana-green animate-pulse" />
                <span className="text-xs font-bold text-solana-green">
                  {shortAddress}
                </span>
              </div>
            ) : (
              <WalletMultiButton className="!bg-solana-green !text-black !font-bold !rounded-lg !h-9 !px-4 !text-xs" />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        {currentView === "dashboard" && (
          <DashboardView
            lotteryState={lotteryState}
            selectedNumbers={selectedNumbers}
            onNumberToggle={handleNumberToggle}
            onBuyTicket={buyTicket}
            isBuying={isBuying}
            connected={connected}
          />
        )}
        {currentView === "my-tickets" && <MyTicketsView tickets={tickets} />}
        {currentView === "winners" && <WinnersView />}
        {currentView === "admin" && <Admin />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">
          <div className="flex gap-4">
            <span>Powered by Solana</span>
            <span>•</span>
            <span>Verifiable On-Chain Randomness</span>
          </div>
          <div className="flex gap-4">
            <span>
              Program: <span className="text-solana-green">SoLot...ry1</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <MyContextProvider>
            <AppContent />
          </MyContextProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
