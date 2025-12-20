import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { permissionManager } from '../services/permissions';
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
  rawAddress: string | null; // Unformatted address for API calls
  balance: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isLoading: boolean;
  
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
  
  // Permission management state
  const [permissions, setPermissions] = useState<Record<string, PermissionMetadata>>({});
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Get balance from MetaMask
  const getBalance = async (address: string) => {
    try {
      if (window.ethereum) {
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        });
        // Convert from wei to ETH
        const ethBalance = parseInt(balance, 16) / Math.pow(10, 18);
        return ethBalance.toFixed(4);
      }
    } catch (error) {
      console.error('Error getting balance:', error);
    }
    return '0.0000';
  };

  // Load user permissions from storage
  const loadUserPermissions = useCallback((userAddress: string) => {
    try {
      const userPermissions = permissionManager.getUserPermissions(userAddress);
      const permissionMap: Record<string, PermissionMetadata> = {};
      userPermissions.forEach(permission => {
        permissionMap[permission.id] = permission;
      });
      setPermissions(permissionMap);
    } catch (error) {
      console.error('Failed to load user permissions:', error);
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

    setIsRequestingPermission(true);

    try {
      // Add user address to the config if not present
      if (!params.config.userAddress) {
        params.config.userAddress = rawAddress;
      }

      const result = await permissionManager.requestPermission(params);
      
      if (result.success && result.metadata) {
        // Update local state with new permission
        setPermissions(prev => ({
          ...prev,
          [result.metadata!.id]: result.metadata!
        }));
      }

      return result;
    } catch (error) {
      console.error('Permission request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Permission request failed'
      };
    } finally {
      setIsRequestingPermission(false);
    }
  }, [rawAddress]);

  // Revoke a permission
  const revokePermission = useCallback(async (permissionId: string): Promise<boolean> => {
    try {
      const success = await permissionManager.revokePermission(permissionId);
      
      if (success) {
        // Update local state
        setPermissions(prev => ({
          ...prev,
          [permissionId]: {
            ...prev[permissionId],
            status: 'revoked' as PermissionStatus
          }
        }));
      }

      return success;
    } catch (error) {
      console.error('Permission revocation failed:', error);
      return false;
    }
  }, []);

  // Get user permissions
  const getUserPermissions = useCallback((): PermissionMetadata[] => {
    return Object.values(permissions);
  }, [permissions]);

  // Check permission status
  const checkPermissionStatus = useCallback((permissionId: string): PermissionStatus => {
    const permission = permissions[permissionId];
    if (!permission) return 'denied';

    const validation = permissionManager.validatePermission(permissionId);
    if (!validation.isValid) {
      if (validation.reason?.includes('expired')) return 'expired';
      if (validation.reason?.includes('revoked')) return 'revoked';
      if (validation.reason?.includes('exhausted')) return 'exhausted';
      return 'denied';
    }

    return permission.status;
  }, [permissions]);

  // Refresh permissions from storage
  const refreshPermissions = useCallback(() => {
    if (rawAddress) {
      loadUserPermissions(rawAddress);
    }
  }, [rawAddress, loadUserPermissions]);

  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      alert('Please install MetaMask to connect your wallet!');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsLoading(true);
    
    try {
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        const account = accounts[0];
        const balance = await getBalance(account);
        
        // Notify backend about wallet connection
        try {
          const { apiService } = await import('../services/api');
          await apiService.connectWallet(account);
          console.log('✅ Backend notified of wallet connection');
        } catch (error) {
          console.warn('⚠️ Failed to notify backend of wallet connection:', error);
          // Continue with frontend connection even if backend fails
        }
        
        setIsConnected(true);
        setAddress(formatAddress(account));
        setRawAddress(account);
        setBalance(balance);
        
        // Load user permissions
        loadUserPermissions(account);
        
        // Store connection state
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAddress', account);
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        alert('Please connect to MetaMask.');
      } else {
        alert('Error connecting to MetaMask. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setAddress(null);
    setRawAddress(null);
    setBalance('0.00');
    setPermissions({});
    
    // Clear stored connection state
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
  }, []);

  // Check for existing connection on load
  useEffect(() => {
    const checkConnection = async () => {
      if (isMetaMaskInstalled() && localStorage.getItem('walletConnected')) {
        try {
          const accounts = await window.ethereum.request({ 
            method: 'eth_accounts' 
          });
          
          if (accounts.length > 0) {
            const account = accounts[0];
            const balance = await getBalance(account);
            
            setIsConnected(true);
            setAddress(formatAddress(account));
            setRawAddress(account);
            setBalance(balance);
            
            // Load user permissions
            loadUserPermissions(account);
          } else {
            // Clear stored state if no accounts
            localStorage.removeItem('walletConnected');
            localStorage.removeItem('walletAddress');
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };

    checkConnection();
  }, [loadUserPermissions]);

  // Listen for account changes
  useEffect(() => {
    if (isMetaMaskInstalled()) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          // Update to new account
          connectWallet();
        }
      };

      const handleChainChanged = () => {
        // Reload the page when chain changes
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [connectWallet, disconnectWallet]);

  return (
    <WalletContext.Provider value={{ 
      isConnected, 
      address, 
      rawAddress,
      balance, 
      connectWallet, 
      disconnectWallet, 
      isLoading,
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
