import axios from 'axios';
import { getSecureAuthData } from '@/utils/secureAuthStorage';

const API_BASE_URL = 'http://localhost:3000';

export interface Notification {
  _id: string;
  type: string;
  message: string;
  seen: boolean;
  transactionId?: string;
  createdAt: string;
}

interface NotificationResponse {
  status: string;
  data: Notification[];
}

export const notificationService = {
  async fetchNotifications(): Promise<Notification[]> {
    const secureData = getSecureAuthData();
    if (!secureData) throw new Error('No auth token found');

    const response = await axios.get<NotificationResponse>(`${API_BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${secureData.token}` }
    });
    return response.data.data;
  },

  async markAsRead(id: string): Promise<void> {
    const secureData = getSecureAuthData();
    if (!secureData) throw new Error('No auth token found');

    await axios.patch(`${API_BASE_URL}/api/notifications/mark-as-read/${id}`, {}, {
      headers: { Authorization: `Bearer ${secureData.token}` }
    });
  },

  async markAllAsRead(): Promise<void> {
    const secureData = getSecureAuthData();
    if (!secureData) throw new Error('No auth token found');

    await axios.patch(`${API_BASE_URL}/api/notifications/mark-all-as-seen`, {}, {
      headers: { Authorization: `Bearer ${secureData.token}` }
    });
  },

  async dismissNotification(id: string): Promise<void> {
    const secureData = getSecureAuthData();
    if (!secureData) throw new Error('No auth token found');

    await axios.delete(`${API_BASE_URL}/api/notifications/dismiss/${id}`, {
      headers: { Authorization: `Bearer ${secureData.token}` }
    });
  },

  async acceptRequest(transactionId: string): Promise<void> {
    const secureData = getSecureAuthData();
    if (!secureData) throw new Error('No auth token found');

    await axios.post(`${API_BASE_URL}/api/requests/accept/${transactionId}`, {}, {
      headers: { Authorization: `Bearer ${secureData.token}` }
    });
  },

  async rejectRequest(transactionId: string): Promise<void> {
    const secureData = getSecureAuthData();
    if (!secureData) throw new Error('No auth token found');

    await axios.post(`${API_BASE_URL}/api/requests/reject/${transactionId}`, {}, {
      headers: { Authorization: `Bearer ${secureData.token}` }
    });
  }
}; 