import React, { useCallback, useState } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { toast } from "sonner";
import { STAKING_CONTRACT_ABI } from "../config/ABI";

export function useEmergencyWithdraw() {
  const publicClient = usePublicClient();
  const { data, status } = useWalletClient();
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const emergencyWithdraw = useCallback(async () => {
    if (!publicClient) return;
    if (status !== "success") {
      toast.error("Wallet not connected");
      return;
    }

    try {
      setIsWithdrawing(true);

      const simulateEmergencyWithdraw = await publicClient.simulateCalls({
        account: data.account.address,
        calls: [
          {
            to: import.meta.env.VITE_STAKING_CONTRACT,
            abi: STAKING_CONTRACT_ABI,
            functionName: "emergencyWithdraw",
          },
        ],
      });

      if (simulateEmergencyWithdraw.results[0].status === "failure") {
        toast.error("Withdrawal will fail", {
          description: simulateEmergencyWithdraw.results[0].error.cause?.reason,
        });
        setIsWithdrawing(false);
        return;
      }

      const emergencyWithdrawalTx = await data.writeContract({
        address: import.meta.env.VITE_STAKING_CONTRACT,
        abi: STAKING_CONTRACT_ABI,
        functionName: "emergencyWithdraw",
      });

      const emergencyWithdrawalReceipt =
        await publicClient.waitForTransactionReceipt({
          hash: emergencyWithdrawalTx,
        });

      if (emergencyWithdrawalReceipt.status !== "success") {
        toast.error("Emergency Withdrawal failed", {
          description: "Transaction reverted",
        });
      } else {
        toast.success("Withdraw successful", {
          description: `Successfully withdrew tokens`,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error", {
        description: err.shortMessage || err.message,
      });
    } finally {
      setIsWithdrawing(false);
    }
  }, [publicClient, data, status]);

  return { emergencyWithdraw, status, isWithdrawing };
}

export default useEmergencyWithdraw;
