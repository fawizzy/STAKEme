import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEther } from "viem";
import useUserInfo from "../../hooks/useUserInfo";
import { useWalletClient } from "wagmi";

function UserInfo() {
  const userInfo = useUserInfo();
  const walletClient = useWalletClient();

  if (!userInfo || !walletClient?.data?.account?.address) return null;
  
  

  const stats = [
    {
      label: "Staked Amount",
      value: `${formatEther(userInfo.stakedAmount)} STT`,
    },
    {
      label: "Pending Rewards",
      value: `${Number(formatEther(userInfo.pendingRewards)).toFixed(4)} STT`,
    },
    {
      label: "Last Stake",
      value:
        userInfo.lastStakeTimestamp && Number(userInfo.lastStakeTimestamp) !== 0
          ? new Date(
              Number(userInfo.lastStakeTimestamp) * 1000
            ).toLocaleString()
          : "Not staked yet",
    },
    {
      label: "Time Until Unlock",
      value: `${Math.floor(
        Number(userInfo.timeUntilUnlock) / (60 * 60 * 24)
      )} days`,
    },
    {
      label: "Withdrawable?",
      value: userInfo.canWithdraw ? "Yes" : "No",
      highlight: userInfo.canWithdraw ? "text-green-600" : "text-red-600",
    },
  ];


  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-6">
      <h2 className="text-lg font-semibold">Your Info</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((item, i) => (
          <Card
            key={i}
            className="rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent
              className={`text-xl font-semibold text-gray-900 ${
                item.highlight || ""
              }`}
            >
              {item.value}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default UserInfo;
