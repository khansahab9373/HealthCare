import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('bloodcare_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCurrentUser = async () => {
      const token = localStorage.getItem('bloodcare_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        const currentUser = data.data;
        setUser(currentUser);
        localStorage.setItem('bloodcare_user', JSON.stringify(currentUser));
      } catch {
        localStorage.removeItem('bloodcare_token');
        localStorage.removeItem('bloodcare_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  const login = async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    const sessionUser = data.data.user;
    localStorage.setItem('bloodcare_token', data.data.token);
    localStorage.setItem('bloodcare_user', JSON.stringify(sessionUser));
    setUser(sessionUser);
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    const sessionUser = data.data.user;
    localStorage.setItem('bloodcare_token', data.data.token);
    localStorage.setItem('bloodcare_user', JSON.stringify(sessionUser));
    setUser(sessionUser);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('bloodcare_token');
    localStorage.removeItem('bloodcare_user');
    setUser(null);
    window.location.href = '/login';
  };

  const updateProfile = async (payload) => {
    const { data } = await api.patch('/auth/me', payload);
    const updatedUser = data.data;
    localStorage.setItem('bloodcare_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return data;
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateProfile }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
