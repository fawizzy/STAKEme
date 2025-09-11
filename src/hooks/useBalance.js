import { usePublicClient, useWalletClient } from "wagmi";
import { STAKING_TOKEN_ABI } from "../config/ABI";
import { formatEther, parseAbiItem, parseEther } from "viem";

import React, { useEffect, useMemo, useState } from "react";

function useAccountBalance() {
  const publicClient = usePublicClient();

  const walletClient = useWalletClient();

  const [accountBalance, setAccountBalance] = useState(0);

  useEffect(() => {
    (async () => {
      if (!walletClient.data?.account.address) {
        return;
      }

      const userBalance = await publicClient.readContract({
        address: import.meta.env.VITE_STAKING_TOKEN,
        abi: STAKING_TOKEN_ABI,
        functionName: "balanceOf",
        args: [walletClient.data?.account.address],
      });

      setAccountBalance(formatEther(userBalance));
    })();

    const unwatch = publicClient.watchEvent({
      address: import.meta.env.VITE_STAKING_TOKEN,
      event: parseAbiItem(
        "event Transfer(address indexed from, address indexed to, uint256 value)"
      ),
      onLogs: (logs) => {
        const { from, to, value } = logs[0].args;
        if (from == walletClient?.data?.account?.address) {
          setAccountBalance((prev) =>
            formatEther(parseEther(prev) - value)
          );
        }

        if (to == walletClient?.data?.account?.address) {
          setAccountBalance((prev) => 
           formatEther(parseEther(prev) + value)
          );
        }
      },
    });

    return () => {
      unwatch();
    };
  }, [publicClient, walletClient.data?.account.address]);
  return useMemo(() => accountBalance, [accountBalance]);
}

export default useAccountBalance;
