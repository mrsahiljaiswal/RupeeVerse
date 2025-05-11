// Utility functions for handling offline UPI transactions

// Generate a UUID-like ID without external dependencies
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export type OfflineTransaction = {
  id: string;
  amount: number;
  sender: string;
  receiver: string;
  description: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  synced: boolean;
  reference?: string;
};

// Get all stored offline transactions
export const getOfflineTransactions = (): OfflineTransaction[] => {
  try {
    const stored = localStorage.getItem('offlineTransactions');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to retrieve offline transactions:', error);
    return [];
  }
};

// Save a new offline transaction
export const saveOfflineTransaction = (transaction: Omit<OfflineTransaction, 'id' | 'timestamp' | 'synced' | 'status'>) => {
  try {
    const transactions = getOfflineTransactions();
    const newTransaction: OfflineTransaction = {
      ...transaction,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      status: 'pending',
      synced: false,
    };
    
    transactions.push(newTransaction);
    localStorage.setItem('offlineTransactions', JSON.stringify(transactions));
    return newTransaction;
  } catch (error) {
    console.error('Failed to save offline transaction:', error);
    throw new Error('Failed to save transaction for offline processing');
  }
};

// Update the status of an offline transaction
export const updateTransactionStatus = (
  id: string, 
  status: 'pending' | 'completed' | 'failed', 
  synced: boolean = false
) => {
  try {
    const transactions = getOfflineTransactions();
    const updatedTransactions = transactions.map(tx => 
      tx.id === id ? { ...tx, status, synced } : tx
    );
    
    localStorage.setItem('offlineTransactions', JSON.stringify(updatedTransactions));
    return updatedTransactions.find(tx => tx.id === id);
  } catch (error) {
    console.error('Failed to update transaction status:', error);
    throw new Error('Failed to update transaction status');
  }
};

// Process transactions when back online
export const syncOfflineTransactions = async () => {
  const transactions = getOfflineTransactions();
  const pendingTransactions = transactions.filter(tx => !tx.synced);
  
  // Here you would typically make API calls to your backend
  // For demo purposes, we'll simulate successful syncing after a delay
  const syncPromises = pendingTransactions.map(async transaction => {
    return new Promise<OfflineTransaction>(resolve => {
      // Simulate API delay
      setTimeout(() => {
        const updated = updateTransactionStatus(transaction.id, 'completed', true);
        resolve(updated as OfflineTransaction);
      }, 1000);
    });
  });
  
  return Promise.all(syncPromises);
};

// Generate a unique reference code for the transaction
const generateReferenceCode = () => {
  // Use our custom UUID generator instead of the uuid library
  return generateUUID().substring(0, 8).toUpperCase();
};

// Get user's UPI ID from localStorage or use a default
const getUserUpiId = () => {
  try {
    // In a real app, this would come from the user's profile
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      const profile = JSON.parse(userProfile);
      return profile.upiId || 'vishakhagarwal2002@okicici';
    }
  } catch (error) {
    console.error('Error getting user UPI ID:', error);
  }
  return 'vishakhagarwal2002@okicici'; // Default UPI ID
};

// Create a QR code for offline payment
export const generateOfflinePaymentQR = (amount: number, description: string) => {
  // Create payment info with additional security
  const referenceCode = generateReferenceCode();
  const timestamp = Date.now();
  const expiry = timestamp + 1000 * 60 * 15; // 15 minutes expiry
  const userUpiId = getUserUpiId();
  
  const paymentInfo = {
    amount,
    description,
    timestamp,
    expiry,
    reference: referenceCode,
    receiver: userUpiId, // In a real app, this would be the user's UPI ID
  };
  
  // Generate a real UPI QR code that follows the UPI spec
  // https://developers.npci.org.in/doc-detail/9
  const upiUrl = `upi://pay?pa=${encodeURIComponent(userUpiId)}&pn=${encodeURIComponent('RupeeVerse')}&am=${amount}&tn=${encodeURIComponent(description)}&tr=${referenceCode}&cu=INR`;
  
  return {
    qrData: upiUrl,
    paymentInfo
  };
};

// Process a payment received from QR
export const processOfflinePayment = (qrData: string) => {
  try {
    // Parse UPI QR code format
    if (!qrData.startsWith('upi://pay?')) {
      throw new Error('Invalid UPI QR code format');
    }
    
    // Extract parameters from QR data
    const url = new URL(qrData.replace('upi://', 'https://'));
    const searchParams = new URLSearchParams(url.search);
    
    const amount = parseFloat(searchParams.get('am') || '0');
    const description = searchParams.get('tn') || '';
    const reference = searchParams.get('tr') || '';
    const payeeUpiId = searchParams.get('pa') || '';
    const payeeName = searchParams.get('pn') || '';
    
    // Validate QR code
    if (!amount || amount <= 0) {
      throw new Error('Invalid payment amount');
    }
    
    // Create and save the transaction
    return saveOfflineTransaction({
      amount,
      description: decodeURIComponent(description),
      sender: 'QR Scan User',
      receiver: decodeURIComponent(payeeUpiId),
      reference
    });
  } catch (error) {
    console.error('Failed to process offline payment:', error);
    throw error;
  }
};

// Find a transaction by reference code
export const findTransactionByReference = (reference: string): OfflineTransaction | undefined => {
  const transactions = getOfflineTransactions();
  return transactions.find(tx => tx.reference === reference);
};

// Verify and complete a transaction (simulates payment verification)
export const verifyAndCompleteTransaction = async (transactionId: string): Promise<OfflineTransaction> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const result = updateTransactionStatus(transactionId, 'completed', navigator.onLine);
        if (result) {
          resolve(result);
        } else {
          reject(new Error('Transaction not found'));
        }
      } catch (error) {
        reject(error);
      }
    }, 1500); // Simulate verification delay
  });
};
