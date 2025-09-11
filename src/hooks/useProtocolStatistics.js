import React, { useEffect, useMemo, useState } from "react";
import { usePublicClient } from "wagmi";
import { STAKING_CONTRACT_ABI } from "../config/ABI";
import { parseAbiItem } from "viem";

function useProtocolStats() {
  const publicClient = usePublicClient();
  const [protocolStats, setProtocolStats] = useState();

  useEffect(() => {
    if (!publicClient) return;

    const fetchStats = async () => {
      const [
        totalStaked,
        totalRewards,
        currentRewardRate,
        currentAPR,
        aprReductionPerThousand,
        minLockDuration,
      ] = await Promise.all([
        publicClient.readContract({
          address: import.meta.env.VITE_STAKING_CONTRACT,
          abi: STAKING_CONTRACT_ABI,
          functionName: "totalStaked",
        }),
        publicClient.readContract({
          address: import.meta.env.VITE_STAKING_CONTRACT,
          abi: STAKING_CONTRACT_ABI,
          functionName: "getTotalRewards",
        }),
        publicClient.readContract({
          address: import.meta.env.VITE_STAKING_CONTRACT,
          abi: STAKING_CONTRACT_ABI,
          functionName: "currentRewardRate",
        }),
        publicClient.readContract({
          address: import.meta.env.VITE_STAKING_CONTRACT,
          abi: STAKING_CONTRACT_ABI,
          functionName: "initialApr",
        }),
        publicClient.readContract({
          address: import.meta.env.VITE_STAKING_CONTRACT,
          abi: STAKING_CONTRACT_ABI,
          functionName: "aprReductionPerThousand",
        }),
        publicClient.readContract({
          address: import.meta.env.VITE_STAKING_CONTRACT,
          abi: STAKING_CONTRACT_ABI,
          functionName: "minLockDuration",
        }),
      ]);

      setProtocolStats({
        totalStaked,
        totalRewards,
        currentRewardRate,
        currentAPR,
        aprReductionPerThousand,
        minLockDuration,
      });
    };

    fetchStats();

    const unwatchStaked = publicClient.watchEvent({
      address: import.meta.env.VITE_STAKING_CONTRACT,
      event: parseAbiItem(
        "event Staked(address indexed user,uint256 amount,uint256 timestamp,uint256 newTotalStaked,uint256 currentRewardRate)"
      ),
      onLogs: async (logs) => {
        setProtocolStats((prev) => ({
          ...prev,
          totalStaked: logs[0].args.newTotalStaked,
        }));
      },
    });

    const unwatchWithdrawn = publicClient.watchEvent({
      address: import.meta.env.VITE_STAKING_CONTRACT,
      event: parseAbiItem(
        "event Withdrawn(address indexed user,uint256 amount,uint256 timestamp,uint256 newTotalStaked,uint256 currentRewardRate,uint256 rewardsAccrued)"
      ),
      onLogs: async (logs) => {
        // await fetchStats();
        setProtocolStats((prev) => ({
          ...prev,
          totalStaked: logs[0].args.newTotalStaked,
          totalRewards: prev.totalRewards - logs[0].args.rewardsAccrued,
        }));
      },
    });

    const unwatchEmergency = publicClient.watchEvent({
      address: import.meta.env.VITE_STAKING_CONTRACT,
      event: parseAbiItem(
        "event EmergencyWithdrawn(address indexed user,uint256 amount,uint256 penalty,uint256 timestamp,uint256 newTotalStaked)"
      ),
      onLogs: async (logs) => {
        // await fetchStats();
        setProtocolStats((prev) => ({
          ...prev,
          totalStaked: logs[0].args.newTotalStaked,
        }));
      },
    });

    const unwatchRewardsClaimed = publicClient.watchEvent({
      address: import.meta.env.VITE_STAKING_CONTRACT,
      event: parseAbiItem(
        "event RewardsClaimed(address indexed user,uint256 amount,uint256 timestamp,uint256 newPendingRewards,uint256 totalStaked)"
      ),
      onLogs: async (logs) => {
        // console.log("reward claimed")
        setProtocolStats((prev) => ({
          ...prev,
          totalRewards: prev.totalRewards - logs[0].args.amount,
        }));
      },
    });

    return () => {
      unwatchStaked();
      unwatchWithdrawn();
      unwatchEmergency();
      unwatchRewardsClaimed();
    };
  }, [protocolStats, publicClient]);

  return useMemo(() => protocolStats, [protocolStats]);
}

export default useProtocolStats;
