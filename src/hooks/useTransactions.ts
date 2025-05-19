import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getSecureAuthData } from '@/utils/secureAuthStorage';

interface Transaction {
  _id: string;
  amount: number;
  type: string;
  status: string;
  sender: string;
  recipient: string;
  note: string;
  transactionDate: string;
}

const API_BASE_URL = 'http://localhost:3000';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const secureData = getSecureAuthData();
      if (!secureData) {
        throw new Error('Authentication token not found. Please login again.');
      }

      const response = await fetch(`${API_BASE_URL}/api/transactions`, {
        headers: {
          'Authorization': `Bearer ${secureData.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch transactions');
      toast({
        title: "Error",
        description: "Failed to load transaction history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
  };
}; 