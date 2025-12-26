import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import { Wallet, LogOut, Bell, RefreshCw } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';

const getPageTitle = (pathname: string) => {
  switch (pathname) {
    case '/':
      return 'Home';
    case '/dashboard':
      return 'Dashboard';
    case '/create-plan':
      return 'Create Plan';
    case '/rebalancer':
      return 'Rebalancer';
    case '/delegation':
      return 'Delegation';
    case '/settings':
      return 'Settings';
    default:
      return 'Home';
  }
};

export const Header = () => {
  const { isConnected, address, balance, connectWallet, disconnectWallet, refreshBalance, isLoading } = useWallet();
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    try {
      await refreshBalance();
    } catch (error) {
      console.error('Error refreshing balance:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications - only show when wallet is connected */}
          {isConnected && (
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center text-primary-foreground">
                3
              </span>
            </Button>
          )}

          {/* Wallet Connection */}
          {isConnected ? (
            <div className="flex items-center gap-3">
              <div className="glass-card px-4 py-2 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Balance</p>
                  <p className="text-sm font-medium">{balance} ETH</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefreshBalance}
                  disabled={isRefreshing}
                  className="h-6 w-6"
                >
                  <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
                <div className="h-8 w-px bg-border" />
                <p className="text-sm font-mono">{address}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={disconnectWallet}>
                <LogOut className="h-4 w-4" />
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
  );
};
