import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  username: string;
  avatarColor: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  hasCompletedOnboarding: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, username: string) => Promise<boolean>;
  logout: () => void;
  setOnboardingComplete: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

// Test account - hardcoded to avoid storage issues
const TEST_ACCOUNT = {
  email: 'admin',
  password: '123',
  username: 'Admin',
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  hasCompletedOnboarding: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      // Simple validation against hardcoded test account
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (email.toLowerCase() === TEST_ACCOUNT.email && password === TEST_ACCOUNT.password) {
        set({
          user: {
            id: '1',
            email: TEST_ACCOUNT.email,
            username: TEST_ACCOUNT.username,
            avatarColor: '#3b82f6',
          },
          isLoading: false,
        });
        return true;
      }
      
      set({ error: 'Invalid email or password', isLoading: false });
      return false;
    } catch (err) {
      set({ error: 'Login failed. Please try again.', isLoading: false });
      return false;
    }
  },

  signup: async (email: string, password: string, username: string) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For signup, just create the user directly
      set({
        user: {
          id: '1',
          email,
          username,
          avatarColor: '#3b82f6',
        },
        isLoading: false,
      });
      return true;
    } catch (err) {
      set({ error: 'Signup failed. Please try again.', isLoading: false });
      return false;
    }
  },

  logout: () => {
    set({ user: null, hasCompletedOnboarding: false });
  },

  setOnboardingComplete: () => {
    set({ hasCompletedOnboarding: true });
  },

  updateProfile: (updates: Partial<User>) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, ...updates } });
    }
  },
}));

