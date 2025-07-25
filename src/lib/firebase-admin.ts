
import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App;
let db: Firestore;

const getServiceAccount = (): ServiceAccount => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // This is for local development, you would need to have the serviceAccountKey.json file
    // In production, the environment variable should be used.
    // Make sure to add the `with { type: 'json' }` for local dev if you haven't already.
    return require('../../serviceAccountKey.json');
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
