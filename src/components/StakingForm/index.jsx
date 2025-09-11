import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useStake from "../../hooks/useStake";
import { toast } from "sonner";
import { useState } from "react";
import { formatEther } from "viem";

export function StakingForm() {
  const { stake, approve, allowance, status, isApproving, isStaking } =
    useStake();
  const [amount, setAmount] = useState("");

  const handleStake = () => {
    if (status !== "success") {
      toast.error("Wallet not Connected");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    stake(amount);
    setAmount("")
  };

  const handleApprove = () => {
    if (status !== "success") {
      toast.error("Wallet not Connected");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    approve(amount);
  };


  return (
    <div className="bg-white rounded-xl shadow p-4 sm:p-6 space-y-4">
      <h2 className="text-base sm:text-lg font-semibold">Stake Tokens</h2>
      <p className="text-xs sm:text-sm text-gray-500">
        Enter the amount you want to stake.
      </p>

      <p className="text-xs sm:text-sm text-gray-600">
  {BigInt(allowance || 0) > 0n ? (
    <>
      You can stake up to{" "}
      <span className="font-medium text-amber-600">
        {formatEther(BigInt(allowance))} STT
      </span>
    </>
  ) : (
    <span className="text-red-500">
      You need to approve more tokens before staking.
    </span>
  )}
</p>


      <div className="hidden sm:flex items-center gap-2">
        <Input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        {allowance <= 0 &&(<Button
          variant="outline"
          className="border-blue-400 text-blue-600 whitespace-nowrap"
          onClick={handleApprove}
          disabled={isApproving}
        >
          {isApproving ? "Approving..." : "Approve"}
        </Button>)}
        <Button
          className="bg-amber-600 hover:bg-amber-700 text-white whitespace-nowrap"
          onClick={handleStake}
          disabled={allowance <= 0 || isStaking}
        >
          {isStaking ? "Staking..." : "Stake"}
        </Button>
      </div>

      {/* Mobile Layout */}
      <div className="sm:hidden space-y-3">
        <Input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full"
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-blue-400 text-blue-600 flex-1 text-sm"
            onClick={handleApprove}
            disabled={isApproving}
          >
            {isApproving ? "Approving..." : "Approve"}
          </Button>
          <Button
            className="bg-amber-600 hover:bg-amber-700 text-white flex-1 text-sm"
            onClick={handleStake}
            disabled={allowance <= 0 || isStaking}
          >
            {isStaking ? "Staking..." : "Stake"}
          </Button>
        </div>
      </div>
    </div>
  );
}
