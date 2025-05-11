import { Buffer } from 'buffer/';
import { Payment } from '@/types/payment';

// Encryption key - in production, this should be stored securely and not hardcoded
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'your-secure-encryption-key';

interface SecurePaymentData {
  payments: Payment[];
  timestamp: number;
  signature: string;
}

// Generate a unique signature for the payment data
const generateSignature = (data: Omit<SecurePaymentData, 'signature'>): string => {
  const dataString = `${JSON.stringify(data.payments)}-${data.timestamp}`;
  return Buffer.from(dataString).toString('base64');
};

// Encrypt payment data
const encryptPaymentData = (payments: Payment[]): string => {
  const secureData: SecurePaymentData = {
    payments,
    timestamp: Date.now(),
    signature: generateSignature({ payments, timestamp: Date.now() })
  };
  
  const encrypted = Buffer.from(JSON.stringify(secureData)).toString('base64');
  return encrypted;
};

// Decrypt payment data
const decryptPaymentData = (encrypted: string): Payment[] | null => {
  try {
    const decrypted = Buffer.from(encrypted, 'base64').toString();
    const data: SecurePaymentData = JSON.parse(decrypted);
    
    // Verify signature
    const expectedSignature = generateSignature({
      payments: data.payments,
      timestamp: data.timestamp
    });
    
    if (data.signature !== expectedSignature) {
      console.error('Payment data signature verification failed');
      return null;
    }
    
    return data.payments;
  } catch (error) {
    console.error('Failed to decrypt payment data:', error);
    return null;
  }
};

// Get stored payment queue
export const getSecurePaymentQueue = (): Payment[] => {
  try {
    const encrypted = localStorage.getItem('securePaymentsQueue');
    if (!encrypted) return [];
    
    const payments = decryptPaymentData(encrypted);
    return payments || [];
  } catch (error) {
    console.error('Failed to get secure payment queue:', error);
    return [];
  }
};

// Store payment queue securely
export const setSecurePaymentQueue = (payments: Payment[]): boolean => {
  try {
    const encrypted = encryptPaymentData(payments);
    localStorage.setItem('securePaymentsQueue', encrypted);
    return true;
  } catch (error) {
    console.error('Failed to set secure payment queue:', error);
    return false;
  }
};

// Add a payment to the queue
export const addToSecurePaymentQueue = (payment: Payment): boolean => {
  try {
    const payments = getSecurePaymentQueue();
    payments.push(payment);
    return setSecurePaymentQueue(payments);
  } catch (error) {
    console.error('Failed to add payment to queue:', error);
    return false;
  }
};

// Remove a payment from the queue
export const removeFromSecurePaymentQueue = (paymentId: string): boolean => {
  try {
    const payments = getSecurePaymentQueue();
    const updatedPayments = payments.filter(p => p.id !== paymentId);
    return setSecurePaymentQueue(updatedPayments);
  } catch (error) {
    console.error('Failed to remove payment from queue:', error);
    return false;
  }
};

// Clear the payment queue
export const clearSecurePaymentQueue = (): boolean => {
  try {
    localStorage.removeItem('securePaymentsQueue');
    return true;
  } catch (error) {
    console.error('Failed to clear payment queue:', error);
    return false;
  }
};

interface SecurePayment {
  amount: number;
  note: string;
  payee: string;
  timestamp: number;
  signature: string;
}

// Generate a unique signature for the payment
const generateSignaturePayment = (payment: Omit<SecurePayment, 'signature'>): string => {
  const data = `${payment.amount}-${payment.payee}-${payment.note}-${payment.timestamp}`;
  return Buffer.from(data).toString('base64');
};

// Encrypt payment data
const encryptPayment = (payment: Omit<SecurePayment, 'signature'>): string => {
  const signature = generateSignaturePayment(payment);
  const securePayment: SecurePayment = {
    ...payment,
    signature
  };
  
  // In production, use a proper encryption library like crypto-js
  const encrypted = Buffer.from(JSON.stringify(securePayment)).toString('base64');
  return encrypted;
};

// Decrypt payment data
const decryptPayment = (encrypted: string): SecurePayment | null => {
  try {
    const decrypted = Buffer.from(encrypted, 'base64').toString();
    const payment: SecurePayment = JSON.parse(decrypted);
    
    // Verify signature
    const expectedSignature = generateSignaturePayment({
      amount: payment.amount,
      payee: payment.payee,
      note: payment.note,
      timestamp: payment.timestamp
    });
    
    if (payment.signature !== expectedSignature) {
      console.error('Payment signature verification failed');
      return null;
    }
    
    return payment;
  } catch (error) {
    console.error('Failed to decrypt payment:', error);
    return null;
  }
};

// Get all queued payments
export const getSecureQueuedPayments = (): SecurePayment[] => {
  try {
    const encrypted = localStorage.getItem('securePaymentsQueue');
    if (!encrypted) return [];
    
    const encryptedPayments = JSON.parse(encrypted);
    return encryptedPayments
      .map((encryptedPayment: string) => decryptPayment(encryptedPayment))
      .filter((payment: SecurePayment | null): payment is SecurePayment => payment !== null);
  } catch (error) {
    console.error('Failed to get secure payments:', error);
    return [];
  }
};

// Add payment to secure queue
export const addSecurePaymentToQueue = (payment: Omit<SecurePayment, 'timestamp' | 'signature'>) => {
  try {
    const payments = getSecureQueuedPayments();
    const securePayment = {
      ...payment,
      timestamp: Date.now()
    };
    
    const encrypted = encryptPayment(securePayment);
    const encryptedPayments = payments.map(p => encryptPayment(p));
    encryptedPayments.push(encrypted);
    
    localStorage.setItem('securePaymentsQueue', JSON.stringify(encryptedPayments));
    return true;
  } catch (error) {
    console.error('Failed to add secure payment:', error);
    return false;
  }
};

// Remove processed payment from queue
export const removeSecurePayment = (timestamp: number) => {
  try {
    const payments = getSecureQueuedPayments();
    const updatedPayments = payments.filter(p => p.timestamp !== timestamp);
    
    const encryptedPayments = updatedPayments.map(p => encryptPayment({
      amount: p.amount,
      payee: p.payee,
      note: p.note,
      timestamp: p.timestamp
    }));
    localStorage.setItem('securePaymentsQueue', JSON.stringify(encryptedPayments));
    return true;
  } catch (error) {
    console.error('Failed to remove secure payment:', error);
    return false;
  }
};

// Clear all queued payments
export const clearSecurePayments = () => {
  localStorage.removeItem('securePaymentsQueue');
}; 