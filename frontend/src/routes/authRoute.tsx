import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { PROTECTED_ROUTES } from "./common/routePaths";
import { Loader } from "@/components/loader";

const AuthRoute = () => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!isSignedIn) return <Outlet />;

  return <Navigate to={PROTECTED_ROUTES.EVENT_TYPES} replace />;
};

export default AuthRoute;