import { Payment, PaymentType, QueueStatus } from '../types/payment';
import { storage } from './storage';
import { api } from './api';

export class PaymentQueueService {
  private static instance: PaymentQueueService;
  private queue: Payment[] = [];
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;
  private onlineStatusCheckInterval: number | null = null;

  private constructor() {
    this.loadQueue();
    this.setupOnlineStatusListener();
    this.startOnlineStatusCheck();
  }

  public static getInstance(): PaymentQueueService {
    if (!PaymentQueueService.instance) {
      PaymentQueueService.instance = new PaymentQueueService();
    }
    return PaymentQueueService.instance;
  }

  private setupOnlineStatusListener(): void {
    window.addEventListener('online', this.handleOnlineStatusChange.bind(this));
    window.addEventListener('offline', this.handleOnlineStatusChange.bind(this));
  }

  private async handleOnlineStatusChange(): Promise<void> {
    const wasOnline = this.isOnline;
    this.isOnline = navigator.onLine && await api.checkOnlineStatus();

    if (!wasOnline && this.isOnline) {
      await this.syncQueue();
    }
  }

  private startOnlineStatusCheck(): void {
    // Check online status every 30 seconds
    this.onlineStatusCheckInterval = window.setInterval(
      this.handleOnlineStatusChange.bind(this),
      30000
    );
  }

  private loadQueue(): void {
    this.queue = storage.getPaymentQueue();
  }

  private saveQueue(): void {
    storage.savePaymentQueue(this.queue);
  }

  public async addToQueue(payment: Omit<Payment, 'id' | 'timestamp' | 'status'>): Promise<void> {
    const queuedPayment: Payment = {
      ...payment,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      status: 'PENDING'
    };

    this.queue.push(queuedPayment);
    this.saveQueue();

    if (this.isOnline) {
      await this.processPayment(queuedPayment);
    }
  }

  private async processPayment(payment: Payment): Promise<void> {
    try {
      payment.status = 'PROCESSING';
      this.saveQueue();

      const success = await api.processPayment(payment);
      
      if (success) {
        payment.status = 'COMPLETED';
        this.queue = this.queue.filter(p => p.id !== payment.id);
      } else {
        payment.status = 'FAILED';
      }
      
      this.saveQueue();
    } catch (error) {
      payment.status = 'FAILED';
      this.saveQueue();
      console.error('Payment processing failed:', error);
    }
  }

  public async syncQueue(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) return;

    this.syncInProgress = true;
    const pendingPayments = this.queue.filter(p => p.status === 'PENDING');

    for (const payment of pendingPayments) {
      await this.processPayment(payment);
    }

    this.syncInProgress = false;
  }

  public getQueueStatus(): QueueStatus {
    return {
      queueLength: this.queue.length,
      pendingPayments: this.queue.filter(p => p.status === 'PENDING').length,
      isOnline: this.isOnline
    };
  }

  public cleanup(): void {
    if (this.onlineStatusCheckInterval) {
      clearInterval(this.onlineStatusCheckInterval);
    }
    window.removeEventListener('online', this.handleOnlineStatusChange.bind(this));
    window.removeEventListener('offline', this.handleOnlineStatusChange.bind(this));
  }
}

export const paymentQueue = PaymentQueueService.getInstance(); 