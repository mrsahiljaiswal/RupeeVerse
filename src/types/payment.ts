export type PaymentType = 'PAY' | 'REQUEST';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Payment {
  id: string;
  amount: number;
  payee: string;
  payer: string;
  note?: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  synced: boolean;
  reference?: string;
  type?: 'online' | 'offline';
  category?: string;
  paymentMode?: 'online' | 'offline';
}

export interface QueueStatus {
  queueLength: number;
  pendingPayments: number;
  isOnline: boolean;
} 