import { Payment } from '../types/payment';

const STORAGE_KEYS = {
  PAYMENT_QUEUE: 'paymentQueue',
  AUTH_TOKEN: 'token'
} as const;

export class StorageService {
  private static instance: StorageService;

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  public getPaymentQueue(): Payment[] {
    const queue = localStorage.getItem(STORAGE_KEYS.PAYMENT_QUEUE);
    return queue ? JSON.parse(queue) : [];
  }

  public savePaymentQueue(queue: Payment[]): void {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_QUEUE, JSON.stringify(queue));
  }

  public getAuthToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  public setAuthToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  public removeAuthToken(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }
}

export const storage = StorageService.getInstance(); 