import { initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';

/**
 * The web app config of the MiniGames Firebase project. Vite reads it from
 * .env.local on a developer's machine and from the repository variables in the
 * deploy (see .env.example). It is not a secret: it only names the project,
 * whose Firestore rules decide what a page may do.
 */
function readFirebaseOptions(): FirebaseOptions {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
}

const started: { app?: FirebaseApp } = {};

/**
 * The Firebase app, started once. It has the default name and the config of
 * MiniGames, so it finds the user MiniGames signed in: Firebase keeps the user
 * in the site's IndexedDB under the API key and the app name.
 */
export function getFirebaseApp(): FirebaseApp {
  started.app ??= initializeApp(readFirebaseOptions());

  return started.app;
}
