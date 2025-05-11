import { api } from './api';
import { storage } from './storage';
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types';

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(credentials: LoginCredentials): Promise<User> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    storage.setAuthToken(response.data.token);
    return response.data.user;
  }

  public async register(credentials: RegisterCredentials): Promise<User> {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    storage.setAuthToken(response.data.token);
    return response.data.user;
  }

  public async logout(): Promise<void> {
    await api.post('/auth/logout');
    storage.removeAuthToken();
  }

  public async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/me');
      return response.data.data;
    } catch {
      return null;
    }
  }

  public isAuthenticated(): boolean {
    return !!storage.getAuthToken();
  }
}

export const authService = AuthService.getInstance(); 