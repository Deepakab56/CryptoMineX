import React, { useContext, useEffect, useState } from "react";
import { useProgram } from "../utils/intance";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { getGlobalPda, getRoundPda } from "../utils/getPda";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { MyContext, useMyContext } from "../context/dataContext";

type Notification = {
  id: string;
  message: string;
  type: "success" | "error" | "info";
};

const Admin = () => {
  const { program, provider, programId } = useProgram();
  const wallet = useAnchorWallet();
  const connection = useConnection();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { roundData, getdata, getRoundData } = useMyContext();

  const addNotification = (message: string, type: Notification["type"]) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  useEffect(() => {
    getdata();
  }, [connection, wallet]);

  const Initialize = async () => {
    if (!program || !wallet?.publicKey)
      return addNotification("Connect wallet first", "error");

    const globalPda = await getGlobalPda(programId);
    const tx = await program.methods
      .initialize()
      .accounts({
        signer: wallet.publicKey,
        globalAccount: globalPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    await provider?.connection.confirmTransaction(tx, "confirmed");

    console.log(tx);
  };

  const createRound = async () => {
    if (!program || !wallet?.publicKey)
      return addNotification("Connect wallet first", "error");

    const globalPda = await getGlobalPda(programId);
    const roundPda = await getRoundPda(roundData?.currentRound, programId);
    const tx = await program.methods
      .initializeRound()
      .accounts({
        signer: wallet.publicKey,
        globalAccount: globalPda,
        roundAccount: roundPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    await provider?.connection.confirmTransaction(tx, "confirmed");
    console.log(tx);
  };

  useEffect(() => {
    getRoundData();
  }, [connection, wallet]);

  const closeRound = async () => {
    if (!program || !wallet?.publicKey)
      return addNotification("Connect wallet first", "error");

    const globalPda = await getGlobalPda(programId);
    const roundPda = await getRoundPda(roundData?.currentRound, programId);

    const tx = await program.methods
      .closeAccount()
      .accounts({
        signer: wallet.publicKey,
        globalAccount: globalPda,
        roundAccount: roundPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    await provider?.connection.confirmTransaction(tx, "confirmed");
    console.log(tx);
  };


  const handleCommitRandomness = async()=>{
     if (!program || !wallet?.publicKey)
      return addNotification("Connect wallet first", "error");

    const globalPda = await getGlobalPda(programId);
    const roundPda = await getRoundPda(roundData?.currentRound, programId);
  }



  return (
    <div className="min-h-screen bg-[#0b0f14] text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

      {/* ROUND INFO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-[#121821] p-5 rounded-xl">
          <p className="text-gray-400">Current Round</p>
          <h2 className="text-xl font-bold">{roundData.currentRound}</h2>
        </div>

        <div className="bg-[#121821] p-5 rounded-xl">
          <p className="text-gray-400">Status</p>
          <h2 className="text-green-400 font-bold">
            {roundData?.isRoundActive == false ? "deactive" : "active"}
          </h2>
        </div>

        <div className="bg-[#121821] p-5 rounded-xl">
          <p className="text-gray-400">Total Pool</p>
          <h2 className="text-xl font-bold">124.5 SOL</h2>
        </div>
      </div>

      {/* CREATE ROUND */}
      <div className="bg-[#121821] p-6 rounded-xl mb-6">
        <h2 className="text-lg font-semibold mb-4">Initialize Game</h2>
        <button
          className="mt-4 bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg font-semibold"
          onClick={() => Initialize()}
        >
          Initialize Round
        </button>
      </div>

      {/* ROUND ACTIONS */}
      <div className="bg-[#121821] p-6 rounded-xl mb-6">
        <h2 className="text-lg font-semibold mb-4">Round Actions</h2>

        <div className="flex flex-wrap gap-4">
          <button
            className="bg-pink-500 hover:bg-yellow-600 px-5 py-2 rounded-lg"
            onClick={() => createRound()}
          >
            Create Round
          </button>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 px-5 py-2 rounded-lg"
            onClick={() => closeRound()}
          >
            Close Round
          </button>

          <button className="bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-lg" onClick={handleCommitRandomness}>
            Commit Randomness
          </button>

          <button className="bg-purple-500 hover:bg-purple-600 px-5 py-2 rounded-lg">
            Reveal Winner
          </button>

          <button className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-lg">
            Distribute Rewards
          </button>
        </div>
      </div>

      {/* WINNER DISPLAY */}
      <div className="bg-[#121821] p-6 rounded-xl">
        <h2 className="text-lg font-semibold mb-4">Winner Info</h2>

        <div className="flex items-center justify-between">
          <p className="text-gray-400">Winning Ticket</p>
          <span className="text-green-400 text-xl font-bold">#14</span>
        </div>

        <div className="mt-4">
          <p className="text-gray-400 mb-2">Status</p>
          <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg">
            Revealed
          </span>
        </div>
      </div>
    </div>
  );
};

export default Admin;
