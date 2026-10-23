
"use client";

import React from 'react';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import type { UserProfile } from '@/lib/types';


import type { UserRole } from '@/lib/types';

function setSessionCookies(token: string | null) {
  if (typeof document === 'undefined') return;
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  if (token) {
    document.cookie = `__session=${token}; path=/; max-age=3600; SameSite=Lax${isSecure}`;
    document.cookie = `firebaseAuthSession=${token}; path=/; max-age=3600; SameSite=Lax${isSecure}`;
  } else {
    document.cookie = `__session=; path=/; max-age=0; SameSite=Lax${isSecure}`;
    document.cookie = `firebaseAuthSession=; path=/; max-age=0; SameSite=Lax${isSecure}`;
  }
}

interface AuthContextType {
  user: (User & { role?: UserRole, photoURL?: string | null }) | null;
  loading: boolean;
  role: UserRole | null;
  handleLogout: () => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  updateUserProfile: (data: { displayName?: string, photoURL?: string}) => Promise<void>;
  isAddProductDialogOpen: boolean;
  setAddProductDialogOpen: (open: boolean) => void;
  handleAddProductClick: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: null,
  handleLogout: () => {},
  isSidebarOpen: true,
  setSidebarOpen: () => {},
  updateUserProfile: async () => {},
  isAddProductDialogOpen: false,
  setAddProductDialogOpen: () => {},
  handleAddProductClick: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isAddProductDialogOpen, setAddProductDialogOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();


  const handleLogout = async () => {
    setSessionCookies(null);
    await signOut(auth);
    router.push('/login');
  };
  
  const handleAddProductClick = () => {
    setAddProductDialogOpen(true);
  }

  const updateUserProfileInContext = async (data: { displayName?: string, photoURL?: string}) => {
    if (auth.currentUser) {
        await updateProfile(auth.currentUser, data);
        // To reflect changes immediately, we manually update the user state
        const updatedUser = { ...auth.currentUser, ...data, role: role as UserRole };
        setUser(updatedUser);
        
        // Also update firestore
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userDocRef, { 
            displayName: data.displayName || auth.currentUser.displayName,
            photoURL: data.photoURL || auth.currentUser.photoURL
        }, { merge: true });
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          setSessionCookies(token);
        } catch (err) {
          console.warn('Could not extract ID token:', err);
        }

        // Fetch user role and other data from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        let userRole: UserRole = 'client'; // Default role
        let userDataFromDb: Partial<UserProfile> = {};

        if (userDoc.exists()) {
          const dbData = userDoc.data() as UserProfile;
          userRole = dbData.role || 'client';
          userDataFromDb = dbData;
        } else {
          // If user doc doesn't exist, create it
           await setDoc(userDocRef, {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                role: 'client',
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL
            }, { merge: true });
        }
        
        setRole(userRole);
        setUser({ ...firebaseUser, ...userDataFromDb, role: userRole });

      } else {
        setSessionCookies(null);
        setRole(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  return (
    <AuthContext.Provider value={{ user, loading, role, handleLogout, isSidebarOpen, setSidebarOpen, updateUserProfile: updateUserProfileInContext, isAddProductDialogOpen, setAddProductDialogOpen, handleAddProductClick }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
