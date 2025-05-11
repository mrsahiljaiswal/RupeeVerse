export type PaymentType = 'PAY' | 'REQUEST';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Payment {
  id: string;
  type: PaymentType;
  amount: number;
  recipientId: string;
  timestamp: number;
  status: PaymentStatus;
  metadata?: Record<string, any>;
}

export interface QueueStatus {
  queueLength: number;
  pendingPayments: number;
  isOnline: boolean;
} 