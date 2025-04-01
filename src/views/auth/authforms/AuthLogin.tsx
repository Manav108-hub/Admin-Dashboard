import React, { useState } from "react";
import { Button, Checkbox, Label, TextInput } from "flowbite-react";
import { Link } from "react-router";
import { useAuth } from "src/contexts/AuthContext";
import { FaGoogle } from "react-icons/fa";

const AuthLogin: React.FC = () => {
  const { login, loginWithGoogle, error, clearError } = useAuth();
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberDevice, setRememberDevice] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const handleEmailLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!email || !password) {
      return;
    }
    
    setIsSubmitting(true);
    clearError();
    
    try {
      await login(email, password);
      
      if (rememberDevice) {
        // Store a flag indicating the user wants to be remembered
        // Note: Firebase handles the actual persistence
        localStorage.setItem('rememberDevice', 'true');
      }
      
      // The navigation will happen in the Login component's useEffect
      // when it detects that currentUser has changed
    } catch (error) {
      // Error is handled in the auth context
      console.error('Login failed:', error);
      setIsSubmitting(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    clearError();
    
    try {
      await loginWithGoogle();
      // The navigation will happen in the Login component's useEffect
    } catch (error) {
      // Error is handled in the auth context
      console.error('Google login failed:', error);
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <form onSubmit={handleEmailLogin}>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="email" value="Email" />
          </div>
          <TextInput
            id="email"
            type="email"
            sizing="md"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control form-rounded-xl"
            placeholder="Enter your email"
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
            placeholder="Enter your password"
            disabled={isSubmitting}
          />
        </div>
        
        {error && (
          <div className="mb-4 text-red-500 text-sm">
            {error}
          </div>
        )}
        
        <div className="flex justify-between my-5">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="remember" 
              className="checkbox"
              checked={rememberDevice}
              onChange={() => setRememberDevice(!rememberDevice)}
            />
            <Label
              htmlFor="remember"
              className="opacity-90 font-normal cursor-pointer"
            >
              Remember this Device
            </Label>
          </div>
          <Link to="/auth/forgot-password" className="text-primary text-sm font-medium">
            Forgot Password?
          </Link>
        </div>
        
        <Button 
          type="submit" 
          color="primary" 
          disabled={isSubmitting} 
          className="w-full bg-primary text-white rounded-xl mb-3"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
        
        <Button
          type="button"
          color="light"
          disabled={isSubmitting}
          onClick={handleGoogleLogin}
          className="w-full rounded-xl flex items-center justify-center gap-2"
        >
          <FaGoogle className="text-lg" />
          <span>Sign in with Google</span>
        </Button>
      </form>
    </>
  );
};

export default AuthLogin;