import React, { useState, useEffect } from "react";
import { Card, Button, Alert, Spinner } from "flowbite-react";
import { useNavigate } from "react-router";
import { useAuth } from "../../../contexts/AuthContext";
import { sendEmailVerification } from "firebase/auth";
import { HiOutlineMail, HiOutlineCheckCircle, HiOutlineExclamation } from "react-icons/hi";

const EmailVerification: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [refreshingUser, setRefreshingUser] = useState<boolean>(false);

  // Redirect if no user is logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.emailVerified) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  // Countdown timer for resending verification email
  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  // Check for email verification status periodically
  useEffect(() => {
    let interval: number | null = null;
    
    if (currentUser && !currentUser.emailVerified) {
      interval = window.setInterval(async () => {
        try {
          setRefreshingUser(true);
          await currentUser.reload();
          if (currentUser.emailVerified) {
            navigate('/dashboard');
          }
        } catch (err) {
          console.error('Error refreshing user:', err);
        } finally {
          setRefreshingUser(false);
        }
      }, 5000); // Check every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentUser, navigate]);

  const handleResendVerification = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await sendEmailVerification(currentUser);
      setSuccess('Verification email sent! Please check your inbox or spam folder.');
      setTimeLeft(60); // Set cooldown period to 60 seconds
    } catch (err: any) {
      setError(err.message || 'Failed to send verification email. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <Card>
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <HiOutlineMail className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
          <p className="text-gray-600 mb-6">
            A verification email has been sent to:
            <span className="block font-semibold text-gray-800 mt-1">{currentUser.email}</span>
          </p>
          
          {refreshingUser && (
            <div className="flex justify-center items-center gap-2 text-sm text-gray-500 mb-4">
              <Spinner size="sm" />
              <span>Checking verification status...</span>
            </div>
          )}
          
          {error && (
            <Alert color="failure" className="mb-4" icon={HiOutlineExclamation}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert color="success" className="mb-4" icon={HiOutlineCheckCircle}>
              {success}
            </Alert>
          )}
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <ol className="list-decimal list-inside text-left space-y-2 text-gray-600">
              <li>Click the verification link in your email</li>
              <li>The link will open in a new window</li>
              <li>Return to this page after verification</li>
              <li>You'll be automatically redirected after verification</li>
            </ol>
          </div>
          
          <div className="space-y-3">
            <Button
              color="primary"
              className="w-full"
              onClick={handleResendVerification}
              disabled={loading || timeLeft > 0}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Sending...
                </>
              ) : timeLeft > 0 ? (
                `Resend email in ${timeLeft}s`
              ) : (
                'Resend verification email'
              )}
            </Button>
            
            <Button color="light" className="w-full" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmailVerification;