import { PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";
import BN from "bn.js";

window.Buffer = Buffer;

// ✅ Global PDA
export const getGlobalPda = (programId: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("globals")],
    programId
  )[0];
};

// ✅ Round PDA (u64 → 8 bytes)
export const getRoundPda = (roundId: any, programId: PublicKey) => {
  if (roundId === undefined || roundId === null) {
    throw new Error("roundId is invalid");
  }

  const bn = new BN(roundId);

  return PublicKey.findProgramAddressSync(
    [Buffer.from("round"), bn.toArrayLike(Buffer, "le", 8)],
    programId
  )[0];
};


export const getTicketpda = (
  roundId: any,
  programId: PublicKey,
  ticket: number
) => {
  if (roundId === undefined || ticket === undefined) {
    throw new Error("Invalid inputs");
  }

  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("ticket"),
      new BN(roundId).toArrayLike(Buffer, "le", 8),
      Buffer.from([ticket]), 
    ],
    programId
  )[0];
};


export const getUserTicketPda = (
  roundId: any,
  programId: PublicKey,
  userPubkey: PublicKey,
  ticket: number
) => {
  if (!userPubkey) throw new Error("Invalid user pubkey");

  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("user_ticket"),
      userPubkey.toBuffer(),
      new BN(roundId).toArrayLike(Buffer, "le", 8),
      Buffer.from([ticket]), 
    ],
    programId
  )[0];
};


export const getTreasuryAccount = (
  roundId: any,
  programId: PublicKey
) => {
  if (roundId === undefined) {
    throw new Error("roundId is invalid");
  }

  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("treasury"),
      new BN(roundId).toArrayLike(Buffer, "le", 8),
    ],
    programId
  )[0];
};