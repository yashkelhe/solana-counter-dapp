import {
  Connection,
  PublicKey,
  clusterApiUrl,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  Keypair,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import { Buffer } from "buffer";
import { useEffect, useState } from "react";

window.Buffer = Buffer;

const PROGRAM_ID = new PublicKey(
  "3tPhbV1Wv8ttcs8fdoYXatHacxt5p8gXhNNbhqkPgLGW",
);

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

function App() {
  const [wallet, setWallet] = useState(null);
  const [counterAccount, setCounterAccount] = useState(null);
  const [count, setCount] = useState(null);

  useEffect(() => {
    checkWallet();
  }, []);

  const checkWallet = async () => {
    if (window.solana && window.solana.isPhantom) {
      const response = await window.solana.connect({
        onlyIfTrusted: true,
      });

      setWallet(response.publicKey);
    }
  };

  const connectWallet = async () => {
    const response = await window.solana.connect();
    setWallet(response.publicKey);
  };

  // const createCounter = async () => {
  //   const provider = window.solana;

  //   const counter = Keypair.generate();

  //   const lamports = await connection.getMinimumBalanceForRentExemption(4);

  //   const createAccountIx = SystemProgram.createAccount({
  //     fromPubkey: provider.publicKey,
  //     newAccountPubkey: counter.publicKey,
  //     space: 4,
  //     lamports,
  //     programId: PROGRAM_ID,
  //   });

  //   const initIx = new TransactionInstruction({
  //     keys: [
  //       {
  //         pubkey: counter.publicKey,
  //         isSigner: false,
  //         isWritable: true,
  //       },
  //     ],
  //     programId: PROGRAM_ID,
  //     data: Buffer.from([0]),
  //   });

  //   const tx = new Transaction().add(createAccountIx, initIx);

  //   tx.feePayer = provider.publicKey;

  //   const latestBlockhash = await connection.getLatestBlockhash();

  //   tx.recentBlockhash = latestBlockhash.blockhash;

  //   tx.partialSign(counter);

  //   const signed = await provider.signTransaction(tx);

  //   const signature = await connection.sendRawTransaction(signed.serialize());

  //   await connection.confirmTransaction(signature);

  //   setCounterAccount(counter.publicKey);

  //   fetchCount(counter.publicKey);

  //   alert("Counter Created!");
  // };

  const createCounter = async () => {
    try {
      const provider = window.solana;

      const counter = Keypair.generate();

      const lamports = await connection.getMinimumBalanceForRentExemption(4);

      const createAccountIx = SystemProgram.createAccount({
        fromPubkey: provider.publicKey,
        newAccountPubkey: counter.publicKey,
        space: 4,
        lamports,
        programId: PROGRAM_ID,
      });

      const initIx = new TransactionInstruction({
        keys: [
          {
            pubkey: counter.publicKey,
            isSigner: false,
            isWritable: true,
          },
        ],
        programId: PROGRAM_ID,
        data: Buffer.from([0]),
      });

      const transaction = new Transaction();

      transaction.add(createAccountIx);
      transaction.add(initIx);

      transaction.feePayer = provider.publicKey;

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();

      transaction.recentBlockhash = blockhash;

      transaction.partialSign(counter);

      const signedTx = await provider.signTransaction(transaction);

      const signature = await connection.sendRawTransaction(
        signedTx.serialize(),
      );

      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      console.log("Counter Created:", counter.publicKey.toString());

      setCounterAccount(counter.publicKey);

      await fetchCount(counter.publicKey);

      alert("Counter Created!");
    } catch (err) {
      console.error(err);
    }
  };
  const fetchCount = async (pubkey = counterAccount) => {
    const accountInfo = await connection.getAccountInfo(pubkey);

    if (!accountInfo) return;

    const data = accountInfo.data;

    const value = data.readUInt32LE(0);

    setCount(value);
  };

  const increment = async () => {
    await sendInstruction(1);
  };

  const decrement = async () => {
    await sendInstruction(2);
  };

  //   const sendInstruction = async (instruction) => {
  //   try {
  //     const provider = window.solana;

  //     const ix = new TransactionInstruction({
  //       keys: [
  //         {
  //           pubkey: counterAccount,
  //           isSigner: false,
  //           isWritable: true,
  //         },
  //       ],
  //       programId: PROGRAM_ID,
  //       data: Buffer.from([instruction]),
  //     });

  //     const transaction = new Transaction().add(ix);

  //     transaction.feePayer = provider.publicKey;

  //     const { blockhash, lastValidBlockHeight } =
  //       await connection.getLatestBlockhash();

  //     transaction.recentBlockhash = blockhash;

  //     const signed =
  //       await provider.signTransaction(transaction);

  //     const signature =
  //       await connection.sendRawTransaction(
  //         signed.serialize()
  //       );

  //     await connection.confirmTransaction({
  //       signature,
  //       blockhash,
  //       lastValidBlockHeight,
  //     });

  //     await fetchCount();
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const sendInstruction = async (instruction) => {
    try {
      const provider = window.solana;

      const ix = new TransactionInstruction({
        keys: [
          {
            pubkey: counterAccount,
            isSigner: false,
            isWritable: true,
          },
        ],
        programId: PROGRAM_ID,
        data: Buffer.from([instruction]),
      });

      const transaction = new Transaction().add(ix);

      transaction.feePayer = provider.publicKey;

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();

      transaction.recentBlockhash = blockhash;

      const signed = await provider.signTransaction(transaction);

      const signature = await connection.sendRawTransaction(signed.serialize());

      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      await fetchCount();
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div
      style={{
        padding: 40,
        fontFamily: "sans-serif",
      }}
    >
      <h1>Solana Counter dApp</h1>

      {!wallet ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <p>
          Wallet:
          {wallet.toString()}
        </p>
      )}

      <br />

      <button onClick={createCounter}>Create Counter</button>

      {counterAccount && (
        <>
          <h3>Counter Account:</h3>

          <p>{counterAccount.toString()}</p>

          <h2>Count: {count}</h2>

          <button onClick={increment}>Increment</button>

          <button onClick={decrement} style={{ marginLeft: 10 }}>
            Decrement
          </button>

          <button onClick={() => fetchCount()} style={{ marginLeft: 10 }}>
            Refresh
          </button>
        </>
      )}
    </div>
  );
}

export default App;
