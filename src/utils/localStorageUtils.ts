import { Payment } from '@/types/payment';
import { 
  getSecurePaymentQueue, 
  setSecurePaymentQueue, 
  addToSecurePaymentQueue, 
  removeFromSecurePaymentQueue, 
  clearSecurePaymentQueue 
} from './secureStorage';

export const getQueuedPayments = (): Payment[] => {
  return getSecurePaymentQueue();
};

export const addPaymentToQueue = (payment: Payment): boolean => {
  return addToSecurePaymentQueue(payment);
};

export const clearQueuedPayments = (): boolean => {
  return clearSecurePaymentQueue();
};

export const removeProcessedPayment = (paymentId: string): boolean => {
  return removeFromSecurePaymentQueue(paymentId);
};