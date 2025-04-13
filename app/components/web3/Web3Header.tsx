import { useWeb3 } from '~/lib/web3/Web3Context';
import { WalletConnect } from './WalletConnect';
import { NetworkStatus } from './NetworkStatus';
import { LighthouseButton } from '~/lib/lighthouse/LighthouseButton';
import { Link } from '@remix-run/react';

interface Web3HeaderProps {
  className?: string;
}

// Mark this component as client-only to avoid SSR issues
export const clientOnly = true;

export function Web3Header({ className = '' }: Web3HeaderProps) {
  const { provider, isConnected, connect, disconnect } = useWeb3();

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {isConnected && (
        <>
          <NetworkStatus provider={provider} />
          <Link
            to="/repositories"
            className="flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium bg-gray-100 hover:bg-gray-200 text-[var(--rill-text-primary)] transition-colors"
          >
            <div className="i-ph:folder-duotone text-lg"></div>
            <span>Repositories</span>
          </Link>
          <LighthouseButton />
        </>
      )}
      
      <WalletConnect 
        useExternalState={true}
        isConnected={isConnected}
        onConnect={connect}
        onDisconnect={disconnect}
      />
    </div>
  );
} 