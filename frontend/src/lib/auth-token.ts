// Bridges Clerk's React-only `getToken()` to the plain axios interceptor, which
// lives outside the component tree. A component inside <ClerkProvider> registers
// the getter on mount (see App.tsx); the interceptor reads it per request.
type TokenGetter = () => Promise<string | null>;

let tokenGetter: TokenGetter | null = null;

export const setAuthTokenGetter = (getter: TokenGetter | null) => {
  tokenGetter = getter;
};

export const getAuthToken = async (): Promise<string | null> => {
  if (!tokenGetter) return null;
  try {
    return await tokenGetter();
  } catch {
    return null;
  }
};