import { getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, initializeAuth, type Auth, type Persistence } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

function reactNativeAuthPersistence(): Persistence {
  // Metro resolves `@firebase/auth` to the RN build; TypeScript uses web typings only.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getReactNativePersistence } = require('@firebase/auth') as {
    getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
  };
  return getReactNativePersistence(AsyncStorage);
}

export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY &&
      process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  );
}

function readFirebaseOptions(): FirebaseOptions {
  return {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) {
    return null;
  }
  if (app) {
    return app;
  }
  app = getApps().length ? getApps()[0]! : initializeApp(readFirebaseOptions());
  return app;
}

export function getFirebaseAuth(): Auth | null {
  const application = getFirebaseApp();
  if (!application) {
    return null;
  }
  if (auth) {
    return auth;
  }
  try {
    auth = initializeAuth(application, {
      persistence: reactNativeAuthPersistence(),
    });
  } catch {
    auth = getAuth(application);
  }
  return auth;
}

export function getFirebaseFirestore(): Firestore | null {
  const application = getFirebaseApp();
  if (!application) {
    return null;
  }
  if (!firestore) {
    firestore = getFirestore(application);
  }
  return firestore;
}
