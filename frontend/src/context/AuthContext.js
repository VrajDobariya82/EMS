import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '../api';

export const AuthContext = createContext({
  user: null,
  role: null,
  profilePending: false,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  markProfileComplete: async () => {},
  updateProfile: async () => {},
});

const SESSION_STORAGE_KEY = 'ems.session';

function writeSession(session) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [profilePending, setProfilePending] = useState(false);

  useEffect(() => {
    const session = readSession();
    if (session && session.user && session.role) {
      setUser(session.user);
      setRole(session.role);
      setProfilePending(session.profilePending || false);
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    try {
      // Test connection first
      try {
        const baseUrl = API_BASE_URL.replace('/api', '');
        const healthCheck = await fetch(`${baseUrl}/api/health`);
        if (!healthCheck.ok) {
          throw new Error('Backend server is not responding');
        }
      } catch (healthError) {
        throw new Error('Cannot connect to server. Please ensure the backend is running on port 5000.');
      }
      
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      let data;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : null;
      } catch (parseError) {
        throw new Error('Server response error. Please check if the backend is running.');
      }
      
      if (!res.ok) {
        throw new Error(data?.error || 'Login failed');
      }
      
      const { token, user: u } = data;
      const pending = u.profilePending || false;
      setUser({ id: u.id, name: u.name, email: u.email });
      setRole(u.role);
      setProfilePending(pending);
      writeSession({ 
        token, 
        user: { id: u.id, name: u.name, email: u.email }, 
        role: u.role,
        profilePending: pending
      });
      return { ...u, profilePending: pending };
    } catch (error) {
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please ensure the backend is running on port 5000.');
      }
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('Network request failed')) {
        throw new Error('Cannot connect to server. Please ensure the backend is running on port 5000.');
      }
      throw error;
    }
  }, []);

  const signup = useCallback(async ({ name, email, password, role }) => {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    const userRes = await res.json();
    if (!res.ok) throw new Error(userRes?.error || 'Signup failed');
    // Auto-login after signup
    const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(loginData?.error || 'Login failed');
    const { token, user: u } = loginData;
    const pending = u.profilePending || true; // New signups should have pending profile
    setUser({ id: u.id, name: u.name, email: u.email });
    setRole(u.role);
    setProfilePending(pending);
    writeSession({ 
      token, 
      user: { id: u.id, name: u.name, email: u.email }, 
      role: u.role,
      profilePending: pending
    });
    return { ...userRes, profilePending: pending };
  }, []);

  const markProfileComplete = useCallback(async () => {
    if (!user?.id) return;
    try {
      const session = readSession();
      const token = session?.token;
      if (!token) return;
      
      const res = await fetch(`${API_BASE_URL}/auth/profile-complete`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setProfilePending(false);
        if (session) {
          session.profilePending = false;
          writeSession(session);
        }
      }
    } catch (e) {
      console.error('Failed to mark profile as complete:', e);
    }
  }, [user]);

  const updateProfile = useCallback(async ({ name, email }) => {
    if (!user?.id) return;
    try {
      const session = readSession();
      const token = session?.token;
      if (!token) return;
      
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email })
      });
      
      if (res.ok) {
        const updatedUser = await res.json();
        setUser({ id: updatedUser.id, name: updatedUser.name, email: updatedUser.email });
        if (session) {
          session.user = { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email };
          writeSession(session);
        }
        return updatedUser;
      } else {
        const error = await res.json();
        throw new Error(error?.error || 'Failed to update profile');
      }
    } catch (e) {
      console.error('Failed to update profile:', e);
      throw e;
    }
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
    setRole(null);
    setProfilePending(false);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    // Redirect to landing page
    window.location.href = '/';
  }, []);

  const value = useMemo(() => ({ 
    user, 
    role, 
    profilePending, 
    login, 
    signup, 
    logout, 
    markProfileComplete,
    updateProfile
  }), [user, role, profilePending, login, signup, logout, markProfileComplete, updateProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


