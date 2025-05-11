import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface PaymentResponse {
  status: string;
  message: string;
  data: {
    transactionId: string;
    amount: number;
    note: string;
    payee: string;
    balanceAfterTransaction: number;
    transactionDate: string;
  };
  timestamp: string;
}

const API_BASE_URL = 'http://localhost:3000'; // Update this with your actual API base URL

export const usePayment = () => {
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const sendPayment = async (amount: number, payee: string, note: string = 'today') => {
    if (!amount || !payee) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }

    setProcessing(true);
    try {
      const authData = localStorage.getItem('data.authToken');
      if (!authData) {
        throw new Error('Authentication token not found. Please login again.');
      }

      const response = await fetch(`${API_BASE_URL}/api/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData}`,
        },
        body: JSON.stringify({
          amount,
          note,
          payee,
        }),
      });

      // Check if response is ok (status in the range 200-299)
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      // Try to parse the response as JSON
      let data: PaymentResponse;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error('Invalid response from server. Please try again.');
      }

      if (data.status === 'success') {
        toast({
          title: "Payment Successful",
          description: data.message,
        });
        return true;
      } else {
        throw new Error(data.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        variant: "destructive",
      });
      return false;
    } finally {
      setProcessing(false);
    }
  };

  return {
    processing,
    sendPayment,
  };
}; 