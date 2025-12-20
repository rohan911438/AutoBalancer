import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Temporary fix - creating a minimal wallet context to fix the syntax errors
interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  rawAddress: string | null;
  balance: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isLoading: boolean;
  error: string | null;
  isWeb3Available: boolean;
  permissions: Record<string, any>;
  isRequestingPermission: boolean;
  requestPermission: (params: any) => Promise<any>;
  revokePermission: (permissionId: string) => Promise<boolean>;
  getUserPermissions: () => any[];
  checkPermissionStatus: (permissionId: string) => string;
  refreshPermissions: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [rawAddress, setRawAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState('0.00');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWeb3Available, setIsWeb3Available] = useState(false);
  const [permissions, setPermissions] = useState<Record<string, any>>({});
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  // Check Web3 availability safely
  const checkWeb3Availability = useCallback(() => {
    try {
      const hasEthereum = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
      setIsWeb3Available(hasEthereum);
      return hasEthereum;
    } catch (err) {
      setIsWeb3Available(false);
      return false;
    }
  }, []);

  // Format address for display  
  const formatAddress = useCallback((addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }, []);

  // Connect wallet function
  const connectWallet = useCallback(async () => {
    console.log('🔌 Starting wallet connection...');
    
    if (!checkWeb3Availability()) {
      alert('MetaMask is required to connect your wallet.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      if (!window.ethereum) {
        throw new Error('Ethereum provider not found');
      }

      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        
        setIsConnected(true);
        setAddress(formatAddress(account));
        setRawAddress(account);
        setBalance('0.0000');
        
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAddress', account);
        
        console.log('✅ Wallet connected successfully!');
      }
    } catch (error: any) {
      console.error('❌ Error connecting wallet:', error);
      setError('Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  }, [checkWeb3Availability, formatAddress]);

  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setAddress(null);
    setRawAddress(null);
    setBalance('0.00');
    setPermissions({});
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
  }, []);

  // Stub functions for permissions
  const requestPermission = useCallback(async (params: any) => {
    return { success: false, error: 'Permissions not implemented yet' };
  }, []);

  const revokePermission = useCallback(async (permissionId: string) => {
    return false;
  }, []);

  const getUserPermissions = useCallback(() => {
    return [];
  }, []);

  const checkPermissionStatus = useCallback((permissionId: string) => {
    return 'revoked';
  }, []);

  const refreshPermissions = useCallback(() => {
    // No-op for now
  }, []);

  // Check for existing connection on load
  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (!checkWeb3Availability()) return;
        
        const wasConnected = localStorage.getItem('walletConnected');
        if (!wasConnected || !window.ethereum) return;

        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        
        if (accounts && accounts.length > 0) {
          const account = accounts[0];
          setIsConnected(true);
          setAddress(formatAddress(account));
          setRawAddress(account);
          setBalance('0.0000');
        } else {
          localStorage.removeItem('walletConnected');
          localStorage.removeItem('walletAddress');
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    };

    checkConnection();
  }, [checkWeb3Availability, formatAddress]);

  return (
    <WalletContext.Provider value={{
      isConnected,
      address,
      rawAddress,
      balance,
      connectWallet,
      disconnectWallet,
      isLoading,
      error,
      isWeb3Available,
      permissions,
      isRequestingPermission,
      requestPermission,
      revokePermission,
      getUserPermissions,
      checkPermissionStatus,
      refreshPermissions
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};