import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  emailPasswordSignIn,
  emailPasswordSignUp,
  mapFirebaseAuthError,
  signOutFirebase,
  resendVerificationEmail,
  sendPasswordReset,
  googleSignIn,
  checkEmailVerification,
} from '../services/firebaseEmailAuth';
import { getFirebaseAuth, isFirebaseConfigured } from '../services/firebase';
import { type User as FirebaseUser } from 'firebase/auth';

export interface User {
  id: string;
  email: string;
  username: string;
  avatarColor: string;
  emailVerified: boolean;
}

interface RateLimitState {
  attempts: number;
  lockedUntil: number | null;
  lastAttempt: number;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  hasCompletedOnboarding: boolean;
  needsVerification: boolean;
  pendingVerificationEmail: string | null;
  firebaseUser: FirebaseUser | null;
  rateLimit: RateLimitState;

  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, username: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setOnboardingComplete: () => void;
  updateProfile: (updates: Partial<User>) => void;
  setUser: (user: User) => void;
  resendVerification: () => Promise<void>;
  checkVerificationStatus: () => Promise<boolean>;
  forgotPassword: (email: string) => Promise<void>;
  googleLogin: (idToken: string, accessToken: string) => Promise<boolean>;
  clearError: () => void;
  resetRateLimit: () => void;
}

const TEST_ACCOUNT = {
  email: 'admin',
  password: '123',
  username: 'Admin',
};

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function useFirebaseAuth(): boolean {
  return isFirebaseConfigured() && getFirebaseAuth() !== null;
}

function mapFirebaseUser(fu: FirebaseUser): User {
  return {
    id: fu.uid,
    email: fu.email ?? '',
    username: fu.displayName?.trim() || fu.email?.split('@')[0] || 'FocusMind',
    avatarColor: '#6366f1',
    emailVerified: fu.emailVerified,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      hasCompletedOnboarding: false,
      needsVerification: false,
      pendingVerificationEmail: null,
      firebaseUser: null,
      rateLimit: {
        attempts: 0,
        lockedUntil: null,
        lastAttempt: 0,
      },

      // Check rate limit before login
      _checkRateLimit: (): boolean => {
        const { rateLimit } = get();
        if (rateLimit.lockedUntil && Date.now() < rateLimit.lockedUntil) {
          const remainingMinutes = Math.ceil((rateLimit.lockedUntil - Date.now()) / 60000);
          set({
            error: `Too many failed attempts. Please try again in ${remainingMinutes} minutes.`,
            isLoading: false,
          });
          return false;
        }
        return true;
      },

      // Record failed login attempt
      _recordFailedAttempt: () => {
        const { rateLimit } = get();
        const newAttempts = rateLimit.attempts + 1;

        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          set({
            rateLimit: {
              attempts: 0,
              lockedUntil: Date.now() + LOCKOUT_DURATION_MS,
              lastAttempt: Date.now(),
            },
          });
        } else {
          set({
            rateLimit: {
              attempts: newAttempts,
              lockedUntil: null,
              lastAttempt: Date.now(),
            },
          });
        }
      },

      // Reset rate limit on successful login
      _resetRateLimit: () => {
        set({
          rateLimit: {
            attempts: 0,
            lockedUntil: null,
            lastAttempt: 0,
          },
        });
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        // Check rate limiting
        const canProceed = (get() as AuthState & { _checkRateLimit: () => boolean })._checkRateLimit();
        if (!canProceed) {
          set({ isLoading: false });
          return false;
        }

        if (useFirebaseAuth()) {
          try {
            await emailPasswordSignIn(email, password);
            const fbAuth = getFirebaseAuth();
            const fbUser = fbAuth?.currentUser;

            if (fbUser) {
              // Check if email is verified
              if (!fbUser.emailVerified) {
                set({
                  needsVerification: true,
                  pendingVerificationEmail: email,
                  firebaseUser: fbUser,
                  isLoading: false,
                });
                (get() as AuthState & { _resetRateLimit: () => void })._resetRateLimit();
                return false; // Don't proceed until verified
              }

              const user = mapFirebaseUser(fbUser);
              set({
                user,
                needsVerification: false,
                pendingVerificationEmail: null,
                firebaseUser: fbUser,
                isLoading: false,
              });
              (get() as AuthState & { _resetRateLimit: () => void })._resetRateLimit();
              return true;
            }
          } catch (err) {
            (get() as AuthState & { _recordFailedAttempt: () => void })._recordFailedAttempt();
            set({ error: mapFirebaseAuthError(err), isLoading: false });
            return false;
          }
        }

        // Fallback for development without Firebase
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));

          if (email.toLowerCase() === TEST_ACCOUNT.email && password === TEST_ACCOUNT.password) {
            set({
              user: {
                id: '1',
                email: TEST_ACCOUNT.email,
                username: TEST_ACCOUNT.username,
                avatarColor: '#3b82f6',
                emailVerified: true,
              },
              needsVerification: false,
              isLoading: false,
            });
            (get() as AuthState & { _resetRateLimit: () => void })._resetRateLimit();
            return true;
          }

          (get() as AuthState & { _recordFailedAttempt: () => void })._recordFailedAttempt();
          set({ error: 'Invalid email or password', isLoading: false });
          return false;
        } catch {
          (get() as AuthState & { _recordFailedAttempt: () => void })._recordFailedAttempt();
          set({ error: 'Login failed. Please try again.', isLoading: false });
          return false;
        }
      },

      googleLogin: async (idToken: string, accessToken: string) => {
        set({ isLoading: true, error: null });

        if (useFirebaseAuth()) {
          try {
            const fbUser = await googleSignIn(idToken, accessToken);
            const user = mapFirebaseUser(fbUser);
            set({
              user,
              needsVerification: false,
              firebaseUser: fbUser,
              isLoading: false,
            });
            return true;
          } catch (err) {
            set({ error: mapFirebaseAuthError(err), isLoading: false });
            return false;
          }
        }

        set({ error: 'Google sign-in not available', isLoading: false });
        return false;
      },

      signup: async (email: string, password: string, username: string) => {
        set({ isLoading: true, error: null });

        if (useFirebaseAuth()) {
          try {
            const fbUser = await emailPasswordSignUp(email, password, username);
            set({
              needsVerification: true,
              pendingVerificationEmail: email,
              firebaseUser: fbUser,
              isLoading: false,
            });
            return false; // Don't auto-login, wait for verification
          } catch (err) {
            set({ error: mapFirebaseAuthError(err), isLoading: false });
            return false;
          }
        }

        // Fallback for development
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));

          set({
            user: {
              id: '1',
              email,
              username,
              avatarColor: '#3b82f6',
              emailVerified: true,
            },
            needsVerification: false,
            isLoading: false,
          });
          return true;
        } catch {
          set({ error: 'Signup failed. Please try again.', isLoading: false });
          return false;
        }
      },

      resendVerification: async () => {
        const { firebaseUser } = get();
        if (firebaseUser) {
          try {
            await resendVerificationEmail(firebaseUser);
          } catch (err) {
            set({ error: mapFirebaseAuthError(err) });
          }
        }
      },

      checkVerificationStatus: async () => {
        const { firebaseUser } = get();
        if (firebaseUser) {
          try {
            const isVerified = await checkEmailVerification(firebaseUser);
            if (isVerified) {
              const user = mapFirebaseUser(firebaseUser);
              set({
                user,
                needsVerification: false,
                pendingVerificationEmail: null,
              });
              return true;
            }
            return false;
          } catch (err) {
            console.error('Failed to check verification:', err);
            return false;
          }
        }
        return false;
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          await sendPasswordReset(email);
          set({ isLoading: false });
        } catch (err) {
          set({ error: mapFirebaseAuthError(err), isLoading: false });
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
        set({
          user: null,
          firebaseUser: null,
          needsVerification: false,
          pendingVerificationEmail: null,
        });
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

      clearError: () => {
        set({ error: null });
      },

      resetRateLimit: () => {
        set({
          rateLimit: {
            attempts: 0,
            lockedUntil: null,
            lastAttempt: 0,
          },
        });
      },
    }),
    {
      name: 'focusmind-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        rateLimit: state.rateLimit,
      }),
    },
  ),
);
