import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import type { FocusSession } from '../store/useFocusStore';
import { getFirebaseFirestore, isFirebaseConfigured } from './firebase';

/** Persist a completed session under `users/{userId}/sessions` when Firestore is available. */
export async function syncCompletedSessionRemote(
  userId: string,
  session: FocusSession,
): Promise<void> {
  if (!isFirebaseConfigured()) {
    return;
  }
  const db = getFirebaseFirestore();
  if (!db) {
    return;
  }
  await addDoc(collection(db, 'users', userId, 'sessions'), {
    name: session.name,
    duration: session.duration,
    rating: session.rating,
    note: session.note ?? null,
    date: session.date,
    coinsEarned: session.coinsEarned,
    type: session.type,
    ambientIds: session.ambientIds ?? [],
    createdAt: serverTimestamp(),
  });
}
