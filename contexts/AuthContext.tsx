import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { storage } from '../utils/storage';
import { API_BASE_URL } from '../constants/api';

const TOKEN_KEY = 'auth_token';

export interface User {
  id: number;
  username: string;
  email: string;
  status: "STUDENT" | "TEACHER"; 
  first_name?: string;
  last_name?: string;
  bio?: string;
  
  // Student Specific
  grade_level?: string;
  disability_type?: string;
  teacher_name?: string;
  teacher_id?: number;

  // Teacher Specific
  display_name?: string;
  contact_number?: string;
  room_section?: string;
  department?: string;
  grade_handled?: string;
  organization?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On app start, restore saved token and fetch user profile
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = await storage.getItem(TOKEN_KEY);
        if (stored) {
          const res = await axios.get(`${API_BASE_URL}/profile/me`, {
            headers: { Authorization: `Bearer ${stored}` },
          });
          if (res.data.status === "TEACHER") {
            await storage.deleteItem(TOKEN_KEY);
          } else {
            setToken(stored);
            setUser(res.data);
          }
        }
      } catch (error: any) {
        const status = error?.response?.status;
        if (status === 401) {
          // Token is actually invalid — clear it
          await storage.deleteItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
        // Network error (Render sleeping, no internet) — keep the token,
        // the user stays logged in and the app will retry on next action
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (identifier: string, password: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login/`, { identifier, password });
    const accessToken: string = response.data.access_token;

    const profileRes = await axios.get(`${API_BASE_URL}/profile/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (profileRes.data.status === "TEACHER") {
      throw new Error("Teacher accounts are not supported on the mobile app. Please use the VocaLink web dashboard.");
    }

    await storage.setItem(TOKEN_KEY, accessToken);
    setToken(accessToken);
    setUser(profileRes.data);
  };

  const signup = async (username: string, email: string, password: string, fullName?: string) => {
    const [first_name, ...rest] = (fullName ?? '').trim().split(' ');
    const last_name = rest.join(' ');

    const res = await axios.post(`${API_BASE_URL}/auth/register/`, {
      username,
      email,
      password,
      status: 'STUDENT',
      ...(first_name && { first_name }),
      ...(last_name && { last_name }),
    });

    // Return the response data so signup screen can check auto_verified
    return res.data;
  };

  const updateProfile = async (profileData: Partial<User>) => {
    await axios.put(`${API_BASE_URL}/profile/me`, profileData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser((prev) => (prev ? { ...prev, ...profileData } : null));
  };

  const deleteAccount = async () => {
    await axios.delete(`${API_BASE_URL}/profile/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await logout();
  };

  const logout = async () => {
    await storage.deleteItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout, updateProfile, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
