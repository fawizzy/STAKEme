import React, { useCallback} from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { toast } from "sonner";
// import { walletClient, account } from "../config/viemConfig";

import { STAKING_CONTRACT_ABI, STAKING_TOKEN_ABI } from "../config/ABI";
import { parseEther } from "viem";

export function useMint() {
  const publicClient = usePublicClient();
  const {data, status} = useWalletClient();

  const mint = useCallback(
    async (amount) => {
      if (!publicClient) return;
      if (status !== "success") {
        toast.error("Wallet not connected");
        return;
      }

      try {
        const simulateMint = await publicClient.simulateCalls({
          account: data.account.address,
          calls: [
            {
              to: import.meta.env.VITE_STAKING_TOKEN,
              abi: STAKING_TOKEN_ABI,
              functionName: "mint",
              args: [ parseEther(String(amount))],
            }
          ],
        });

        

        if (simulateMint.results[0].status === "failure") {
          toast.error("Minting will likely fail", {
            description: simulateMint.results[0].error.cause?.reason,
          });
          return;
        }

        const mintTx = await data.writeContract({
          address: import.meta.env.VITE_STAKING_TOKEN,
          abi: STAKING_TOKEN_ABI,
          functionName: "mint",
          args: [ parseEther(String(amount))],
        });

        const mintReceipt = await publicClient.waitForTransactionReceipt({
          hash: mintTx,
        });

       
        
        if (mintReceipt.status !== "success") {
          toast.error("Minting failed", {
            description: "Transaction reverted",
          });
        } else {
          toast.success("Staking successful", {
            description: `Successfully minted ${amount} tokens`,
          });
        }
      } catch (err) {
        console.error(err);
        toast.error("Unexpected error", {
          description: err.shortMessage || err.message,
        });
      }
    },
    [publicClient, data, status] 
  );

  return { mint, status };
}
export default useMint;
