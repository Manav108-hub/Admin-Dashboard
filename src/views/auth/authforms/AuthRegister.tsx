import React, { useState } from "react";
import { Button, Label, TextInput } from "flowbite-react";
import { useNavigate } from "react-router";
import { useAuth } from "../../../contexts/AuthContext";
import { FaGoogle } from "react-icons/fa";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase/config";

const AuthRegister: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, loginWithGoogle, error, clearError } = useAuth();
  
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
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
        // Save additional user data to Firestore
        await saveUserDataToFirestore(result.user.uid);
      }
      navigate('/dashboard');
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
      if (result.user && result.user.metadata.creationTime === result.user.metadata.lastSignInTime) {
        // User was just created with Google, save additional data
        await saveUserDataToFirestore(result.user.uid);
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Google registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
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