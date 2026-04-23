import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithCredential,
  type User,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { getFirebaseAuth, getFirebaseFirestore } from './firebase';
import { createVerificationCode, verifyCode, clearVerificationCode } from './verificationCodeService';

export function mapFirebaseAuthError(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password';
      case 'auth/email-already-in-use':
        return 'Email is already in use';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/requires-recent-login':
        return 'Please sign in again to continue.';
      case 'auth/unverified-email':
        return 'Please verify your email first.';
      default:
        return 'Something went wrong. Try again.';
    }
  }
  return 'Something went wrong. Try again.';
}

// Rate limiting for login attempts
interface LoginAttempt {
  count: number;
  lastAttempt: number;
  lockedUntil: number | null;
}

const RATE_LIMIT_KEY = 'login_rate_limit';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export function getLoginAttempts(): LoginAttempt {
  // Note: This is a simple in-memory rate limit.
  // For production, use Firestore to track attempts per email.
  return {
    count: 0,
    lastAttempt: 0,
    lockedUntil: null,
  };
}

export function isRateLimited(): { locked: boolean; remainingSeconds: number } {
  const attempts = getLoginAttempts();
  if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
    return {
      locked: true,
      remainingSeconds: Math.ceil((attempts.lockedUntil - Date.now()) / 1000),
    };
  }
  return { locked: false, remainingSeconds: 0 };
}

export function recordLoginAttempt(success: boolean): void {
  // This is a placeholder - in production, track per-email in Firestore
  // with security rules preventing user tampering
}

export async function emailPasswordSignIn(email: string, password: string): Promise<void> {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    throw new Error('Firebase Auth is not configured');
  }

  // Check rate limiting
  const rateLimit = isRateLimited();
  if (rateLimit.locked) {
    throw new Error(`Too many failed attempts. Try again in ${Math.ceil(rateLimit.remainingSeconds / 60)} minutes.`);
  }

  try {
    await signInWithEmailAndPassword(firebaseAuth, email, password);
    recordLoginAttempt(true);
  } catch (err) {
    recordLoginAttempt(false);
    throw err;
  }
}

export async function checkUsernameExists(username: string): Promise<boolean> {
  const db = getFirebaseFirestore();
  if (!db) {
    // Development fallback
    return false;
  }

  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username.toLowerCase().trim()));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

export async function emailPasswordSignUp(
  email: string,
  password: string,
  username: string,
): Promise<{ user: User; verificationCode: string }> {
  const firebaseAuth = getFirebaseAuth();
  const db = getFirebaseFirestore();
  if (!firebaseAuth) {
    throw new Error('Firebase Auth is not configured');
  }

  // Check if username already exists
  const usernameExists = await checkUsernameExists(username);
  if (usernameExists) {
    throw new Error('USERNAME_TAKEN');
  }

  const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  await updateProfile(cred.user, { displayName: username.trim() || username });

  // Generate 6-digit verification code
  const verificationCode = await createVerificationCode(email);

  if (db) {
    await setDoc(
      doc(db, 'users', cred.user.uid),
      {
        username: username.trim().toLowerCase(),
        email: email.toLowerCase(),
        avatarColor: '#6366f1',
        emailVerified: false,
        createdAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  return { user: cred.user, verificationCode };
}

export async function verifyEmailCode(email: string, code: string): Promise<boolean> {
  return await verifyCode(email, code);
}

export async function resendVerificationCode(email: string): Promise<string> {
  return await createVerificationCode(email);
}

export async function markUserAsVerified(userId: string): Promise<void> {
  const db = getFirebaseFirestore();
  if (!db) {
    return;
  }

  await setDoc(
    doc(db, 'users', userId),
    {
      emailVerified: true,
      verifiedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function sendPasswordReset(email: string): Promise<void> {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    throw new Error('Firebase Auth is not configured');
  }
  await sendPasswordResetEmail(firebaseAuth, email);
}

export async function googleSignIn(idToken: string, accessToken: string): Promise<User> {
  const firebaseAuth = getFirebaseAuth();
  const db = getFirebaseFirestore();
  if (!firebaseAuth) {
    throw new Error('Firebase Auth is not configured');
  }

  const credential = GoogleAuthProvider.credential(idToken, accessToken);
  const cred = await signInWithCredential(firebaseAuth, credential);

  // Check if new user and create profile
  if (db) {
    const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
    if (!userDoc.exists()) {
      await setDoc(
        doc(db, 'users', cred.user.uid),
        {
          username: cred.user.displayName || cred.user.email?.split('@')[0] || 'FocusMind User',
          email: cred.user.email,
          avatarColor: '#6366f1',
          emailVerified: cred.user.emailVerified,
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );
    }
  }

  return cred.user;
}

export async function signOutFirebase(): Promise<void> {
  const firebaseAuth = getFirebaseAuth();
  if (firebaseAuth) {
    await signOut(firebaseAuth);
  }
}

export async function checkEmailVerification(user: User): Promise<boolean> {
  // Reload user to get latest emailVerified status
  await user.reload();
  return user.emailVerified;
}
