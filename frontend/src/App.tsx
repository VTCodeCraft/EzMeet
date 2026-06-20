import { useEffect } from "react";
import { useAuth } from "@clerk/react";
import AppRoutes from "./routes";
import { setAuthTokenGetter } from "./lib/auth-token";

function App() {
  const { getToken } = useAuth();

  // Expose Clerk's session-token getter to the axios interceptor.
  useEffect(() => {
    setAuthTokenGetter(() => getToken());
    return () => setAuthTokenGetter(null);
  }, [getToken]);

  return <AppRoutes />;
}

export default App;