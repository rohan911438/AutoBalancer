import React from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export const BalanceDebugger: React.FC = () => {
  const { isConnected, rawAddress, balance, refreshBalance } = useWallet();
  
  const handleDebugBalance = async () => {
    console.log('🔍 Debug: Current state:', {
      isConnected,
      rawAddress,
      balance,
      hasEthereum: !!window.ethereum
    });
    
    if (rawAddress && window.ethereum) {
      try {
        console.log('🔍 Debug: Testing direct balance fetch...');
        
        // Test direct ethers balance fetch
        const { ethers } = await import('ethers');
        const provider = new ethers.BrowserProvider(window.ethereum);
        const rawBalance = await provider.getBalance(rawAddress);
        const ethBalance = ethers.formatEther(rawBalance);
        
        console.log('🔍 Debug: Direct fetch results:', {
          rawBalance: rawBalance.toString(),
          ethBalance,
          formatted: parseFloat(ethBalance).toFixed(4)
        });
        
        // Test network
        const network = await provider.getNetwork();
        console.log('🔍 Debug: Network info:', {
          name: network.name,
          chainId: network.chainId.toString()
        });
        
      } catch (error) {
        console.error('🔍 Debug: Direct fetch failed:', error);
      }
    }
    
    // Also try refresh
    await refreshBalance();
  };
  
  if (!isConnected) {
    return null;
  }
  
  return (
    <div className="glass-card p-4 border-2 border-orange-500/50">
      <h3 className="text-lg font-semibold mb-2 text-orange-600">Balance Debugger</h3>
      <div className="space-y-2 text-sm">
        <div><strong>Connected:</strong> {isConnected ? '✅' : '❌'}</div>
        <div><strong>Address:</strong> {rawAddress || 'None'}</div>
        <div><strong>Current Balance:</strong> {balance}</div>
        <div><strong>MetaMask:</strong> {window.ethereum ? '✅' : '❌'}</div>
      </div>
      <Button 
        onClick={handleDebugBalance} 
        className="mt-3" 
        variant="outline"
        size="sm"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Debug Balance
      </Button>
    </div>
  );
};