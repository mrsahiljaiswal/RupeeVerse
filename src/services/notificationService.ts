import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

export interface Notification {
  _id: string;
  userId: string;
  message: string;
  seen: boolean;
  type: 'request_sent' | 'request_accepted' | 'request_rejected' | 'payment_received';
  transactionId?: string;
  createdAt: string;
}

export interface NotificationResponse {
  status: string;
  data: Notification[];
}

export const notificationService = {
  async fetchNotifications(): Promise<Notification[]> {
    const token = localStorage.getItem('data.authToken');
    if (!token) throw new Error('No auth token found');

    const response = await axios.get<NotificationResponse>(`${API_BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  },

  async markAsRead(id: string): Promise<void> {
    const token = localStorage.getItem('data.authToken');
    if (!token) throw new Error('No auth token found');

    await axios.patch(`${API_BASE_URL}/api/notifications/mark-as-read/${id}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  async markAllAsRead(): Promise<void> {
    const token = localStorage.getItem('data.authToken');
    if (!token) throw new Error('No auth token found');

    await axios.patch(`${API_BASE_URL}/api/notifications/mark-all-as-seen`,{}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  async dismissNotification(id: string): Promise<void> {
    const token = localStorage.getItem('data.authToken');
    if (!token) throw new Error('No auth token found');

    await axios.delete(`${API_BASE_URL}/api/notifications/dismiss/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  async acceptRequest(transactionId: string): Promise<void> {
    const token = localStorage.getItem('data.authToken');
    if (!token) throw new Error('No auth token found');

    await axios.post(`${API_BASE_URL}/api/requests/accept/${transactionId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  async rejectRequest(transactionId: string): Promise<void> {
    const token = localStorage.getItem('data.authToken');
    if (!token) throw new Error('No auth token found');

    await axios.post(`${API_BASE_URL}/api/requests/reject/${transactionId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}; 