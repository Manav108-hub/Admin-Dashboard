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
  setPersistence,
  verifyBeforeUpdateEmail,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  loginWithGoogle: () => Promise<UserCredential>;
  sendVerificationEmail: () => Promise<void>;
  isEmailVerified: () => boolean;
  resetPassword: (email: string) => Promise<void>;
  updateEmail: (newEmail: string) => Promise<void>; 
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

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .catch((error) => {
        console.error('Error setting persistence:', error);
      });

    // Set up the auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    }, (error) => {
      console.error("Auth state change error:", error);
      setError(error.message);
      setIsLoading(false);
    });

    // Clean up the listener when the component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      return userCredential
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up');
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);
    try {
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

  const sendVerificationEmail = async () => {
    setError(null);
    if (!currentUser) {
      setError('No user is currently logged in');
      throw new Error('No user is currently logged in');
    }
    
    try {
      await sendEmailVerification(currentUser);
    } catch (err: any) {
      console.error("Email verification error:", err);
      setError(err.message || 'Error sending verification email');
      throw err;
    }
  };

  const updateEmail = async (newEmail: string) => {
    setError(null);
    if (!currentUser) {
      setError('No user is currently logged in.');
      throw new Error('No user is currently logged in');
    }

    try {
      await verifyBeforeUpdateEmail(currentUser, newEmail);
    } catch (err: any) {
      console.error("Email update error:", err);
      setError(err.message || 'Error updating email');
      throw err;
    }
  }

  const isEmailVerified = () => {
    return currentUser?.emailVerified || false;
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError(err.message || 'Error sending password reset email');
      throw err;
    }
  };

  const value = {
    currentUser,
    isLoading,
    error,
    signUp,
    login,
    loginWithGoogle,
    logout,
    clearError,
    sendVerificationEmail,
    updateEmail,
    isEmailVerified,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};