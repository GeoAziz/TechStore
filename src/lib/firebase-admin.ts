
import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App;
let db: Firestore;

const getServiceAccount = (): ServiceAccount => {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  // In a production/deployment environment (like Vercel), the service account must be set as an environment variable.
  if (process.env.NODE_ENV === 'production') {
    if (!serviceAccountString) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set for production build.');
    }
    return JSON.parse(serviceAccountString);
  } else {
    // For local development, we can use the environment variable if it's set, 
    // otherwise, we fall back to the local JSON file.
    if (serviceAccountString) {
      return JSON.parse(serviceAccountString);
    } else {
      // This require should only be executed in a local development environment.
      return require('../../serviceAccountKey.json');
    }
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
