import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Safe import of permissions service
let permissionManager: any;
try {
  const permissionsModule = await import('../services/permissions');
  permissionManager = permissionsModule.permissionManager;
} catch (error) {
  console.warn('⚠️ Permission manager not available:', error);
  permissionManager = {
    getUserPermissions: () => [],
    requestPermission: () => Promise.resolve({ success: false, error: 'Permissions unavailable' }),
    revokePermission: () => Promise.resolve(false)
  };
}

import { 
  PermissionMetadata, 
  PermissionRequestParams, 
  PermissionRequestResult,
  PermissionStatus 
} from '../types/permissions';

// Extend the Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

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
  
  // Permission management
  permissions: Record<string, PermissionMetadata>;
  isRequestingPermission: boolean;
  requestPermission: (params: PermissionRequestParams) => Promise<PermissionRequestResult>;
  revokePermission: (permissionId: string) => Promise<boolean>;
  getUserPermissions: () => PermissionMetadata[];
  checkPermissionStatus: (permissionId: string) => PermissionStatus;
  refreshPermissions: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [rawAddress, setRawAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState('0.00');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isWeb3Available, setIsWeb3Available] = useState(false);
  
  // Permission management state
  const [permissions, setPermissions] = useState<Record<string, PermissionMetadata>>({});
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  // Safe Web3 availability check
  const checkWeb3Availability = useCallback(() => {
    try {
      if (typeof window === 'undefined') {
        console.log('🌐 Window not available (SSR)');
        return false;
      }
      
      const hasEthereum = typeof window.ethereum !== 'undefined';
      console.log('🔍 Web3 Check:', { hasEthereum, ethereum: !!window.ethereum });
      
      setIsWeb3Available(hasEthereum);
      return hasEthereum;
    } catch (err) {
      console.error('❌ Web3 availability check failed:', err);
      setIsWeb3Available(false);
      return false;
    }
  }, []);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = useCallback(() => {
    try {
      if (typeof window === 'undefined') return false;
      return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
    } catch {
      return false;
    }
  }, []);

  // Format address for display
  const formatAddress = useCallback((addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }, []);

  // Safe balance fetching with ethers v6
  const getBalance = useCallback(async (address: string) => {
    try {
      if (!isWeb3Available || !window.ethereum) {
        console.warn('⚠️ Web3 not available for balance fetch');
        return '0.0000';
      }
      
      // Use ethers v6 BrowserProvider
      const { BrowserProvider } = await import('ethers');
      const provider = new BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      const ethBalance = Number(balance) / Math.pow(10, 18);
      return ethBalance.toFixed(4);
    } catch (error) {
      console.error('❌ Error getting balance:', error);
      return '0.0000';
    }
  }, [isWeb3Available]);

  // Safe wallet connection
  const connectWallet = useCallback(async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Check Web3 availability first
      if (!checkWeb3Availability()) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }
      
      if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask is not available or not properly installed.');
      }
      
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found. Please make sure MetaMask is unlocked.');
      }
      
      const account = accounts[0];
      const formattedAddress = formatAddress(account);
      const accountBalance = await getBalance(account);
      
      setAddress(formattedAddress);
      setRawAddress(account);
      setBalance(accountBalance);
      setIsConnected(true);
      
      // Store connection state
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAddress', account);
      }
      
      console.log('✅ Wallet connected:', { account: formattedAddress, balance: accountBalance });
    } catch (error: any) {
      console.error('❌ Wallet connection failed:', error);
      setError(error.message || 'Failed to connect wallet');
      setIsConnected(false);
      setAddress(null);
      setRawAddress(null);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, checkWeb3Availability, isMetaMaskInstalled, getBalance, formatAddress]);

  // Safe wallet disconnection
  const disconnectWallet = useCallback(() => {
    try {
      setIsConnected(false);
      setAddress(null);
      setRawAddress(null);
      setBalance('0.00');
      setError(null);
      setPermissions({});
      
      // Clear localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('walletAddress');
      }
      
      console.log('🔌 Wallet disconnected');
    } catch (error) {
      console.error('❌ Error during wallet disconnection:', error);
    }
  }, []);

  // Load user permissions from storage
  const loadUserPermissions = useCallback((userAddress: string) => {
    try {
      if (!permissionManager) return;
      const userPermissions = permissionManager.getUserPermissions(userAddress);
      const permissionMap: Record<string, PermissionMetadata> = {};
      userPermissions.forEach((permission: PermissionMetadata) => {
        permissionMap[permission.id] = permission;
      });
      setPermissions(permissionMap);
    } catch (error) {
      console.error('❌ Failed to load user permissions:', error);
    }
  }, []);

  // Request a new permission
  const requestPermission = useCallback(async (params: PermissionRequestParams): Promise<PermissionRequestResult> => {
    if (!rawAddress) {
      return {
        success: false,
        error: 'Wallet not connected'
      };
    }

    if (!permissionManager) {
      return {
        success: false,
        error: 'Permission manager not available'
      };
    }

    try {
      setIsRequestingPermission(true);
      const result = await permissionManager.requestPermission(params);
      
      if (result.success) {
        loadUserPermissions(rawAddress);
      }
      
      return result;
    } catch (error: any) {
      console.error('❌ Permission request failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to request permission'
      };
    } finally {
      setIsRequestingPermission(false);
    }
  }, [rawAddress, loadUserPermissions]);

  // Revoke a permission
  const revokePermission = useCallback(async (permissionId: string): Promise<boolean> => {
    if (!permissionManager) return false;
    
    try {
      const success = await permissionManager.revokePermission(permissionId);
      if (success && rawAddress) {
        loadUserPermissions(rawAddress);
      }
      return success;
    } catch (error) {
      console.error('❌ Failed to revoke permission:', error);
      return false;
    }
  }, [rawAddress, loadUserPermissions]);

  // Get user permissions
  const getUserPermissions = useCallback((): PermissionMetadata[] => {
    return Object.values(permissions);
  }, [permissions]);

  // Check permission status
  const checkPermissionStatus = useCallback((permissionId: string): PermissionStatus => {
    const permission = permissions[permissionId];
    if (!permission) return 'denied';
    
    const now = Date.now() / 1000;
    if (permission.endTime < now) return 'expired';
    if (permission.status === 'revoked') return 'revoked';
    if (BigInt(permission.spentAmount) >= BigInt(permission.totalAllowance)) return 'exhausted';
    
    return permission.status;
  }, [permissions]);

  // Refresh permissions
  const refreshPermissions = useCallback(() => {
    if (rawAddress) {
      loadUserPermissions(rawAddress);
    }
  }, [rawAddress, loadUserPermissions]);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      try {
        console.log('🚀 Initializing WalletContext...');
        
        // Check Web3 availability
        const web3Available = checkWeb3Availability();
        
        // Try to restore previous connection
        if (web3Available && typeof localStorage !== 'undefined') {
          const wasConnected = localStorage.getItem('walletConnected') === 'true';
          const savedAddress = localStorage.getItem('walletAddress');
          
          if (wasConnected && savedAddress) {
            console.log('🔄 Attempting to restore wallet connection...');
            try {
              const accounts = await window.ethereum.request({ method: 'eth_accounts' });
              if (accounts.includes(savedAddress)) {
                const formattedAddress = formatAddress(savedAddress);
                const accountBalance = await getBalance(savedAddress);
                
                setAddress(formattedAddress);
                setRawAddress(savedAddress);
                setBalance(accountBalance);
                setIsConnected(true);
                loadUserPermissions(savedAddress);
                
                console.log('✅ Wallet connection restored');
              }
            } catch (error) {
              console.warn('⚠️ Failed to restore wallet connection:', error);
              localStorage.removeItem('walletConnected');
              localStorage.removeItem('walletAddress');
            }
          }
        }
        
        console.log('✅ WalletContext initialized');
      } catch (error) {
        console.error('❌ WalletContext initialization failed:', error);
      }
    };

    init();
  }, [checkWeb3Availability, formatAddress, getBalance, loadUserPermissions]);

  // Listen for account changes
  useEffect(() => {
    if (isWeb3Available && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log('🔄 Account changed:', accounts);
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          const newAccount = accounts[0];
          if (newAccount !== rawAddress) {
            setRawAddress(newAccount);
            setAddress(formatAddress(newAccount));
            getBalance(newAccount).then(setBalance);
            loadUserPermissions(newAccount);
          }
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, [isWeb3Available, rawAddress, disconnectWallet, formatAddress, getBalance, loadUserPermissions]);

  const contextValue: WalletContextType = {
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
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};