import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, UserCredential, updateProfile } from 'firebase/auth';

interface AuthContextType {
  user: {
    name: string | null;
    email: string | null;
    avatar: string | null;
  } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<UserCredential>;
  setUser: React.Dispatch<React.SetStateAction<{ name: string | null; email: string | null; avatar: string | null; } | null>>;
  isAuthChecked: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<{ name: string | null; email: string | null; avatar: string | null } | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false); // flag to track if the auth state is checked

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          avatar: firebaseUser.photoURL || '/default-avatar.jpg', // fallback to a default avatar
        };
        setUser(userData);
      } else {
        setUser(null);
      }
      setIsAuthChecked(true); // ✅ Set to true regardless of whether the user is logged in or not
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw new Error('Error logging in');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error('Error logging out');
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: email.split('@')[0], // Simple example of setting display name based on email
        photoURL: '/default-avatar.jpg', // Set a default avatar
      });
      return userCredential;
    } catch (error) {
      throw new Error('Error signing up');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, setUser, isAuthChecked }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
