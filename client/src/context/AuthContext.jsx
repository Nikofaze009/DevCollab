import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    // Fetch profile to include plan info
    const profileRes = await api.get('/auth/profile', { headers: { Authorization: `Bearer ${data.token}` } });
    const fullUser = { ...data, plan: profileRes.data.plan || 'free' };
    localStorage.setItem('user', JSON.stringify(fullUser));
    setUser(fullUser);
    return fullUser;
  };

  const register = async (username, email, password) => {
    const { data } = await api.post('/auth/register', { username, email, password });
    const fullUser = { ...data, plan: 'free' };
    localStorage.setItem('user', JSON.stringify(fullUser));
    setUser(fullUser);
    return fullUser;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
