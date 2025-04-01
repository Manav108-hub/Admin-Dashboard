import React, { useState } from "react";
import { Button, Label, TextInput, Alert } from "flowbite-react";
import { useNavigate } from "react-router";
import { useAuth } from "../../../contexts/AuthContext";
import { FaGoogle } from "react-icons/fa";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase/config";
import { sendEmailVerification } from "firebase/auth";

const AuthRegister: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, loginWithGoogle, error, clearError } = useAuth();
  
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [verificationSent, setVerificationSent] = useState<boolean>(false);
  
  const validateForm = () => {
    clearError();
    setValidationError(null);
    
    if (!name.trim()) {
      setValidationError("Name is required");
      return false;
    }
    
    if (!email.trim()) {
      setValidationError("Email is required");
      return false;
    }
    
    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters");
      return false;
    }
    
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return false;
    }
    
    return true;
  };
  
  const saveUserDataToFirestore = async (userId: string) => {
    try {
      await setDoc(doc(db, 'users', userId), {
        name,
        email,
        emailVerified: false,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };
  
  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await signUp(email, password);
      if (result.user) {
        // Send email verification
        await sendEmailVerification(result.user);
        setVerificationSent(true);
        
        // Save additional user data to Firestore
        await saveUserDataToFirestore(result.user.uid);
        
        // Don't navigate to dashboard yet - wait for verification
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGoogleSignUp = async () => {
    setIsSubmitting(true);
    clearError();
    
    try {
      const result = await loginWithGoogle();
      if (result.user) {
        const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;
        
        if (isNewUser) {
          // User was just created with Google, save additional data
          await saveUserDataToFirestore(result.user.uid);
        }
        
        // Google authentication already verifies email, so we can navigate directly
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Google registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (verificationSent) {
    return (
      <div className="text-center">
        <Alert color="info" className="mb-4">
          <h3 className="text-lg font-medium">Verification Email Sent!</h3>
          <p>We've sent a verification email to <strong>{email}</strong></p>
        </Alert>
        
        <p className="mb-4">
          Please check your inbox and click the verification link to activate your account.
          If you don't see the email, check your spam folder.
        </p>
        
        <div className="mt-6">
          <Button color="primary" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <form onSubmit={handleRegister}>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="name" value="Name" />
          </div>
          <TextInput
            id="name"
            type="text"
            sizing="md"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-control form-rounded-xl"
            placeholder="Enter your full name"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="email" value="Email Address" />
          </div>
          <TextInput
            id="email"
            type="email"
            sizing="md"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control form-rounded-xl"
            placeholder="Enter your email address"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="password" value="Password" />
          </div>
          <TextInput
            id="password"
            type="password"
            sizing="md"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control form-rounded-xl"
            placeholder="Create a password"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="mb-6">
          <div className="mb-2 block">
            <Label htmlFor="confirmPassword" value="Confirm Password" />
          </div>
          <TextInput
            id="confirmPassword"
            type="password"
            sizing="md"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="form-control form-rounded-xl"
            placeholder="Confirm your password"
            disabled={isSubmitting}
          />
        </div>
        
        {(validationError || error) && (
          <div className="mb-4 text-red-500 text-sm">
            {validationError || error}
          </div>
        )}
        
        <Button 
          color="primary" 
          type="submit" 
          className="w-full mb-3"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Account...' : 'Sign Up'}
        </Button>
        
        <Button
          type="button"
          color="light"
          disabled={isSubmitting}
          onClick={handleGoogleSignUp}
          className="w-full rounded-xl flex items-center justify-center gap-2"
        >
          <FaGoogle className="text-lg" />
          <span>Sign up with Google</span>
        </Button>
      </form>
    </>
  );
};

export default AuthRegister;