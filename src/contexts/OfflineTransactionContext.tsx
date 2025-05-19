
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  OfflineTransaction, 
  getOfflineTransactions, 
  saveOfflineTransaction,
  updateTransactionStatus,
  syncOfflineTransactions,
  generateOfflinePaymentQR,
  processOfflinePayment
} from '@/utils/offlineTransactions';
import { useToast } from '@/components/ui/use-toast';

type OfflineTransactionContextType = {
  transactions: OfflineTransaction[];
  pendingCount: number;
  isOnline: boolean;
  createTransaction: (data: Omit<OfflineTransaction, 'id' | 'timestamp' | 'synced' | 'status'>) => OfflineTransaction;
  updateStatus: (id: string, status: 'pending' | 'completed' | 'failed', synced?: boolean) => void;
  syncTransactions: () => Promise<OfflineTransaction[]>;
  generateQR: (amount: number, description: string) => { qrData: string, paymentInfo: any };
  processPayment: (qrData: string) => OfflineTransaction;
};

const OfflineTransactionContext = createContext<OfflineTransactionContextType | undefined>(undefined);

export const OfflineTransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<OfflineTransaction[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const { toast } = useToast();

  // Load transactions from localStorage on mount
  useEffect(() => {
    setTransactions(getOfflineTransactions());
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "You're back online",
        description: "Your queued transactions will now be processed",
      });
      syncTransactions();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're offline",
        description: "Transactions will be stored locally until you're back online",
        variant: "destructive",
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const createTransaction = (data: Omit<OfflineTransaction, 'id' | 'timestamp' | 'synced' | 'status'>) => {
    const newTransaction = saveOfflineTransaction(data);
    setTransactions(getOfflineTransactions());
    
    toast({
      title: "Transaction created",
      description: isOnline 
        ? "Processing your transaction now" 
        : "Transaction stored offline and will sync when you're back online",
    });
    
    return newTransaction;
  };

  const updateStatus = (id: string, status: 'pending' | 'completed' | 'failed', synced = false) => {
    updateTransactionStatus(id, status, synced);
    setTransactions(getOfflineTransactions());
  };

  const syncTransactions = async () => {
    if (!isOnline) {
      toast({
        title: "You're offline",
        description: "Cannot sync transactions while offline",
        variant: "destructive",
      });
      return transactions;
    }
    
    try {
      const synced = await syncOfflineTransactions();
      setTransactions(getOfflineTransactions());
      
      if (synced.length > 0) {
        toast({
          title: "Transactions synced",
          description: `Successfully synced ${synced.length} offline transactions`,
        });
      }
      
      return synced;
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Failed to sync transactions to the blockchain",
        variant: "destructive",
      });
      return [];
    }
  };

  const generateQR = (amount: number, description: string) => {
    return(amount, description);
  };

  const processPayment = (qrData: string) => {
    try {
      const transaction = processOfflinePayment(qrData);
      setTransactions(getOfflineTransactions());
      
      toast({
        title: "Payment received",
        description: `Received ₹${transaction.amount} for ${transaction.description}`,
      });
      
      return transaction;
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "Invalid QR code or payment data",
        variant: "destructive",
      });
      throw error;
    }
  };

  const pendingCount = transactions.filter(tx => !tx.synced).length;

  return (
    <OfflineTransactionContext.Provider 
      value={{ 
        transactions, 
        pendingCount,
        isOnline, 
        createTransaction, 
        updateStatus, 
        syncTransactions,
        generateQR,
        processPayment
      }}
    >
      {children}
    </OfflineTransactionContext.Provider>
  );
};

export const useOfflineTransactions = () => {
  const context = useContext(OfflineTransactionContext);
  
  if (context === undefined) {
    throw new Error('useOfflineTransactions must be used within an OfflineTransactionProvider');
  }
  
  return context;
};
