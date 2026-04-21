import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (saved && savedToken) {
      setUser(JSON.parse(saved));
      setToken(savedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    const { token: t, user: u } = res.data;
    setToken(t);
    setUser(u);
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    return u;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
