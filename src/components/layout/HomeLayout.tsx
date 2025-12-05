import { Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { Wallet, Zap } from 'lucide-react';

export const HomeLayout = () => {
  const { isConnected, address, balance, connectWallet, disconnectWallet, isLoading } = useWallet();

  return (
    <div className="min-h-screen bg-background">
      {/* Home Header */}
      <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex h-full items-center justify-between px-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold gradient-text">AutoBalancer</span>
          </div>

          <div className="flex items-center gap-4">
            {isConnected ? (
              <div className="flex items-center gap-3">
                <div className="glass-card px-4 py-2 flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Balance</p>
                    <p className="text-sm font-medium">{balance} ETH</p>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <p className="text-sm font-mono">{address}</p>
                </div>
                <Button variant="outline" size="sm" onClick={disconnectWallet}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button 
                variant="gradient" 
                onClick={connectWallet}
                disabled={isLoading}
              >
                <Wallet className="h-4 w-4" />
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
};