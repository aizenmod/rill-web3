import { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { TransactionStatus } from '~/components/web3/Transaction';

interface UseContractProps {
  contractAddress?: string;
  abi?: ethers.InterfaceAbi;
  provider?: ethers.BrowserProvider;
  signer?: ethers.JsonRpcSigner;
}

interface Transaction {
  hash: string;
  status: TransactionStatus;
}

export function useContract({ contractAddress, abi, provider, signer }: UseContractProps) {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [transactions, setTransactions] = useState<Record<string, Transaction>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize contract instance when parameters change
  useEffect(() => {
    if (!contractAddress || !abi || !provider) {
      setContract(null);
      return;
    }

    try {
      const contractInstance = new ethers.Contract(
        contractAddress,
        abi,
        signer || provider
      );
      
      setContract(contractInstance);
      setError(null);
    } catch (err) {
      console.error('Error creating contract instance:', err);
      setError('Failed to initialize contract');
      setContract(null);
    }
  }, [contractAddress, abi, provider, signer]);

  const callMethod = useCallback(async (
    methodName: string,
    args: any[] = [],
    options?: { value?: bigint | string }
  ) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    setLoading(true);
    setError(null);

    try {
      // Check if this is a read or write operation
      const method = contract[methodName];
      const isReadOperation = method.staticCall !== undefined;

      if (isReadOperation) {
        // This is a read-only call
        const result = await method(...args);
        setLoading(false);
        return result;
      } else {
        // This is a transaction that needs to be signed
        if (!signer) {
          throw new Error('Signer required for contract write operations');
        }

        const tx = await method(...args, options || {});
        
        // Add transaction to state
        const newTx = {
          hash: tx.hash,
          status: TransactionStatus.PENDING,
        };
        
        setTransactions(prev => ({
          ...prev,
          [tx.hash]: newTx
        }));

        toast.info('Transaction submitted');
        
        // Wait for transaction to be mined
        const receipt = await tx.wait();
        
        // Update transaction status
        if (receipt.status === 1) {
          setTransactions(prev => ({
            ...prev,
            [tx.hash]: {
              ...prev[tx.hash],
              status: TransactionStatus.CONFIRMED
            }
          }));
        } else {
          setTransactions(prev => ({
            ...prev,
            [tx.hash]: {
              ...prev[tx.hash],
              status: TransactionStatus.FAILED
            }
          }));
          throw new Error('Transaction failed');
        }
        
        setLoading(false);
        return receipt;
      }
    } catch (err: any) {
      setLoading(false);
      console.error(`Error calling contract method ${methodName}:`, err);
      
      // Parse error message
      let errorMessage = err.message || 'Transaction failed';
      
      // Check for common error patterns
      if (errorMessage.includes('user rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (errorMessage.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [contract, signer]);

  const updateTransactionStatus = useCallback((txHash: string, status: TransactionStatus) => {
    setTransactions(prev => ({
      ...prev,
      [txHash]: {
        ...prev[txHash],
        status
      }
    }));
  }, []);

  return {
    contract,
    loading,
    error,
    transactions,
    callMethod,
    updateTransactionStatus
  };
} 