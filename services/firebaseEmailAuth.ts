import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { getFirebaseAuth, getFirebaseFirestore } from './firebase';

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
      default:
        return 'Something went wrong. Try again.';
    }
  }
  return 'Something went wrong. Try again.';
}

export async function emailPasswordSignIn(email: string, password: string): Promise<void> {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    throw new Error('Firebase Auth is not configured');
  }
  await signInWithEmailAndPassword(firebaseAuth, email, password);
}

export async function emailPasswordSignUp(
  email: string,
  password: string,
  username: string,
): Promise<void> {
  const firebaseAuth = getFirebaseAuth();
  const db = getFirebaseFirestore();
  if (!firebaseAuth) {
    throw new Error('Firebase Auth is not configured');
  }
  const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  await updateProfile(cred.user, { displayName: username.trim() || username });
  if (db) {
    await setDoc(
      doc(db, 'users', cred.user.uid),
      {
        username: username.trim(),
        email,
        avatarColor: '#6366f1',
        createdAt: serverTimestamp(),
      },
      { merge: true },
    );
  }
}

export async function signOutFirebase(): Promise<void> {
  const firebaseAuth = getFirebaseAuth();
  if (firebaseAuth) {
    await signOut(firebaseAuth);
  }
}
