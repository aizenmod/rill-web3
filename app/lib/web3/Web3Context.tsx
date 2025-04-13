import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { useNetwork } from './useNetwork';

interface Web3ContextType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  address: string | null;
  chainId: number | null;
  networkName: string | null;
  isTestnet: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  address: null,
  chainId: null,
  networkName: null,
  isTestnet: false,
  isConnected: false,
  isConnecting: false,
  connect: async () => {},
  disconnect: () => {},
  switchNetwork: async () => {},
});

export function useWeb3() {
  return useContext(Web3Context);
}

interface Web3ProviderProps {
  children: React.ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const processingRef = useRef(false);
  const mountedRef = useRef(true);
  
  // Using useNetwork hook to get network information
  const { network, refreshNetwork } = useNetwork(provider);

  console.log("[Web3Context] Render with state:", { 
    address, 
    chainId: network?.chainId, 
    networkName: network?.name, 
    isConnected: !!address 
  });

  const connect = useCallback(async () => {
    if (processingRef.current) {
      console.log("[Web3Context] Already processing a connection request");
      return;
    }
    
    if (typeof window.ethereum === 'undefined') {
      toast.error('MetaMask is not installed! Please install it to use this feature.');
      return;
    }

    console.log("[Web3Context] Connecting wallet");
    setIsConnecting(true);
    processingRef.current = true;

    try {
      // First, directly request accounts to trigger the MetaMask popup
      await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      // Then create a provider and get the accounts that were just approved
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send('eth_accounts', []);
      
      if (accounts.length === 0) {
        toast.error('No accounts found');
        return;
      }

      const userAddress = accounts[0];
      const userSigner = await browserProvider.getSigner();
      
      console.log("[Web3Context] Connected successfully:", userAddress);
      
      if (mountedRef.current) {
        setProvider(browserProvider);
        setSigner(userSigner);
        setAddress(userAddress);
        toast.success('Wallet connected successfully!');
      }
    } catch (error: any) {
      console.error('[Web3Context] Error connecting wallet:', error);
      
      let errorMessage = 'Failed to connect wallet';
      if (error.message?.includes('user rejected')) {
        errorMessage = 'Connection rejected by user';
      }
      
      toast.error(errorMessage);
    } finally {
      if (mountedRef.current) {
        setIsConnecting(false);
        processingRef.current = false;
      }
    }
  }, []);

  const disconnect = useCallback(() => {
    console.log("[Web3Context] Disconnecting wallet");
    setProvider(null);
    setSigner(null);
    setAddress(null);
    toast.info('Wallet disconnected');
  }, []);

  const switchNetwork = useCallback(async (chainId: number) => {
    if (processingRef.current) return;
    processingRef.current = true;
    
    console.log("[Web3Context] Switching network to chainId:", chainId);
    
    if (!window.ethereum) {
      toast.error('MetaMask is not installed!');
      processingRef.current = false;
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      
      // We'll handle the network change in the chainChanged event handler
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        toast.error('This network needs to be added to your wallet first');
      } else {
        console.error('[Web3Context] Error switching network:', switchError);
        toast.error('Failed to switch network');
      }
    } finally {
      processingRef.current = false;
    }
  }, []);

  // Check for existing wallet connection on component mount
  useEffect(() => {
    console.log("[Web3Context] Component mounted, checking for existing connections");
    
    const checkConnection = async () => {
      if (processingRef.current) return;
      processingRef.current = true;
      
      if (typeof window.ethereum !== 'undefined') {
        try {
          const browserProvider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await browserProvider.send('eth_accounts', []);
          
          if (accounts.length > 0 && mountedRef.current) {
            console.log("[Web3Context] Found existing connection:", accounts[0]);
            const userAddress = accounts[0];
            const userSigner = await browserProvider.getSigner();
            
            setProvider(browserProvider);
            setSigner(userSigner);
            setAddress(userAddress);
          }
        } catch (error) {
          console.error('[Web3Context] Error checking wallet connection:', error);
        } finally {
          if (mountedRef.current) {
            processingRef.current = false;
          }
        }
      } else {
        processingRef.current = false;
      }
    };

    checkConnection();
    
    return () => {
      console.log("[Web3Context] Initial connection effect cleanup");
      mountedRef.current = false;
    };
  }, []);

  // Set up event listeners for account and chain changes
  useEffect(() => {
    if (!window.ethereum) return;
    console.log("[Web3Context] Setting up event listeners");

    const handleAccountsChanged = async (accounts: string[]) => {
      console.log("[Web3Context] Accounts changed:", accounts);
      if (!mountedRef.current) return;
      
      if (accounts.length === 0) {
        // User disconnected their wallet
        console.log("[Web3Context] User disconnected wallet");
        disconnect();
      } else if (accounts[0] !== address) {
        // User switched accounts
        console.log("[Web3Context] User switched to account:", accounts[0]);
        setAddress(accounts[0]);
        
        if (provider && mountedRef.current) {
          try {
            const userSigner = await provider.getSigner();
            setSigner(userSigner);
          } catch (error) {
            console.error("[Web3Context] Error getting signer after account change:", error);
          }
        }
      }
    };

    const handleChainChanged = async (chainIdHex: string) => {
      // Instead of reloading the page, update the provider and network
      console.log("[Web3Context] Chain changed to:", chainIdHex);
      if (!mountedRef.current) return;
      
      try {
        // Refresh the network information
        if (provider) {
          await refreshNetwork();
          
          // Update the signer as it might change with the network
          const userSigner = await provider.getSigner();
          setSigner(userSigner);
          
          const chainId = parseInt(chainIdHex, 16);
          toast.info(`Network changed to ${getNetworkName(chainId)}`);
        }
      } catch (error) {
        console.error("[Web3Context] Error handling chain change:", error);
      }
    };
    
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      console.log("[Web3Context] Removing event listeners");
      mountedRef.current = false;
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [address, disconnect, provider, refreshNetwork]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("[Web3Context] Component unmounting");
      mountedRef.current = false;
    };
  }, []);
  
  // Helper function to get network name from chain ID
  const getNetworkName = (chainId: number): string => {
    const networkNames: Record<number, string> = {
      1: 'Ethereum Mainnet',
      5: 'Goerli Testnet',
      11155111: 'Sepolia Testnet',
      137: 'Polygon Mainnet',
      80001: 'Mumbai Testnet',
      // Add more networks as needed
    };
    
    return networkNames[chainId] || `Chain ID ${chainId}`;
  };

  const value = {
    provider,
    signer,
    address,
    chainId: network?.chainId || null,
    networkName: network?.name || null,
    isTestnet: network?.isTestnet || false,
    isConnected: !!address,
    isConnecting,
    connect,
    disconnect,
    switchNetwork,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
} 