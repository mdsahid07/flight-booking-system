// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface Role {
  id: string;
  name: string; // Assuming the string represents the role name
}

interface User {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  avatarUrl: string;
  createdAt?: string;
  updatedAt?: string;
  roles?: Role[]; // Updated to an array of Role objects
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const apiUrlStem = import.meta.env.VITE_API_URL;
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    if (isLoggedIn && user) {
      localStorage.setItem('user', JSON.stringify(user));
      // Uncomment and replace with real token logic when integrated
      // localStorage.setItem('token', 'mock-token');
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [user, isLoggedIn]);

  const login = (userData: User) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};