import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { getFirebaseAuth } from './firebase';
import type { User } from '../store/useAuthStore';

function mapFirebaseUser(fu: FirebaseUser): User {
  return {
    id: fu.uid,
    email: fu.email ?? '',
    username: fu.displayName?.trim() || fu.email?.split('@')[0] || 'FocusMind',
    avatarColor: '#6366f1',
    emailVerified: fu.emailVerified,
  };
}

/** Wire Firebase auth session into local profile state (no circular imports). */
export function subscribeFirebaseAuth(setUser: (user: User | null) => void): () => void {
  const firebaseAuth = getFirebaseAuth();
  if (!firebaseAuth) {
    return () => undefined;
  }
  return onAuthStateChanged(firebaseAuth, (fu) => {
    setUser(fu ? mapFirebaseUser(fu) : null);
  });
}
