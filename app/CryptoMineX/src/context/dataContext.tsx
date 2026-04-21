import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getGlobalPda, getRoundPda, getTicketpda } from "../utils/getPda";
import { useProgram } from "../utils/intance";
import { useConnection } from "@solana/wallet-adapter-react";

// ✅ Types
type RoundData = {
  currentRound: string;
  isRoundActive: boolean;
  admin: string;
  roundId: number;
  totalAmount: string;
  startTime: number;
  endTime: number;
  winnerTicket: number;
  users: string[];
  randomnessAccount: string;
};
export type TicketInfo = {
  ticketNo: number;
  exists: boolean;
  totalAmount: string;
  users: string[];
};

type ContextType = {
  roundData: RoundData;
  setRoundData: React.Dispatch<React.SetStateAction<RoundData>>;
  setTickets: React.Dispatch<React.SetStateAction<TicketInfo[]>>;
  tickets: TicketInfo[];
  getdata: () => Promise<void>; // ✅ added
  getRoundData: () => Promise<void>;
  getTicketData: () => Promise<void>;
  gameStatus: "live" | "ended" | "reset";
  setGameStatus: React.Dispatch<
    React.SetStateAction<"live" | "ended" | "reset" | "waiting">
  >;

  winnerNumber: number | null;
  setWinnerNumber: React.Dispatch<React.SetStateAction<number | null>>;
};

export const MyContext = createContext<ContextType | null>(null);

type ProviderProps = {
  children: ReactNode;
};

export const MyContextProvider = ({ children }: ProviderProps) => {
  const [roundData, setRoundData] = useState<RoundData>({
    currentRound: "0",
    isRoundActive: false,
    admin: "",
    roundId: 0,
    totalAmount: "0",
    startTime: 0,
    endTime: 0,
    winnerTicket: 0,
    users: [],
    randomnessAccount: "",
  });
  const [tickets, setTickets] = useState<TicketInfo[]>([]);
  const [gameStatus, setGameStatus] = useState<
    "live" | "ended" | "reset" | "waiting"
  >("live");
  const [winnerNumber, setWinnerNumber] = useState<number | null>(null);

  const { program, programId } = useProgram();
  const { connection } = useConnection();

  // ✅ Fixed function
  const getdata = async () => {
    try {
      if (!program) {
        console.log("Program not initialized");
        return;
      }

      const pda = getGlobalPda(programId);

      const data = await program.account.globalState.fetch(pda);

      // console.log(data);

      // ✅ store in state
      setRoundData({
        ...roundData,
        currentRound: data.roundId.toString(),
        isRoundActive: data.isRoundActive,
        admin: data.admin.toBase58(),
      });
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const getRoundData = async () => {
    try {
      if (!program) {
        console.log("Program not initialized");
        return;
      }

      // ✅ Always fetch from chain
      const globalPda = getGlobalPda(programId);
      const globalData = await program.account.globalState.fetch(globalPda);

      const roundId = Number(globalData.roundId);

      // console.log("Round ID:", roundId);

      // ✅ derive PDA
      const pda = getRoundPda(roundId, programId);

      // console.log("Round PDA:", pda);

      // ✅ fetch
      const data = await program.account.round.fetch(pda);

      setRoundData({
        ...roundData,
        roundId: data.roundId.toNumber(),
        currentRound: data.roundId.toString(),
        totalAmount: data.totalAmount.toString(),
        startTime: data.startTime.toNumber(),
        endTime: data.endTime.toNumber(),
        winnerTicket: data.winnerTicket,
        users: data.users.map((u: any) => u.toBase58()),
        randomnessAccount: data.randomnessAccount.toBase58(),
        isRoundActive: globalData?.isRoundActive,
      });
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  // dataContext.tsx mein add karo

  useEffect(() => {
    if (!program) return;

    const poll = setInterval(async () => {
      try {
        await getRoundData();
        await getTicketData();
      } catch (err) {
        console.log("Poll error:", err);
      }
    }, 10_000); // 10 seconds

    return () => clearInterval(poll);
  }, [program]);

  // ✅ getTicketData fix — roundData.roundId stale problem
  const getTicketData = async () => {
    try {
      if (!program) return;

      // ✅ Fresh roundId chain se lo — roundData.roundId stale ho sakta hai
      const globalPda = getGlobalPda(programId);
      const globalData = await program.account.globalState.fetch(globalPda);
      const freshRoundId = Number(globalData.roundId);

      if (!freshRoundId) return;

      const temp: TicketInfo[] = [];

      for (let i = 1; i <= 25; i++) {
        try {
          const ticketPda = getTicketpda(freshRoundId, programId, i); // ✅ fresh

          const data = await program.account.ticket.fetchNullable(ticketPda);

          temp.push(
            data
              ? {
                  ticketNo: i,
                  exists: true,
                  totalAmount: data.totalAmount.toString(),
                  users: data.users.map((u: any) => u.toBase58()),
                }
              : {
                  ticketNo: i,
                  exists: false,
                  totalAmount: "0",
                  users: [],
                },
          );
        } catch (err) {
          console.log("Error ticket:", i, err);
        }
      }

      setTickets(temp);
    } catch (error) {
      console.log(error);
    }
  };
  // const getTicketData = async () => {
  //   const data = await fetch(
  //     "http://192.168.1.31:3000/api/lottery/ticket_data",
  //     { method: "GET" },
  //   );

  //   const dat2a = await data.json();
  //   setTickets(dat2a?.tickets);
  // };

  return (
    <MyContext.Provider
      value={{
        roundData,
        setRoundData,
        getdata,
        getRoundData,
        getTicketData,
        setTickets,
        tickets,
        gameStatus,
        setGameStatus,
        winnerNumber,
        setWinnerNumber,
      }}
    >
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => {
  const context = useContext(MyContext);

  if (!context) {
    throw new Error("useMyContext must be used inside MyContextProvider");
  }

  return context;
};
