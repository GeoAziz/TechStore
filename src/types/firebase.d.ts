declare module 'firebase/firestore' {
  export function collection(db: any, ...pathSegments: string[]): any;
  export function doc(db: any, ...pathSegments: string[]): any;
  export function onSnapshot(query: any, onNext: (snapshot: any) => void, onError?: (error: Error) => void): () => void;
  export function query(query: any, ...queryConstraints: any[]): any;
  export function orderBy(field: string, direction?: 'asc' | 'desc'): any;
  export function limit(limit: number): any;
  export function updateDoc(docRef: any, data: any): Promise<void>;
  export function getDocs(query: any): Promise<any>;
  export function getDoc(docRef: any): Promise<any>;
  export function addDoc(collectionRef: any, data: any): Promise<any>;
  export function deleteDoc(docRef: any): Promise<void>;
  export function where(field: string, op: string, value: any): any;
  export function setDoc(docRef: any, data: any, options?: any): Promise<void>;
  export function increment(n: number): any;
  export function arrayUnion(...elements: any[]): any;
  export function arrayRemove(...elements: any[]): any;
  export function serverTimestamp(): any;
  export function runTransaction(db: any, fn: (transaction: any) => Promise<any>): Promise<any>;
  export function writeBatch(db: any): any;
  export function getFirestore(app?: any): any;
  export const Timestamp: any;
  export const FieldValue: any;
}

declare module 'firebase/firestore/dist/esm/index.esm.js' {
  export * from 'firebase/firestore';
}

declare module 'firebase/app' {
  export function initializeApp(config: any): any;
  export function getApp(name?: string): any;
  export function getApps(): any[];
}

declare module 'firebase/auth' {
  export function getAuth(app?: any): any;
  export function onAuthStateChanged(auth: any, next: (user: any) => void): () => void;
  export function signInWithEmailAndPassword(auth: any, email: string, password: string): Promise<any>;
  export function createUserWithEmailAndPassword(auth: any, email: string, password: string): Promise<any>;
  export function signOut(auth: any): Promise<void>;
  export function updateProfile(user: any, profile: any): Promise<void>;
  export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    metadata?: {
      creationTime?: string;
      lastSignInTime?: string;
    };
  }
}

declare module 'firebase/analytics' {
  export function getAnalytics(app?: any): any;
  export function isSupported(): Promise<boolean>;
  export function logEvent(analyticsInstance: any, eventName: string, eventParams?: any): void;
}
