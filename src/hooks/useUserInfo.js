import React, { useEffect, useMemo, useState } from "react";
import { usePublicClient, useWalletClient } from "wagmi";
import { STAKING_CONTRACT_ABI } from "../config/ABI";
import { parseAbiItem } from "viem";

function useUserInfo() {
  const publicClient = usePublicClient();
  const walletClient = useWalletClient();
  const [userInfo, setUserInfo] = useState();

  useEffect(() => {
    if (!publicClient) return;
    if (!walletClient.data?.account.address) return;
    const fetchUserInfo = async () => {
      const _userInfo = await publicClient.readContract({
        address: import.meta.env.VITE_STAKING_CONTRACT,
        abi: STAKING_CONTRACT_ABI,
        functionName: "getUserDetails",
        args: [walletClient.data.account.address],
      });

      setUserInfo(_userInfo);
    };

    fetchUserInfo();

    const unwatchStaked = publicClient.watchEvent({
      address: import.meta.env.VITE_STAKING_CONTRACT,
      event: parseAbiItem(
        "event Staked(address indexed user,uint256 amount,uint256 timestamp,uint256 newTotalStaked,uint256 currentRewardRate)"
      ),
      onLogs: async (logs) => {
        setUserInfo((prev)=>({
          ...prev, stakedAmount: logs[0].args.newTotalStaked
        }))
      },
    });

    const unwatchWithdrawn = publicClient.watchEvent({
      address: import.meta.env.VITE_STAKING_CONTRACT,
      event: parseAbiItem(
        "event Withdrawn(address indexed user,uint256 amount,uint256 timestamp,uint256 newTotalStaked,uint256 currentRewardRate,uint256 rewardsAccrued)"
      ),
      onLogs: async (logs) => {
        setUserInfo((prev)=>({
          ...prev, stakedAmount: logs[0].args.newTotalStaked
        }))
      },
    });

    const unwatchEmergency = publicClient.watchEvent({
      address: import.meta.env.VITE_STAKING_CONTRACT,
      event: parseAbiItem(
        "event EmergencyWithdrawn(address indexed user,uint256 amount,uint256 penalty,uint256 timestamp,uint256 newTotalStaked)"
      ),
      onLogs: async (logs) => {
        setUserInfo((prev)=>({
          ...prev, stakedAmount: logs[0].args.newTotalStaked
        }))
      },
    });

    // const unwatchRateUpdated = publicClient.watchEvent({
    //   address: import.meta.env.VITE_STAKING_CONTRACT,
    //   event: parseAbiItem(
    //     "event RewardRateUpdated(uint256 oldRate,uint256 newRate,uint256 timestamp,uint256 totalStaked)"
    //   ),
    //   onLogs: async (logs) => {
    //     console.log("Event:", logs[0]); // "RewardRateUpdated"
    //     setUserInfo((prev)=>({
    //       ...prev, stakedAmount: logs[0].args.newRate
    //     }))
    //   },
    // });

    const unwatchRewardsClaimed = publicClient.watchEvent({
      address: import.meta.env.VITE_STAKING_CONTRACT,
      event: parseAbiItem(
        "event RewardsClaimed(address indexed user,uint256 amount,uint256 timestamp,uint256 newPendingRewards,uint256 totalStaked)"
      ),
      onLogs: async (logs) => {
        
        setUserInfo((prev) => ({
          ...prev,
          pendingRewards: logs[0].args.newPendingRewards,
        }));
      },
    });

    return () => {
      unwatchStaked();
      unwatchWithdrawn();
      unwatchEmergency();
      unwatchRewardsClaimed();
    };
  }, [publicClient, walletClient.data?.account.address]);
  return useMemo(() => userInfo, [userInfo]);
}

export default useUserInfo;
