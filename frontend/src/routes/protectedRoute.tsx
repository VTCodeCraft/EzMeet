import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { AUTH_ROUTES } from "./common/routePaths";
import { Loader } from "@/components/loader";

const ProtectedRoute = () => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (isSignedIn) return <Outlet />;

  return <Navigate to={AUTH_ROUTES.SIGN_IN} replace />;
};

export default ProtectedRoute;