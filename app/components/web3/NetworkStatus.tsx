import { ethers } from 'ethers';
import { useNetwork } from '~/lib/web3/useNetwork';

interface NetworkStatusProps {
  provider?: ethers.BrowserProvider;
  className?: string;
}

export function NetworkStatus({ provider, className = '' }: NetworkStatusProps) {
  const { network, loading } = useNetwork(provider);

  if (loading) {
    return (
      <div className={`flex items-center text-sm ${className}`}>
        <span className="i-svg-spinners:270-ring-with-bg w-3 h-3 mr-1"></span>
        <span>Loading network...</span>
      </div>
    );
  }

  if (!network) {
    return (
      <div className={`flex items-center text-sm text-red-500 ${className}`}>
        <span>Not connected</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center text-sm ${className}`}>
      <span 
        className={`w-2 h-2 rounded-full mr-2 ${
          network.isTestnet 
            ? 'bg-yellow-500' 
            : 'bg-green-500'
        }`}
      />
      <span>{network.name}</span>
      {network.isTestnet && (
        <span className="ml-1 px-1 text-xs bg-yellow-500/20 text-yellow-500 rounded">Testnet</span>
      )}
    </div>
  );
} 