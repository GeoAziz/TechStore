
import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App;
let db: Firestore;

const getServiceAccount = (): ServiceAccount => {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (!serviceAccountString) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set. Please provide it in your .env file or environment configuration.');
  }
  
  try {
    return JSON.parse(serviceAccountString);
  } catch (error) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT. Make sure it's a valid JSON string.", error);
    throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT format.");
  }
};

if (!getApps().length) {
  app = initializeApp({
    credential: cert(getServiceAccount()),
  });
  db = getFirestore(app);
} else {
  app = getApps()[0];
  db = getFirestore(app);
}

export { db };
