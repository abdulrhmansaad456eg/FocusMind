// Verification Code Service
// Generates and verifies 6-digit codes for email verification
// Stores codes in Firestore with expiration

import { doc, setDoc, getDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { getFirebaseFirestore } from './firebase';

const VERIFICATION_CODE_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 3;

interface VerificationData {
  code: string;
  email: string;
  attempts: number;
  createdAt: Timestamp;
  verified: boolean;
}

function generateSixDigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createVerificationCode(email: string): Promise<string> {
  const db = getFirebaseFirestore();
  if (!db) {
    throw new Error('Firestore not configured');
  }

  const code = generateSixDigitCode();
  const verificationRef = doc(db, 'verificationCodes', email.toLowerCase());

  await setDoc(verificationRef, {
    code,
    email: email.toLowerCase(),
    attempts: 0,
    createdAt: serverTimestamp(),
    verified: false,
  });

  return code;
}

export async function verifyCode(email: string, code: string): Promise<boolean> {
  const db = getFirebaseFirestore();
  if (!db) {
    // Development fallback
    return code === '123456';
  }

  const verificationRef = doc(db, 'verificationCodes', email.toLowerCase());
  const snapshot = await getDoc(verificationRef);

  if (!snapshot.exists()) {
    return false;
  }

  const data = snapshot.data() as VerificationData;

  // Check if already verified
  if (data.verified) {
    return false;
  }

  // Check expiration
  const now = Timestamp.now();
  const expiryTime = Timestamp.fromMillis(
    data.createdAt.toMillis() + VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000
  );

  if (now.toMillis() > expiryTime.toMillis()) {
    await deleteDoc(verificationRef);
    return false;
  }

  // Check max attempts
  if (data.attempts >= MAX_ATTEMPTS) {
    await deleteDoc(verificationRef);
    return false;
  }

  // Increment attempts
  await setDoc(verificationRef, { attempts: data.attempts + 1 }, { merge: true });

  // Verify code
  if (data.code === code) {
    await setDoc(verificationRef, { verified: true }, { merge: true });
    return true;
  }

  return false;
}

export async function clearVerificationCode(email: string): Promise<void> {
  const db = getFirebaseFirestore();
  if (!db) {
    return;
  }

  const verificationRef = doc(db, 'verificationCodes', email.toLowerCase());
  await deleteDoc(verificationRef);
}
