import React, { useCallback, useEffect, useState} from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { toast } from "sonner";
// import { walletClient, account } from "../config/viemConfig";

import { STAKING_CONTRACT_ABI, STAKING_TOKEN_ABI } from "../config/ABI";
import { parseEther } from "viem";

export function useStake() {
  const publicClient = usePublicClient();
  const {data, status} = useWalletClient();
  const [allowance, setAllowance] = useState(0)

  // ✅ new loading states
  const [isApproving, setIsApproving] = useState(false);
  const [isStaking, setIsStaking] = useState(false);

  const checkAllowance = useCallback(async () => {
    if (!data?.account?.address) return;
    const allowance = await publicClient.readContract({
      address: import.meta.env.VITE_STAKING_TOKEN,
      abi: STAKING_TOKEN_ABI,
      functionName: "allowance",
      args: [data.account.address, import.meta.env.VITE_STAKING_CONTRACT],
    });
    setAllowance(allowance);
  }, [data?.account?.address, publicClient]);

  useEffect(() => {
    checkAllowance();
  }, [checkAllowance]);

  const approve =  useCallback(
    async (amount)=>{
      if (!publicClient) return;
      if (!data?.account?.address) return
      if (status !== "success") {
        toast.error("Wallet not connected");
        return;
      }

      try {
        setIsApproving(true); // start loading

        const simulateStake = await publicClient.simulateCalls({
          account: data.account.address,
          calls: [
            {
              to: import.meta.env.VITE_STAKING_TOKEN,
              abi: STAKING_TOKEN_ABI,
              functionName: "approve",
              args: [import.meta.env.VITE_STAKING_CONTRACT, parseEther(String(amount))],
            }
          ],
        });

        if (simulateStake.results[0].status === "failure") {
          toast.error("Approval will likely fail", {
            description: simulateStake.results[0].error.cause?.reason,
          });
          return;
        }

        const approveTx = await data.writeContract({
          address: import.meta.env.VITE_STAKING_TOKEN,
          abi: STAKING_TOKEN_ABI,
          functionName: "approve",
          args: [import.meta.env.VITE_STAKING_CONTRACT, parseEther(String(amount))],
        });

        const approveReceipt = await publicClient.waitForTransactionReceipt({
          hash: approveTx,
        });

        if (approveReceipt.status !== "success") {
          toast.error("Approval failed", {
            description: "Transaction reverted",
          });
          return;
        } else {
          checkAllowance()
          toast.success("Approval successful", {
            description: `You can now stake ${amount} tokens`
          })
        }

      } catch (err) {
        console.error(err);
        toast.error("Unexpected error", {
          description: err.shortMessage || err.message,
        });
      } finally {
        setIsApproving(false); // stop loading
      }
    }, [publicClient, data, status, checkAllowance]
  );

  const stake = useCallback(
    async (amount) => {
      if (!publicClient) return;
      if (status !== "success") {
        toast.error("Wallet not connected");
        return;
      }

      try {
        setIsStaking(true); // start loading

        const simulateStake = await publicClient.simulateCalls({
          account: data.account.address,
          calls: [
            {
              to: import.meta.env.VITE_STAKING_CONTRACT,
              abi: STAKING_CONTRACT_ABI,
              functionName: "stake",
              args: [parseEther(String(amount))],
            },
          ],
        });

        if (simulateStake.results[0].status === "failure") {
          toast.error("Staking will likely fail", {
            description: simulateStake.results[0].error.cause?.reason,
          });
          return;
        }

        const stakeTx = await data.writeContract({
          address: import.meta.env.VITE_STAKING_CONTRACT,
          abi: STAKING_CONTRACT_ABI,
          functionName: "stake",
          args: [parseEther(String(amount))],
        });

        const stakeReceipt = await publicClient.waitForTransactionReceipt({
          hash: stakeTx,
        });

        if (stakeReceipt.status !== "success") {
          toast.error("Staking failed", {
            description: "Transaction reverted",
          });
        } else {
          toast.success("Staking successful", {
            description: `Successfully staked ${amount} tokens`,
          });
          checkAllowance();
        }
      } catch (err) {
        console.error(err);
        toast.error("Unexpected error", {
          description: err.shortMessage || err.message,
        });
      } finally {
        setIsStaking(false); // stop loading
      }
    },
    [publicClient, status, data, checkAllowance] 
  );

  return { stake, approve, allowance, status, isApproving, isStaking };
}
export default useStake;
