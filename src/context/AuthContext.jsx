import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const currentUserId = currentUser?.id;

  const refreshSession = useCallback(async () => {
    try {
      const { user } = await apiRequest('/auth/refresh', { method: 'POST' });
      setCurrentUser(user);
      return user;
    } catch {
      setCurrentUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { user } = await apiRequest('/auth/session', { method: 'POST' });
        if (active) setCurrentUser(user);
      } catch {
        if (active) setCurrentUser(null);
      } finally {
        if (active) setAuthReady(true);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!currentUserId) return undefined;
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') refreshSession();
    }, 14 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [currentUserId, refreshSession]);

  const login = useCallback(async (credentials) => {
    const { user } = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
    setCurrentUser(user);
    return user;
  }, []);

  const signup = useCallback(async (details) => {
    const { user } = await apiRequest('/auth/signup', { method: 'POST', body: JSON.stringify(details) });
    setCurrentUser(user);
    return user;
  }, []);

  const loginWithFirebase = useCallback(async (idToken, name = '') => {
    const { user } = await apiRequest('/auth/firebase', { method: 'POST', body: JSON.stringify({ idToken, name }) });
    setCurrentUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    try { await apiRequest('/auth/logout', { method: 'POST' }); }
    finally { setCurrentUser(null); }
  }, []);

  const updateProfile = useCallback(async (updatedData) => {
    const { user } = await apiRequest('/profile', { method: 'PATCH', body: JSON.stringify(updatedData) });
    setCurrentUser(user);
    return user;
  }, []);

  const value = useMemo(() => ({ currentUser, authReady, login, signup, loginWithFirebase, logout, updateProfile, apiRequest }), [currentUser, authReady, login, signup, loginWithFirebase, logout, updateProfile]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
