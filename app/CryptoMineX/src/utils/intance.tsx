import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useMemo } from "react";
import lottery from "../utils/lottery.json";

export const useProgram = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const programId = new PublicKey(
    "9VWtCDH3iC58GHWhkEb6wNPas8sVprjjCBKmNbTW4Mbt",
  );

  const provider = useMemo(() => {
    if (!wallet) return null;

    return new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program(lottery, provider);
  }, [provider]);

  return { program, provider, programId };
};
