import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

// Authentication wrapper with role-based access control and redirects
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isSignedIn, isLoaded, user } = useUser();
  const { pathname } = useLocation();

  // Show nothing while loading user data
  if (!isLoaded) return null;

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    return <Navigate to="/?sign-in=true" />;
  }

  const role = user?.unsafeMetadata?.role;

  // Check if user has the required role for this route
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // Auto-redirect admins to admin panel
  if (role === "admin" && pathname !== "/admin") {
    return <Navigate to="/admin" />;
  }

  // Prevent non-admins from accessing admin routes
  if (role !== "admin" && pathname === "/admin") {
    return <Navigate to="/" replace />;
  }

  // Redirect users without roles to onboarding flow
  if (!role && pathname !== "/onboarding") {
    return <Navigate to="/onboarding" />;
  }

  // Render protected content if all checks pass
  return children;
};

export default ProtectedRoute;