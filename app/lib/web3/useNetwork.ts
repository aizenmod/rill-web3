import { useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';

interface Network {
  chainId: number;
  name: string;
  ensAddress?: string;
  isTestnet?: boolean;
}

const KNOWN_NETWORKS: Record<number, Network> = {
  1: { chainId: 1, name: 'Ethereum Mainnet' },
  5: { chainId: 5, name: 'Goerli Testnet', isTestnet: true },
  11155111: { chainId: 11155111, name: 'Sepolia Testnet', isTestnet: true },
  137: { chainId: 137, name: 'Polygon Mainnet' },
  80001: { chainId: 80001, name: 'Mumbai Testnet', isTestnet: true },
  42161: { chainId: 42161, name: 'Arbitrum One' },
  421613: { chainId: 421613, name: 'Arbitrum Goerli', isTestnet: true },
  10: { chainId: 10, name: 'Optimism' },
  420: { chainId: 420, name: 'Optimism Goerli', isTestnet: true },
  56: { chainId: 56, name: 'BNB Smart Chain' },
  97: { chainId: 97, name: 'BNB Testnet', isTestnet: true },
  43114: { chainId: 43114, name: 'Avalanche C-Chain' },
  43113: { chainId: 43113, name: 'Avalanche Fuji', isTestnet: true },
  250: { chainId: 250, name: 'Fantom Opera' },
  4002: { chainId: 4002, name: 'Fantom Testnet', isTestnet: true },
  100: { chainId: 100, name: 'Gnosis Chain' },
  1337: { chainId: 1337, name: 'Local Network', isTestnet: true },
  31337: { chainId: 31337, name: 'Hardhat Network', isTestnet: true },
};

export function useNetwork(provider?: ethers.BrowserProvider) {
  const [network, setNetwork] = useState<Network | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getNetwork = useCallback(async () => {
    if (!provider) {
      setNetwork(null);
      return;
    }

    console.log("[useNetwork] Getting network info");
    setLoading(true);
    setError(null);

    try {
      const networkInfo = await provider.getNetwork();
      console.log("[useNetwork] Network info:", networkInfo);
      const chainId = Number(networkInfo.chainId);
      
      console.log("[useNetwork] Network info retrieved:", { chainId, name: networkInfo.name });
      
      if (KNOWN_NETWORKS[chainId]) {
        setNetwork(KNOWN_NETWORKS[chainId]);
      } else {
        // Unknown network
        setNetwork({
          chainId,
          name: networkInfo.name || `Chain ID ${chainId}`,
          isTestnet: chainId !== 1, // Assume anything that's not mainnet is a testnet
        });
      }
    } catch (err) {
      console.error('[useNetwork] Error getting network:', err);
      setError('Failed to get network information');
      setNetwork(null);
    } finally {
      setLoading(false);
    }
  }, [provider]);

  // This function can be called externally to refresh network info
  const refreshNetwork = useCallback(async () => {
    console.log("[useNetwork] Refreshing network info");
    return getNetwork();
  }, [getNetwork]);

  useEffect(() => {
    console.log("[useNetwork] Provider changed, getting network info");
    getNetwork();
  }, [provider, getNetwork]);

  // No need for chain change listener here as the Web3Context now handles it

  return { network, loading, error, refreshNetwork };
} 