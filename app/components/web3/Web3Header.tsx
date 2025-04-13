import { useWeb3 } from '~/lib/web3/Web3Context';
import { WalletConnect } from './WalletConnect';
import { NetworkStatus } from './NetworkStatus';

interface Web3HeaderProps {
  className?: string;
}

export function Web3Header({ className = '' }: Web3HeaderProps) {
  const { provider, isConnected, connect, disconnect } = useWeb3();

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {isConnected && <NetworkStatus provider={provider} />}
      
      <WalletConnect 
        useExternalState={true}
        isConnected={isConnected}
        onConnect={connect}
        onDisconnect={disconnect}
      />
    </div>
  );
} 