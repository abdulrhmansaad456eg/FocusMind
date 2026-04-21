import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  setOnboardingComplete: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      hasCompletedOnboarding: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock successful login
          set({
            user: {
              id: '1',
              email,
              username: email.split('@')[0],
              avatarColor: '#3b82f6',
            },
            isLoading: false,
          });
        } catch (err) {
          set({ error: 'Failed to login. Please try again.', isLoading: false });
        }
      },

      signup: async (email: string, password: string, username: string) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock successful signup
          set({
            user: {
              id: '1',
              email,
              username,
              avatarColor: '#3b82f6',
            },
            isLoading: false,
          });
        } catch (err) {
          set({ error: 'Failed to create account. Please try again.', isLoading: false });
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
    }),
    {
      name: '@focusmind_auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
