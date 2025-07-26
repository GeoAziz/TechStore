
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import serviceAccount from '../../serviceAccountKey.json' with { type: 'json' };

// Demo users to seed
const demoUsers = [
  { role: 'admin',  email: 'admin@demo.com',  name: 'Admin User' },
  { role: 'author', email: 'author@demo.com', name: 'Author User' },
  { role: 'vendor', email: 'vendor@demo.com', name: 'Vendor User' },
  { role: 'client', email: 'client@demo.com', name: 'Client User' },
];
const password = 'password123';

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert(serviceAccount),
});
const db = getFirestore(app);
const auth = getAuth(app);

async function seedUsers() {
  console.log('Seeding demo users in Auth and Firestore...');
  const usersCol = db.collection('users');

  for (const user of demoUsers) {
    let userRecord;
    try {
      // Try to create user in Firebase Auth
      userRecord = await auth.createUser({
        email: user.email,
        password: password,
        displayName: user.name,
      });
      console.log(`Created Auth user: ${user.email}`);
    } catch (err) {
      if (err.code === 'auth/email-already-exists') {
        // If user already exists, fetch their record
        userRecord = await auth.getUserByEmail(user.email);
        console.log(`Auth user already exists: ${user.email}`);
      } else {
        console.error(`Error creating Auth user for ${user.email}:`, err);
        continue;
      }
    }

    // Create Firestore user document
    await usersCol.doc(userRecord.uid).set({
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: new Date().toISOString(),
    });
    console.log(`Seeded Firestore user: ${user.role} (${user.email})`);
  }
  console.log('✅ Demo users seeded in Auth and Firestore.');
}

seedUsers().catch(err => {
  console.error('Error seeding users:', err);
  process.exit(1);
});
