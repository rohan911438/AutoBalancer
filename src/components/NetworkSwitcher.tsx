import { AlertTriangle, Network, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useWallet } from "@/contexts/WalletContext";

export const NetworkSwitcher = () => {
  const { networkId, isConnected, connectWallet, balance } = useWallet();

  const switchToSepolia = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chainId
      });
      
      // Wait a bit for network switch, then refresh
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added, add it first
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia Testnet',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            }],
          });
        } catch (addError) {
          console.error('Failed to add Sepolia network:', addError);
        }
      } else {
        console.error('Failed to switch to Sepolia network:', error);
      }
    }
  };

  if (!isConnected) return null;

  // Check if we're on Sepolia (chainId 11155111)
  const isOnSepolia = networkId === 11155111;

  if (isOnSepolia && balance > 0) return null; // Everything is good

  return (
    <Card className="mb-4 border-orange-200 bg-orange-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-4 w-4" />
          Network Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isOnSepolia ? (
          <Alert className="mb-3 border-orange-200 bg-orange-100">
            <Network className="h-4 w-4" />
            <AlertDescription className="text-orange-800">
              Please switch to Sepolia Testnet to use AutoBalancer Pro.
              Current network: {networkId ? `Chain ID ${networkId}` : 'Unknown'}
            </AlertDescription>
          </Alert>
        ) : balance === 0 ? (
          <Alert className="mb-3 border-blue-200 bg-blue-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-blue-800">
              Your Sepolia testnet balance is 0 ETH. You may need to get test ETH from a faucet.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="flex gap-2">
          {!isOnSepolia && (
            <Button onClick={switchToSepolia} className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Switch to Sepolia
            </Button>
          )}
          <Button variant="outline" onClick={connectWallet} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Connection
          </Button>
        </div>

        <div className="mt-3 text-sm text-gray-600">
          <div>• Network ID: {networkId || 'Not detected'}</div>
          <div>• Required: Sepolia Testnet (11155111)</div>
          <div>• Balance: {balance} ETH</div>
        </div>
      </CardContent>
    </Card>
  );
};