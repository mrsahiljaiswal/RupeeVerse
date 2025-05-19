import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSecureAuthData } from '@/utils/secureAuthStorage';

interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing auth data on mount
    const authData = getSecureAuthData();
    if (authData?.user) {
      setUser(authData.user);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (token: string) => {
    const authData = getSecureAuthData();
    if (authData?.user) {
      setUser(authData.user);
      setIsAuthenticated(true);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 