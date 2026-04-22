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
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, username: string) => Promise<boolean>;
  logout: () => void;
  setOnboardingComplete: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

// Test accounts storage key
const TEST_ACCOUNTS_KEY = '@focusmind_test_accounts';

// Default test account
const DEFAULT_TEST_ACCOUNT = {
  email: 'admin',
  password: '123',
  username: 'Admin',
};

interface TestAccount {
  email: string;
  password: string;
  username: string;
}

// Get test accounts from storage
const getTestAccounts = async (): Promise<TestAccount[]> => {
  try {
    const stored = await AsyncStorage.getItem(TEST_ACCOUNTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading test accounts:', e);
  }
  // Initialize with default test account
  await AsyncStorage.setItem(TEST_ACCOUNTS_KEY, JSON.stringify([DEFAULT_TEST_ACCOUNT]));
  return [DEFAULT_TEST_ACCOUNT];
};

// Add test account
const addTestAccount = async (email: string, password: string, username: string): Promise<boolean> => {
  try {
    const accounts = await getTestAccounts();
    // Check if account already exists
    if (accounts.some(acc => acc.email.toLowerCase() === email.toLowerCase())) {
      return false;
    }
    accounts.push({ email, password, username });
    await AsyncStorage.setItem(TEST_ACCOUNTS_KEY, JSON.stringify(accounts));
    return true;
  } catch (e) {
    console.error('Error adding test account:', e);
    return false;
  }
};

// Validate login
const validateLogin = async (email: string, password: string): Promise<TestAccount | null> => {
  const accounts = await getTestAccounts();
  const account = accounts.find(
    acc => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password
  );
  return account || null;
};

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
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const account = await validateLogin(email, password);
          
          if (!account) {
            set({ error: 'Invalid email or password', isLoading: false });
            return false;
          }
          
          set({
            user: {
              id: '1',
              email: account.email,
              username: account.username,
              avatarColor: '#3b82f6',
            },
            isLoading: false,
          });
          return true;
        } catch (err) {
          set({ error: 'Failed to login. Please try again.', isLoading: false });
          return false;
        }
      },

      signup: async (email: string, password: string, username: string) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const added = await addTestAccount(email, password, username);
          
          if (!added) {
            set({ error: 'An account with this email already exists', isLoading: false });
            return false;
          }
          
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
          set({ error: 'Failed to create account. Please try again.', isLoading: false });
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
    }),
    {
      name: '@focusmind_auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        user: state.user, 
        hasCompletedOnboarding: state.hasCompletedOnboarding 
      }),
      skipHydration: true,
    }
  )
);

