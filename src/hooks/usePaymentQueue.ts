import { useState, useEffect, useCallback } from 'react';
import { paymentQueue } from '../services/paymentQueue';
import { PaymentType, QueueStatus } from '../types/payment';

export const usePaymentQueue = () => {
  const [queueStatus, setQueueStatus] = useState<QueueStatus>(paymentQueue.getQueueStatus());

  const updateStatus = useCallback(() => {
    setQueueStatus(paymentQueue.getQueueStatus());
  }, []);

  useEffect(() => {
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, [updateStatus]);

  const makePayment = useCallback(async (
    amount: number,
    recipientId: string,
    type: PaymentType,
    metadata?: Record<string, any>
  ) => {
    await paymentQueue.addToQueue({
      amount,
      recipientId,
      type,
      metadata
    });
    updateStatus();
  }, [updateStatus]);

  return {
    makePayment,
    queueStatus,
    isOnline: queueStatus.isOnline,
    pendingPayments: queueStatus.pendingPayments,
    queueLength: queueStatus.queueLength
  };
}; 