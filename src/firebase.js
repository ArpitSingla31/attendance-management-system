import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDgJfKnq9CJ0rUUCJTJ53zd0xdV9R5oxD0',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'attendance-management-sy-7ed53.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'attendance-management-sy-7ed53',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'attendance-management-sy-7ed53.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '262887103847',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:262887103847:web:69a3cceda124d01bfae3c2',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-FCPGQRWP13'
};

export const firebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId);
const app = firebaseConfigured ? initializeApp(firebaseConfig) : null;
export const firebaseAuth = app ? getAuth(app) : null;
