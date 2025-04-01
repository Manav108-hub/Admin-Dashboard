import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import FullLogo from "src/layouts/full/shared/logo/FullLogo";
import AuthRegister from "../authforms/AuthRegister";
import { useAuth } from "src/contexts/AuthContext";

const gradientStyle = {
  background: "linear-gradient(45deg, rgb(238, 119, 82,0.2), rgb(231, 60, 126,0.2), rgb(35, 166, 213,0.2), rgb(35, 213, 171,0.2))",
  backgroundSize: "400% 400%",
  animation: "gradient 15s ease infinite",
  height: "100vh",
  overflow: "hidden",
};

const Register: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (currentUser && !isLoading) {
      navigate('/auth/login');
    }
  }, [currentUser, isLoading, navigate]);

  // If still loading auth state, show a spinner
  if (isLoading) {
    return (
      <div style={gradientStyle} className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div style={gradientStyle} className="relative overflow-hidden h-screen">
      <div className="flex h-full justify-center items-center px-4">
        <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative break-words md:w-96 w-full border-none">
          <div className="flex h-full flex-col justify-center gap-2 p-0 w-full">
            <div className="mx-auto">
              <FullLogo />
            </div>
            <p className="text-sm text-center text-dark my-3">
              Sign Up on MatDash
            </p>
            <AuthRegister />
            <div className="flex gap-2 text-base text-ld font-medium mt-6 items-center justify-center">
              <p>Already have an Account?</p>
              <Link to="/auth/login" className="text-primary text-sm font-medium">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;