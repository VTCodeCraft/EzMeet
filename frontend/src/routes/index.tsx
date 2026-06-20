import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@clerk/react";
import {
  authenticationRoutePaths,
  protectedRoutePaths,
  publicRoutePaths,
} from "./common/routes";
import { AUTH_ROUTES, PROTECTED_ROUTES } from "./common/routePaths";
import AppLayout from "@/layout/app-layout";
import BaseLayout from "@/layout/base-layout";
import AuthRoute from "./authRoute";
import ProtectedRoute from "./protectedRoute";
import { Loader } from "@/components/loader";

// Root "/" sends users to the app or sign-in depending on their auth state.
const RootRedirect = () => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <Navigate
      to={isSignedIn ? PROTECTED_ROUTES.EVENT_TYPES : AUTH_ROUTES.SIGN_IN}
      replace
    />
  );
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        {/* Authentication (signed-out only) */}
        <Route element={<AuthRoute />}>
          <Route element={<BaseLayout />}>
            {authenticationRoutePaths.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Route>
        </Route>

        {/* Protected app */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {protectedRoutePaths.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Route>
        </Route>

        {/* Public booking pages */}
        <Route element={<BaseLayout />}>
          {publicRoutePaths.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>

        {/* Catch-all for undefined routes */}
        <Route path="*" element={<>404</>} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;