// import {
//   Connection,
//   PublicKey,
//   clusterApiUrl,
//   Transaction,
//   TransactionInstruction,
//   SystemProgram,
//   Keypair,
//   sendAndConfirmTransaction,
// } from "@solana/web3.js";

// import { Buffer } from "buffer";
// import { useEffect, useState } from "react";

// window.Buffer = Buffer;

// const PROGRAM_ID = new PublicKey(
//   "3tPhbV1Wv8ttcs8fdoYXatHacxt5p8gXhNNbhqkPgLGW",
// );

// const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// function App() {
//   const [wallet, setWallet] = useState(null);
//   const [counterAccount, setCounterAccount] = useState(null);
//   const [count, setCount] = useState(null);

//   useEffect(() => {
//     checkWallet();
//   }, []);

//   const checkWallet = async () => {
//     if (window.solana && window.solana.isPhantom) {
//       const response = await window.solana.connect({
//         onlyIfTrusted: true,
//       });

//       setWallet(response.publicKey);
//     }
//   };

//   const connectWallet = async () => {
//     const response = await window.solana.connect();
//     setWallet(response.publicKey);
//   };

//   const createCounter = async () => {
//     try {
//       const provider = window.solana;

//       const counter = Keypair.generate();

//       const lamports = await connection.getMinimumBalanceForRentExemption(4);

//       const createAccountIx = SystemProgram.createAccount({
//         fromPubkey: provider.publicKey,
//         newAccountPubkey: counter.publicKey,
//         space: 4,
//         lamports,
//         programId: PROGRAM_ID,
//       });

//       const initIx = new TransactionInstruction({
//         keys: [
//           {
//             pubkey: counter.publicKey,
//             isSigner: false,
//             isWritable: true,
//           },
//         ],
//         programId: PROGRAM_ID,
//         data: Buffer.from([0]),
//       });

//       const transaction = new Transaction();

//       transaction.add(createAccountIx);
//       transaction.add(initIx);

//       transaction.feePayer = provider.publicKey;

//       const { blockhash, lastValidBlockHeight } =
//         await connection.getLatestBlockhash();

//       transaction.recentBlockhash = blockhash;

//       transaction.partialSign(counter);

//       const signedTx = await provider.signTransaction(transaction);

//       const signature = await connection.sendRawTransaction(
//         signedTx.serialize(),
//       );

//       await connection.confirmTransaction({
//         signature,
//         blockhash,
//         lastValidBlockHeight,
//       });

//       console.log("Counter Created:", counter.publicKey.toString());

//       setCounterAccount(counter.publicKey);

//       await fetchCount(counter.publicKey);

//       alert("Counter Created!");
//     } catch (err) {
//       console.error(err);
//     }
//   };
//   const fetchCount = async (pubkey = counterAccount) => {
//     const accountInfo = await connection.getAccountInfo(pubkey);

//     if (!accountInfo) return;

//     const data = accountInfo.data;

//     const value = data.readUInt32LE(0);

//     setCount(value);
//   };

//   const increment = async () => {
//     await sendInstruction(1);
//   };

//   const decrement = async () => {
//     await sendInstruction(2);
//   };

//   const sendInstruction = async (instruction) => {
//     try {
//       const provider = window.solana;

//       const ix = new TransactionInstruction({
//         keys: [
//           {
//             pubkey: counterAccount,
//             isSigner: false,
//             isWritable: true,
//           },
//         ],
//         programId: PROGRAM_ID,
//         data: Buffer.from([instruction]),
//       });

//       const transaction = new Transaction().add(ix);

//       transaction.feePayer = provider.publicKey;

//       const { blockhash, lastValidBlockHeight } =
//         await connection.getLatestBlockhash();

//       transaction.recentBlockhash = blockhash;

//       const signed = await provider.signTransaction(transaction);

//       const signature = await connection.sendRawTransaction(signed.serialize());

//       await connection.confirmTransaction({
//         signature,
//         blockhash,
//         lastValidBlockHeight,
//       });

//       await fetchCount();
//     } catch (err) {
//       console.error(err);
//     }
//   };
//   return (
//     <div
//       style={{
//         padding: 40,
//         fontFamily: "sans-serif",
//       }}
//     >
//       <h1>Solana Counter dApp</h1>

//       {!wallet ? (
//         <button onClick={connectWallet}>Connect Wallet</button>
//       ) : (
//         <p>
//           Wallet:
//           {wallet.toString()}
//         </p>
//       )}

//       <br />

//       <button onClick={createCounter}>Create Counter</button>

//       {counterAccount && (
//         <>
//           <h3>Counter Account:</h3>

//           <p>{counterAccount.toString()}</p>

//           <h2>Count: {count}</h2>

//           <button onClick={increment}>Increment</button>

//           <button onClick={decrement} style={{ marginLeft: 10 }}>
//             Decrement
//           </button>

//           <button onClick={() => fetchCount()} style={{ marginLeft: 10 }}>
//             Refresh
//           </button>
//         </>
//       )}
//     </div>
//   );
// }

// export default App;

import {
  Connection,
  PublicKey,
  clusterApiUrl,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  Keypair,
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
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkWallet();
  }, []);

  const checkWallet = async () => {
    try {
      if (window.solana?.isPhantom) {
        const response = await window.solana.connect({
          onlyIfTrusted: true,
        });

        setWallet(response.publicKey);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const connectWallet = async () => {
    const response = await window.solana.connect();
    setWallet(response.publicKey);
  };

  const createCounter = async () => {
    try {
      setLoading(true);

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

      const transaction = new Transaction().add(createAccountIx).add(initIx);

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

      setCounterAccount(counter.publicKey);

      await fetchCount(counter.publicKey);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCount = async (pubkey = counterAccount) => {
    const accountInfo = await connection.getAccountInfo(pubkey);

    if (!accountInfo) return;

    const data = accountInfo.data;

    const value = data.readUInt32LE(0);

    setCount(value);
  };

  const sendInstruction = async (instruction) => {
    try {
      setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  const increment = async () => {
    await sendInstruction(1);
  };

  const decrement = async () => {
    await sendInstruction(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050816] via-[#111827] to-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Solana Counter</h1>

            <p className="text-gray-400 mt-2">
              Native Solana dApp using Rust + React
            </p>
          </div>

          {!wallet ? (
            <button
              onClick={connectWallet}
              className="bg-purple-600 hover:bg-purple-700 transition px-5 py-3 rounded-xl font-semibold"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-xl text-sm">
              Connected
            </div>
          )}
        </div>

        {wallet && (
          <div className="bg-black/30 rounded-2xl p-4 mb-6 border border-white/10">
            <p className="text-gray-400 text-sm">Wallet Address</p>

            <p className="mt-1 break-all text-sm">{wallet.toString()}</p>
          </div>
        )}

        <button
          onClick={createCounter}
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90 transition rounded-2xl py-4 font-semibold text-lg"
        >
          {loading ? "Processing..." : "Create Counter"}
        </button>

        {counterAccount && (
          <>
            <div className="mt-8 bg-black/30 rounded-2xl p-6 border border-white/10">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-400 text-sm">Counter Account</p>

                  <p className="mt-2 text-sm break-all">
                    {counterAccount.toString()}
                  </p>
                </div>

                <a
                  href={`https://explorer.solana.com/address/${counterAccount.toString()}?cluster=devnet`}
                  target="_blank"
                  className="bg-white/10 hover:bg-white/20 transition px-4 py-2 rounded-xl text-sm"
                >
                  Explorer
                </a>
              </div>

              <div className="mt-10 text-center">
                <h2 className="text-7xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  {count}
                </h2>

                <p className="text-gray-400 mt-2">Current Counter Value</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-10">
                <button
                  onClick={increment}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 transition rounded-2xl py-4 text-lg font-semibold"
                >
                  Increment
                </button>

                <button
                  onClick={decrement}
                  disabled={loading}
                  className="bg-red-500 hover:bg-red-600 transition rounded-2xl py-4 text-lg font-semibold"
                >
                  Decrement
                </button>
              </div>

              <button
                onClick={() => fetchCount()}
                className="w-full mt-4 bg-white/10 hover:bg-white/20 transition rounded-2xl py-4 font-semibold"
              >
                Refresh Counter
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
