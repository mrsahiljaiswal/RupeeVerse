import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface PaymentRequestResponse {
  status: string;
  message: string;
  data: {
    requester: string;
    recipient: string;
    amount: number;
    note: string;
    status: 'pending' | 'accepted' | 'rejected';
    _id: string;
    createdAt: string;
  };
  timestamp: string;
}

const API_BASE_URL = 'http://localhost:3000';

export const usePaymentRequest = () => {
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const requestPayment = async (amount: number, recipient: string, note: string): Promise<PaymentRequestResponse | null> => {
    if (!amount || !recipient) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return null;
    }

    setProcessing(true);
    try {
      const authData = localStorage.getItem('data.authToken');
      if (!authData) {
        throw new Error('Authentication token not found. Please login again.');
      }

      const response = await fetch(`${API_BASE_URL}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData}`,
        },
        body: JSON.stringify({
          amount,
          note,
          recipient,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      let data: PaymentRequestResponse;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error('Invalid response from server. Please try again.');
      }

      if (data.status === 'success') {
        return data;
      } else {
        throw new Error(data.message || 'Request failed');
      }
    } catch (error) {
      console.error('Request error:', error);
      toast({
        title: "Request Failed",
        description: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        variant: "destructive",
      });
      return null;
    } finally {
      setProcessing(false);
    }
  };

  return {
    processing,
    requestPayment,
  };
}; 