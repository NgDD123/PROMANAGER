console.log('Loading backend/src/utils/firebase.js');
import admin from 'firebase-admin';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

export const initFirebase = async (serviceAccountPath = process.env.SERVICE_ACCOUNT_PATH || './firebase-service-account.json') => {
  if (!fs.existsSync(serviceAccountPath)) {
    console.warn('Service account not found at', serviceAccountPath);
    throw new Error('Firebase service account JSON missing. Place it or set SERVICE_ACCOUNT_PATH in .env');
  }
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'e-pharmc.appspot.com', // 🔹 add your bucket name here
    });
    console.log('Firebase Admin initialized with Storage Bucket');
  } else {
    console.log('Firebase Admin already initialized');
  }
};

export const db = () => admin.firestore();
export default admin;
