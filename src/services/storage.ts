import { Payment } from '../types/payment';
import { getSecureAuthData, setSecureAuthData, removeSecureAuthData } from '@/utils/secureAuthStorage';
import { getSecurePaymentQueue, setSecurePaymentQueue } from '@/utils/secureStorage';

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
    return getSecurePaymentQueue();
  }

  public savePaymentQueue(queue: Payment[]): void {
    setSecurePaymentQueue(queue);
  }

  public getAuthToken(): string | null {
    const secureData = getSecureAuthData();
    return secureData?.token || null;
  }

  public setAuthToken(token: string): void {
    setSecureAuthData({ token });
  }

  public removeAuthToken(): void {
    removeSecureAuthData();
  }
}

export const storage = StorageService.getInstance(); 