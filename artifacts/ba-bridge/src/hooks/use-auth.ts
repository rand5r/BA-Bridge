import { useState, useEffect } from 'react';
import { storage, User } from '@/lib/storage';
import { useLocation } from 'wouter';

export function useAuth() {
  const [user, setUser] = useState<User | null>(storage.getCurrentUser());
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(storage.getCurrentUser());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (userData: User) => {
    storage.setCurrentUser(userData);
    setUser(userData);
  };

  const logout = () => {
    storage.setCurrentUser(null);
    setUser(null);
    setLocation('/');
  };

  return { user, login, logout };
}

export function useProtected() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user) {
      setLocation('/login');
    }
  }, [user, setLocation]);

  return user;
}
