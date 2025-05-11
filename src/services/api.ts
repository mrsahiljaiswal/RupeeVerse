import { API_URL } from '../config';
import { Payment, PaymentType } from '../types/payment';
import { storage } from './storage';

export class ApiService {
  private static instance: ApiService;

  private constructor() {}

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private getHeaders(): HeadersInit {
    const token = storage.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  public async processPayment(payment: Omit<Payment, 'id' | 'timestamp' | 'status'>): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/payments`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          type: payment.type,
          amount: payment.amount,
          recipientId: payment.recipientId,
          metadata: payment.metadata
        })
      });

      return response.ok;
    } catch (error) {
      console.error('API request failed:', error);
      return false;
    }
  }

  public async checkOnlineStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const api = ApiService.getInstance(); 