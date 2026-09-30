/**
 * Firebase stub — ready to wire in one step during the hackathon.
 *
 * To activate:
 *   1. npm i firebase
 *   2. Fill NEXT_PUBLIC_FIREBASE_* vars in .env.local (see .env.example)
 *   3. Uncomment the commented block below.
 *
 * No SDK is installed yet — installing firebase costs nothing until used.
 */

import { getIntegrationStatus } from "@/lib/integrations/status";

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export function isFirebaseConfigured(): boolean {
  return getIntegrationStatus().firebase.configured;
}

export function getFirebaseConfig(): FirebaseConfig | null {
  if (!isFirebaseConfigured()) return null;
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  };
}

/**
 * Returns a initialized FirebaseApp. Throws with setup instructions until
 * `npm i firebase` is run and env vars are set.
 */
// import { initializeApp, getApp, getApps } from "firebase/app";
export function getFirebaseApp(): never {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase not configured. Add NEXT_PUBLIC_FIREBASE_* vars to .env.local (see HACKATHON.md → Connect Firebase).",
    );
  }
  throw new Error(
    "Firebase SDK not installed. Run `npm i firebase`, then implement getFirebaseApp() in lib/integrations/firebase.ts.",
  );
  // Implementation once installed:
  // return getApps().length ? getApp() : initializeApp(getFirebaseConfig()!);
}
