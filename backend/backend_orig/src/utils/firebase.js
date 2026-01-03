import admin from 'firebase-admin';
import fs from 'fs';
export const initFirebase = async (serviceAccountPath='./firebase-service-account.json')=>{
  if(!fs.existsSync(serviceAccountPath)) throw new Error('Service account JSON missing at ' + serviceAccountPath);
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath,'utf8'));
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  console.log('Firebase initialized');
};
export const db = ()=> admin.firestore();
export default admin;
