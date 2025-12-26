import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, RefreshCw, Network, Wallet, Copy } from "lucide-react";
import { useState } from "react";

export const WalletStatus = () => {
  const { isConnected, address, rawAddress, balance, networkId, refreshBalance } = useWallet();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshBalance();
    } finally {
      setIsRefreshing(false);
    }
  };

  const copyToClipboard = async () => {
    if (rawAddress) {
      await navigator.clipboard.writeText(rawAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const switchToSepolia = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia
      });
      
      // Refresh after switching
      setTimeout(handleRefresh, 1000);
    } catch (error: any) {
      if (error.code === 4902) {
        // Add Sepolia network
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia Testnet',
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            }],
          });
        } catch (addError) {
          console.error('Failed to add Sepolia:', addError);
        }
      }
    }
  };

  const isOnSepolia = networkId === 11155111;
  const hasBalance = parseFloat(balance) > 0;

  if (!isConnected) {
    return (
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-full">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-800">Wallet Not Connected</p>
              <p className="text-sm text-amber-600">Connect your MetaMask to continue</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const cardStyle = isOnSepolia && hasBalance 
    ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 shadow-sm'
    : isOnSepolia 
    ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm'
    : 'border-red-200 bg-gradient-to-br from-red-50 to-rose-50 shadow-sm';

  const statusIcon = isOnSepolia && hasBalance 
    ? <CheckCircle className="h-5 w-5 text-emerald-600" />
    : isOnSepolia 
    ? <Network className="h-5 w-5 text-blue-600" />
    : <AlertCircle className="h-5 w-5 text-red-600" />;

  return (
    <Card className={cardStyle}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              isOnSepolia && hasBalance 
                ? 'bg-emerald-100' 
                : isOnSepolia 
                ? 'bg-blue-100' 
                : 'bg-red-100'
            }`}>
              <Wallet className={`h-5 w-5 ${
                isOnSepolia && hasBalance 
                  ? 'text-emerald-600' 
                  : isOnSepolia 
                  ? 'text-blue-600' 
                  : 'text-red-600'
              }`} />
            </div>
            <span className={`text-lg ${
              isOnSepolia && hasBalance 
                ? 'text-emerald-800' 
                : isOnSepolia 
                ? 'text-blue-800' 
                : 'text-red-800'
            }`}>
              Wallet Status
            </span>
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge 
              variant={isOnSepolia ? "default" : "destructive"}
              className={isOnSepolia ? "bg-emerald-100 text-emerald-800 border-emerald-300" : ""}
            >
              {isOnSepolia ? 'Sepolia' : `Network ${networkId}`}
            </Badge>
            {statusIcon}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Address Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">Address</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-6 px-2 text-xs"
            >
              {copied ? 'Copied!' : <Copy className="h-3 w-3" />}
            </Button>
          </div>
          <div className={`p-3 rounded-lg border ${
            isOnSepolia && hasBalance 
              ? 'bg-emerald-50 border-emerald-200' 
              : isOnSepolia 
              ? 'bg-blue-50 border-blue-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <p className="font-mono text-sm break-all text-gray-800">{rawAddress}</p>
          </div>
        </div>
        
        {/* Balance Section */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">Balance</p>
          <div className={`p-4 rounded-lg border ${
            isOnSepolia && hasBalance 
              ? 'bg-emerald-50 border-emerald-200' 
              : isOnSepolia 
              ? 'bg-blue-50 border-blue-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${
                isOnSepolia && hasBalance 
                  ? 'text-emerald-700' 
                  : isOnSepolia 
                  ? 'text-blue-700' 
                  : 'text-gray-700'
              }`}>
                {balance}
              </span>
              <span className={`text-lg font-semibold ${
                isOnSepolia && hasBalance 
                  ? 'text-emerald-600' 
                  : isOnSepolia 
                  ? 'text-blue-600' 
                  : 'text-gray-600'
              }`}>
                ETH
              </span>
            </div>
          </div>
        </div>

        {/* Network Section */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">Network</p>
          <div className={`p-3 rounded-lg border flex items-center gap-2 ${
            isOnSepolia 
              ? 'bg-emerald-50 border-emerald-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <span className={`text-sm font-medium ${
              isOnSepolia ? 'text-emerald-700' : 'text-red-700'
            }`}>
              {isOnSepolia ? 'Sepolia Testnet' : `Chain ID: ${networkId}`}
            </span>
            <span className="text-lg">
              {isOnSepolia ? '✅' : '⚠️'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {!isOnSepolia && (
            <Button 
              onClick={switchToSepolia} 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Network className="h-4 w-4 mr-2" />
              Switch to Sepolia
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            size="sm"
            className={`border-2 ${
              isOnSepolia 
                ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50' 
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Faucet Link for Zero Balance */}
        {isOnSepolia && !hasBalance && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-full mt-0.5">
                <AlertCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">Need Test ETH?</p>
                <p className="text-sm text-blue-700 mb-2">
                  Your Sepolia balance is 0 ETH. Get free test tokens from:
                </p>
                <a 
                  href="https://sepoliafaucet.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 underline"
                >
                  Sepolia Faucet →
                </a>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};