import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { 
  getSecureAuthData, 
  setSecureAuthData, 
  removeSecureAuthData,
  updateSecureUserData,
  type UserData 
} from '@/utils/secureAuthStorage';

interface CurrentUserResponse {
  status: string;
  message: string;
  data: {
    username: string;
    email: string;
    finalBalance: number;
  };
  timestamp: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  login: (token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<UserData>) => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  const fetchUserData = async (token: string) => {
    try {
      const response = await axios.get<CurrentUserResponse>('https://upiconnect.onrender.com/api/auth/current-user', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.status === 'success') {
        const userData: UserData = {
          userId: response.data.data.email, // Using email as userId for now
          username: response.data.data.username,
          email: response.data.data.email,
          balance: response.data.data.finalBalance,
          lastLogin: response.data.timestamp
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        // Store user data securely
        setSecureAuthData(token, userData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      logout();
    }
  };

  const refreshUserData = async () => {
    const secureData = getSecureAuthData();
    if (secureData?.token) {
      await fetchUserData(secureData.token);
    }
  };

  const login = (token: string) => {
    fetchUserData(token);
  };

  const logout = () => {
    removeSecureAuthData();
    setIsAuthenticated(false);
    setUser(null);
  };

  const updateUser = (userData: Partial<UserData>) => {
    if (updateSecureUserData(userData)) {
      setUser(prev => prev ? { ...prev, ...userData } : null);
    }
  };

  useEffect(() => {
    const secureData = getSecureAuthData();
    
    if (secureData) {
      // If we have stored user data, use it immediately
      setUser(secureData.userData);
      setIsAuthenticated(true);
      // Then fetch fresh data
      fetchUserData(secureData.token);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 