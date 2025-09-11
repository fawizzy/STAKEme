import { toast, Toaster } from "sonner";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import useMint from "../../hooks/useMint";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { useEffect, useState } from "react";
import useAccountBalance from "../../hooks/useBalance";

const AppLayout = ({ children }) => {
  const [amount, setAmount] = useState();
  const balance = useAccountBalance();
  const { mint, status } = useMint();
  
  
  const handleMint = () => {
    if (status !== "success") {
      toast.error("Wallet not Connected");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    mint(amount);
  };

  useEffect(() => {
    if (!status) return;
  }, [status]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Desktop Layout */}
          <div className="hidden lg:flex justify-between items-center h-24">
            <span className="text-2xl font-bold text-amber-600">STAKEnow</span>
            <div className="flex items-center gap-4">
              <CardContent className="items-center gap-2">
                <div className="text-gray-600 text-sm">Balance:</div>
                <div className="font-semibold text-amber-600">{Math.floor(balance)} STT</div>
              </CardContent>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  className="w-28"
                  value={amount}
                  onChange={(e) => {setAmount(e.target.value)}}
                />
                <Button
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={handleMint}
                >
                  Mint
                </Button>
              </div>
              <ConnectButton />
            </div>
          </div>

          {/* Mobile/Tablet Layout */}
          <div className="lg:hidden py-4">
            {/* First row: Logo and Connect Button */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl sm:text-2xl font-bold text-amber-600">STAKEnow</span>
              <ConnectButton />
            </div>
            
            {/* Second row: Balance and Mint controls */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <div className="flex items-center justify-center sm:justify-start">
                <CardContent className="flex items-center gap-2 p-2 sm:p-3">
                  <div className="text-gray-600 text-sm">Balance:</div>
                  <div className="font-semibold text-amber-600">{Math.floor(balance)} STT</div>
                </CardContent>
              </div>
              
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  className="w-24 sm:w-28"
                  value={amount}
                  onChange={(e) => {setAmount(e.target.value)}}
                />
                <Button
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={handleMint}
                >
                  Mint
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full py-4 sm:py-6 lg:py-8">
        <div className="container mx-auto grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 px-4 sm:px-6">
          {children}
        </div>
      </main>

      <footer className="h-12 sm:h-16 bg-white border-t">
        <div className="container mx-auto flex items-center justify-center h-full text-xs sm:text-sm text-gray-500 px-4">
          &copy; STAKEnow {new Date().getFullYear()}
        </div>
      </footer>

      <Toaster position="top-right" />
    </div>
  );
};

export default AppLayout;