import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  emailPasswordSignIn,
  emailPasswordSignUp,
  mapFirebaseAuthError,
  signOutFirebase,
} from '../services/firebaseEmailAuth';
import { getFirebaseAuth, isFirebaseConfigured } from '../services/firebase';

export interface User {
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
  logout: () => Promise<void>;
  setOnboardingComplete: () => void;
  updateProfile: (updates: Partial<User>) => void;
  setUser: (user: User) => void;
}

const TEST_ACCOUNT = {
  email: 'admin',
  password: '123',
  username: 'Admin',
};

function useFirebaseAuth(): boolean {
  return isFirebaseConfigured() && getFirebaseAuth() !== null;
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
        if (useFirebaseAuth()) {
          try {
            await emailPasswordSignIn(email, password);
            set({ isLoading: false });
            return true;
          } catch (err) {
            set({ error: mapFirebaseAuthError(err), isLoading: false });
            return false;
          }
        }

        try {
          await new Promise((resolve) => setTimeout(resolve, 500));

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
        } catch {
          set({ error: 'Login failed. Please try again.', isLoading: false });
          return false;
        }
      },

      signup: async (email: string, password: string, username: string) => {
        set({ isLoading: true, error: null });
        if (useFirebaseAuth()) {
          try {
            await emailPasswordSignUp(email, password, username);
            set({ isLoading: false });
            return true;
          } catch (err) {
            set({ error: mapFirebaseAuthError(err), isLoading: false });
            return false;
          }
        }

        try {
          await new Promise((resolve) => setTimeout(resolve, 500));

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
        } catch {
          set({ error: 'Signup failed. Please try again.', isLoading: false });
          return false;
        }
      },

      logout: async () => {
        if (useFirebaseAuth()) {
          try {
            await signOutFirebase();
          } catch {
            // still clear local session
          }
        }
        set({ user: null });
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

      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'focusmind-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    },
  ),
);
