import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

export enum TransactionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
}

interface TransactionProps {
  txHash?: string;
  status?: TransactionStatus;
  confirmations?: number;
  onStatusChange?: (status: TransactionStatus, txHash: string) => void;
  provider?: ethers.BrowserProvider;
  chainId?: number;
  className?: string;
}

export function Transaction({
  txHash,
  status: initialStatus,
  confirmations = 1,
  onStatusChange,
  provider,
  chainId,
  className = '',
}: TransactionProps) {
  const [status, setStatus] = useState<TransactionStatus>(initialStatus || TransactionStatus.PENDING);
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null);

  useEffect(() => {
    if (initialStatus) {
      setStatus(initialStatus);
    }
  }, [initialStatus]);

  useEffect(() => {
    if (!txHash || !provider) return;

    const updateStatus = async () => {
      try {
        const receipt = await provider.getTransactionReceipt(txHash);
        
        if (receipt === null) {
          setStatus(TransactionStatus.PENDING);
          return;
        }

        if (receipt.status === 0) {
          setStatus(TransactionStatus.FAILED);
          onStatusChange?.(TransactionStatus.FAILED, txHash);
          toast.error('Transaction failed');
        } else if (receipt.confirmations >= confirmations) {
          setStatus(TransactionStatus.CONFIRMED);
          onStatusChange?.(TransactionStatus.CONFIRMED, txHash);
          toast.success('Transaction confirmed');
        } else {
          setStatus(TransactionStatus.PENDING);
        }
      } catch (error) {
        console.error('Error checking transaction status:', error);
      }
    };

    updateStatus();
    
    // Set up polling to check transaction status
    const intervalId = setInterval(updateStatus, 5000);
    
    return () => clearInterval(intervalId);
  }, [txHash, provider, confirmations, onStatusChange]);

  useEffect(() => {
    if (!txHash || !chainId) return;

    // Set explorer URL based on chainId
    let url;
    switch (chainId) {
      case 1: // Ethereum Mainnet
        url = `https://etherscan.io/tx/${txHash}`;
        break;
      case 5: // Goerli
        url = `https://goerli.etherscan.io/tx/${txHash}`;
        break;
      case 11155111: // Sepolia
        url = `https://sepolia.etherscan.io/tx/${txHash}`;
        break;
      case 137: // Polygon
        url = `https://polygonscan.com/tx/${txHash}`;
        break;
      case 80001: // Mumbai
        url = `https://mumbai.polygonscan.com/tx/${txHash}`;
        break;
      case 42161: // Arbitrum
        url = `https://arbiscan.io/tx/${txHash}`;
        break;
      case 10: // Optimism
        url = `https://optimistic.etherscan.io/tx/${txHash}`;
        break;
      default:
        url = null;
    }

    setExplorerUrl(url);
  }, [txHash, chainId]);

  if (!txHash) return null;

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <div className="flex items-center">
        <span 
          className={`w-2 h-2 rounded-full mr-2 ${
            status === TransactionStatus.PENDING 
              ? 'bg-yellow-500 animate-pulse' 
              : status === TransactionStatus.CONFIRMED 
                ? 'bg-green-500' 
                : 'bg-red-500'
          }`}
        />
        {status === TransactionStatus.PENDING && 'Pending'}
        {status === TransactionStatus.CONFIRMED && 'Confirmed'}
        {status === TransactionStatus.FAILED && 'Failed'}
      </div>
      {explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {txHash.slice(0, 6)}...{txHash.slice(-4)}
        </a>
      )}
      {!explorerUrl && (
        <span className="opacity-75">
          {txHash.slice(0, 6)}...{txHash.slice(-4)}
        </span>
      )}
    </div>
  );
} 