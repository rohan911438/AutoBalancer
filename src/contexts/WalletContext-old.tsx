import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { PermissionStatus } from '../types/permissions';
import { agentContract } from '../contracts/agentContract';
import { ethers } from 'ethers';

// Temporary fix - creating a minimal wallet context to fix the syntax errors
interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  rawAddress: string | null;
  balance: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isWeb3Available: boolean;
  permissions: Record<string, any>;
  isRequestingPermission: boolean;
  requestPermission: (params: any) => Promise<any>;
  revokePermission: (permissionId: string) => Promise<boolean>;
  getUserPermissions: () => any[];
  checkPermissionStatus: (permissionId: string) => PermissionStatus;
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
  const [currentNetwork, setCurrentNetwork] = useState<string>('');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  // Sepolia network configuration
  const SEPOLIA_NETWORK = {
    chainId: '0xaa36a7', // 11155111 in hex
    chainName: 'Sepolia test network',
    rpcUrls: ['https://sepolia.infura.io/v3/'],
    nativeCurrency: {
      name: 'SepoliaETH',
      symbol: 'SEP',
      decimals: 18,
    },
    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
  };

  // Check and switch to Sepolia network
  const switchToSepolia = useCallback(async () => {
    try {
      if (!window.ethereum) return false;

      console.log('🔄 Switching to Sepolia network...');

      try {
        // Try to switch to Sepolia
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SEPOLIA_NETWORK.chainId }],
        });
        console.log('✅ Switched to Sepolia network');
        return true;
      } catch (switchError: any) {
        // If Sepolia is not added to MetaMask, add it
        if (switchError.code === 4902) {
          console.log('➕ Adding Sepolia network to MetaMask...');
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [SEPOLIA_NETWORK],
            });
            console.log('✅ Sepolia network added and switched');
            return true;
          } catch (addError) {
            console.error('❌ Failed to add Sepolia network:', addError);
            return false;
          }
        }
        console.error('❌ Failed to switch to Sepolia:', switchError);
        return false;
      }
    } catch (error) {
      console.error('❌ Error in switchToSepolia:', error);
      return false;
    }
  }, []);

  // Check current network
  const checkNetwork = useCallback(async () => {
    try {
      if (!window.ethereum) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const chainId = network.chainId.toString();
      
      console.log('🔍 Current network:', { chainId, name: network.name });
      setCurrentNetwork(network.name || `Chain ${chainId}`);
      
      const isSepolia = chainId === '11155111';
      setIsCorrectNetwork(isSepolia);
      
  // Check if we're on Sepolia network
  const checkNetwork = useCallback(async (): Promise<boolean> => {
    try {
      if (!window.ethereum) return false;
      
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const chainIdNumber = parseInt(chainId, 16);
      const isSepolia = chainIdNumber === 11155111;
      
      console.log('🔍 Network check - Chain ID:', chainIdNumber, 'Is Sepolia:', isSepolia);
      setNetworkId(chainIdNumber);
      
      if (!isSepolia) {
        console.warn('⚠️ Not on Sepolia network. Current chain:', chainId);
      }
      
      return isSepolia;
    } catch (error) {
      console.error('❌ Error checking network:', error);
      return false;
    }
  }, []);

  // Switch to Sepolia network
  const switchToSepolia = useCallback(async (): Promise<boolean> => {
    try {
      if (!window.ethereum) return false;
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chainId
      });
      
      return true;
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
          return true;
        } catch (addError) {
          console.error('Failed to add Sepolia network:', addError);
          return false;
        }
      } else {
        console.error('Failed to switch to Sepolia network:', error);
        return false;
      }
    }
  }, []);

  // Check Web3 availability
  const checkWeb3Availability = useCallback((): boolean => {
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

  // Fetch wallet balance
  const fetchBalance = useCallback(async (address: string) => {
    try {
      console.log('🔍 Fetching balance for:', address);
      
      if (!window.ethereum) {
        console.warn('⚠️  No ethereum provider found');
        return '0.0000';
      }

      // Check network first
      const isOnSepolia = await checkNetwork();
      if (!isOnSepolia) {
        console.warn('⚠️  Not on Sepolia network, balance fetch may fail');
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      console.log('📡 Provider created, fetching balance...');
      
      const balance = await provider.getBalance(address);
      console.log('💰 Raw balance:', balance.toString());
      
      const ethBalance = ethers.formatEther(balance);
      console.log('💰 Formatted balance:', ethBalance);
      
      // Format to 6 decimal places for better precision
      const formattedBalance = parseFloat(ethBalance).toFixed(6);
      console.log('💰 Final formatted balance:', formattedBalance);
      
      return formattedBalance;
    } catch (error) {
      console.error('❌ Error fetching balance:', error);
      return '0.0000';
    }
  }, [checkNetwork]);

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

      // Request account access
      console.log('🔐 Requesting account access...');
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        console.log('✅ Account connected:', account);

        // Check network and prompt to switch if needed
        const isOnSepolia = await checkNetwork();
        if (!isOnSepolia) {
          const userWantsToSwitch = confirm(
            'You are not connected to Sepolia testnet. Would you like to switch to Sepolia to see your balance and use the app?'
          );
          
          if (userWantsToSwitch) {
            const switched = await switchToSepolia();
            if (!switched) {
              throw new Error('Failed to switch to Sepolia network');
            }
          } else {
            console.warn('⚠️ User chose to stay on current network');
          }
        }
        
        setIsConnected(true);
        setAddress(formatAddress(account));
        setRawAddress(account);
        
        // Set temporary loading balance
        setBalance('Loading...');
        
        // Fetch real balance with retry logic
        console.log('💰 Fetching wallet balance...');
        try {
          const walletBalance = await fetchBalance(account);
          console.log('✅ Balance fetched successfully:', walletBalance);
          setBalance(walletBalance);
        } catch (balanceError) {
          console.error('❌ Failed to fetch balance, retrying...', balanceError);
          // Retry once after a short delay
          setTimeout(async () => {
            try {
              const retryBalance = await fetchBalance(account);
              setBalance(retryBalance);
            } catch (retryError) {
              console.error('❌ Balance fetch retry failed:', retryError);
              setBalance('Error');
            }
          }, 2000);
        }
        
        // Initialize contract with provider
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          await agentContract.initialize(provider);
          console.log('✅ Contract initialized successfully');
        } catch (contractError) {
          console.warn('⚠️ Contract initialization failed:', contractError);
        }
        
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAddress', account);
        
        console.log('🎉 Wallet connected successfully!', {
          address: formatAddress(account),
          rawAddress: account
        });
      }
    } catch (error: any) {
      console.error('❌ Error connecting wallet:', error);
      setError('Failed to connect wallet: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [checkWeb3Availability, formatAddress, fetchBalance, checkNetwork, switchToSepolia]);

  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setAddress(null);
    setRawAddress(null);
    setBalance('0.00');
    setPermissions({});
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
  }, []);

  // Refresh balance function
  const refreshBalance = useCallback(async () => {
    if (!rawAddress) {
      console.warn('⚠️  No address available for balance refresh');
      return;
    }
    
    console.log('🔄 Refreshing balance for:', rawAddress);
    setBalance('Loading...');
    
    try {
      const newBalance = await fetchBalance(rawAddress);
      setBalance(newBalance);
      console.log('✅ Balance refreshed successfully:', newBalance);
    } catch (error) {
      console.error('❌ Failed to refresh balance:', error);
      setBalance('Error');
    }
  }, [rawAddress, fetchBalance]);

  // Auto-refresh balance every 30 seconds when connected
  useEffect(() => {
    if (!isConnected || !rawAddress) return;

    const interval = setInterval(refreshBalance, 30000);
    return () => clearInterval(interval);
  }, [isConnected, rawAddress, refreshBalance]);

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

  const checkPermissionStatus = useCallback((permissionId: string): PermissionStatus => {
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
          console.log('🔄 Reconnecting to existing account:', account);
          
          setIsConnected(true);
          setAddress(formatAddress(account));
          setRawAddress(account);
          
          // Set loading state while fetching balance
          setBalance('Loading...');
          
          // Fetch real balance on reconnection
          try {
            const walletBalance = await fetchBalance(account);
            console.log('✅ Balance loaded on reconnection:', walletBalance);
            setBalance(walletBalance);
          } catch (error) {
            console.error('❌ Failed to load balance on reconnection:', error);
            setBalance('Error');
          }
        } else {
          localStorage.removeItem('walletConnected');
          localStorage.removeItem('walletAddress');
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    };

    checkConnection();
  }, [checkWeb3Availability, formatAddress, fetchBalance]);

  return (
    <WalletContext.Provider value={{
      isConnected,
      address,
      rawAddress,
      balance,
      connectWallet,
      disconnectWallet,
      refreshBalance,
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