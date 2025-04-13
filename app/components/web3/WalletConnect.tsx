import { useEffect, useState, useRef } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

interface WalletConnectProps {
  onConnect?: (provider: ethers.BrowserProvider, address: string) => void;
  onDisconnect?: () => void;
  buttonClassName?: string;
  useExternalState?: boolean;
  isConnected?: boolean;
}

export function WalletConnect({ 
  onConnect, 
  onDisconnect,
  buttonClassName = '',
  useExternalState = false,
  isConnected: externalIsConnected
}: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const mountedRef = useRef(true);
  const processingRef = useRef(false);

  console.log("[WalletConnect] Render with props:", { useExternalState, externalIsConnected, hasAddress: !!address });
  
  // If using external state, we'll skip our internal connection logic
  const isConnectedState = useExternalState ? externalIsConnected : !!address;

  const connectWallet = async () => {
    if (processingRef.current) {
      console.log("[WalletConnect] Already processing a connection request");
      return;
    }
    
    processingRef.current = true;
    console.log("[WalletConnect] Connecting wallet, useExternalState:", useExternalState);
    
    if (useExternalState && onConnect) {
      try {
        if (typeof window.ethereum === 'undefined') {
          toast.error('MetaMask is not installed! Please install it to use this feature.');
          processingRef.current = false;
          return;
        }
        
        // First directly call MetaMask to ensure the popup appears
        await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        // Then create the provider and get the accounts
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_accounts', []);
        
        if (accounts.length === 0) {
          toast.error('No accounts found');
          processingRef.current = false;
          return;
        }
        
        // Just set the address for display purposes, connection state is managed externally
        setAddress(accounts[0]);
        console.log("[WalletConnect] External connect with address:", accounts[0]);
        
        // Call onConnect after we're sure we have an account
        onConnect(provider, accounts[0]);
      } catch (error) {
        console.error('[WalletConnect] Error connecting wallet:', error);
        toast.error('Failed to connect wallet');
      } finally {
        processingRef.current = false;
      }
      return;
    }

    setIsConnecting(true);
    try {
      if (typeof window.ethereum === 'undefined') {
        toast.error('MetaMask is not installed! Please install it to use this feature.');
        setIsConnecting(false);
        processingRef.current = false;
        return;
      }

      // First directly call MetaMask to ensure the popup appears
      await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_accounts', []);
      
      if (accounts.length === 0) {
        toast.error('No accounts found');
        setIsConnecting(false);
        processingRef.current = false;
        return;
      }

      const address = accounts[0];
      console.log("[WalletConnect] Internal connect with address:", address);
      setAddress(address);
      setProvider(provider);
      
      if (onConnect) {
        onConnect(provider, address);
      }
      
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('[WalletConnect] Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
      processingRef.current = false;
    }
  };

  const disconnectWallet = () => {
    console.log("[WalletConnect] Disconnecting wallet, useExternalState:", useExternalState);
    if (useExternalState && onDisconnect) {
      onDisconnect();
      return;
    }

    setAddress(null);
    setProvider(null);
    toast.info('Wallet disconnected');
  };

  // Only run the auto-connection logic if not using external state
  useEffect(() => {
    console.log("[WalletConnect] useEffect setup - useExternalState:", useExternalState);
    if (useExternalState) return;
    
    const checkConnection = async () => {
      if (!mountedRef.current) return;
      if (processingRef.current) return;
      processingRef.current = true;
      
      console.log("[WalletConnect] Checking existing connection (internal mode)");
      if (typeof window.ethereum !== 'undefined') {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.send('eth_accounts', []);
          
          if (accounts.length > 0 && mountedRef.current) {
            const address = accounts[0];
            console.log("[WalletConnect] Found existing connection:", address);
            setAddress(address);
            setProvider(provider);
            
            if (onConnect) {
              onConnect(provider, address);
            }
          }
        } catch (error) {
          console.error('[WalletConnect] Error checking wallet connection:', error);
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

    const handleAccountsChanged = (accounts: string[]) => {
      console.log("[WalletConnect] Accounts changed:", accounts);
      if (!mountedRef.current) return;

      if (accounts.length === 0) {
        setAddress(null);
        setProvider(null);
      } else if (accounts[0] !== address) {
        setAddress(accounts[0]);
        if (provider && onConnect) {
          onConnect(provider, accounts[0]);
        }
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      console.log("[WalletConnect] Cleanup - removing event listeners");
      mountedRef.current = false;
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [address, onConnect, provider, useExternalState]);

  // For external state mode, we need the current address to display
  useEffect(() => {
    if (!useExternalState || !externalIsConnected) return;
    console.log("[WalletConnect] External state effect - isConnected:", externalIsConnected);
    
    const getAddress = async () => {
      if (!mountedRef.current) return;
      if (processingRef.current) return;
      processingRef.current = true;
      
      if (typeof window.ethereum !== 'undefined') {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.send('eth_accounts', []);
          
          if (accounts.length > 0 && mountedRef.current) {
            console.log("[WalletConnect] Retrieved address for display:", accounts[0]);
            setAddress(accounts[0]);
          }
        } catch (error) {
          console.error('[WalletConnect] Error getting address:', error);
        } finally {
          if (mountedRef.current) {
            processingRef.current = false;
          }
        }
      } else {
        processingRef.current = false;
      }
    };
    
    getAddress();
  }, [useExternalState, externalIsConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("[WalletConnect] Component unmounting");
      mountedRef.current = false;
    };
  }, []);

  return (
    <div className="flex items-center">
      {isConnectedState ? (
        <div className="flex items-center gap-2">
          <span className="text-sm truncate max-w-32">
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
          </span>
          <button
            onClick={disconnectWallet}
            className={`px-3 py-1 text-sm bg-rill-elements-background-depth-2 border border-rill-elements-borderColor rounded-md hover:bg-rill-elements-background-depth-3 ${buttonClassName}`}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className={`px-3 py-1 text-sm bg-rill-elements-background-depth-2 border border-rill-elements-borderColor rounded-md hover:bg-rill-elements-background-depth-3 ${buttonClassName}`}
        >
          {isConnecting ? (
            <span className="flex items-center">
              <span className="i-svg-spinners:270-ring-with-bg w-4 h-4 mr-1"></span> Connecting...
            </span>
          ) : (
            'Connect Wallet'
          )}
        </button>
      )}
    </div>
  );
}

// Add TypeScript interface for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request?: (request: { method: string; params?: Array<any> }) => Promise<any>;
      on: (event: string, callback: any) => void;
      removeListener: (event: string, callback: any) => void;
      send: (method: string, params: any[]) => Promise<any>;
    };
  }
} 