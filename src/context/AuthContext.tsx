import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface AuthContextType {
  isAuthenticated: boolean;
  user: {
    userId: string;
    username: string;
    email: string;
    balance: number;
  } | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthContextType['user']>(null);

  const fetchUserData = async (token: string) => {
    try {
      const response = await axios.get('http://localhost:3000/api/auth/current-user', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.status === 'success') {
        setUser(response.data.data);
        setIsAuthenticated(true);
        // Store user data in localStorage for persistence
        localStorage.setItem('userData', JSON.stringify(response.data.data));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      logout();
    }
  };

  const login = (token: string) => {
    localStorage.setItem('data.authToken', token);
    fetchUserData(token);
  };

  const logout = () => {
    localStorage.removeItem('data.authToken');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('data.authToken');
    const storedUserData = localStorage.getItem('userData');
    
    if (token) {
      if (storedUserData) {
        // If we have stored user data, use it immediately
        setUser(JSON.parse(storedUserData));
        setIsAuthenticated(true);
      }
      // Then fetch fresh data
      fetchUserData(token);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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