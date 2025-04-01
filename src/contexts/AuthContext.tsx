import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  UserCredential,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  loginWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Set up auth state listener when the component mounts
  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // Set persistence to LOCAL to keep user logged in
    setPersistence(auth, browserLocalPersistence)
      .catch((error) => {
        console.error('Error setting persistence:', error);
      });

    // Set up the auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? `User ${user.uid} logged in` : "No user");
      setCurrentUser(user);
      setIsLoading(false);
    }, (error) => {
      console.error("Auth state change error:", error);
      setError(error.message);
      setIsLoading(false);
    });

    // Clean up the listener when the component unmounts
    return () => {
      console.log("Cleaning up auth state listener");
      unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    setError(null);
    try {
      console.log("Signing up user:", email);
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error("Sign up error:", err);
      setError(err.message || 'An error occurred during sign up');
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      console.log("Logging in user:", email);
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || 'Invalid email or password');
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    try {
      console.log("Logging in with Google");
      return await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(err.message || 'Error signing in with Google');
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      console.log("Logging out user");
      await signOut(auth);
    } catch (err: any) {
      console.error("Logout error:", err);
      setError(err.message || 'Error signing out');
      throw err;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    currentUser,
    isLoading,
    error,
    signUp,
    login,
    loginWithGoogle,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};