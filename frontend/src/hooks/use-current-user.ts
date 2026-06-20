import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { getCurrentUserQueryFn } from "@/lib/api";

// Fetches the local user row backing the Clerk session (includes the booking
// `username`, which Clerk itself does not own). Only runs once signed in.
const useCurrentUser = () => {
  const { isSignedIn } = useAuth();

  const query = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUserQueryFn,
    enabled: !!isSignedIn,
    staleTime: 5 * 60 * 1000,
  });

  return { ...query, user: query.data?.user };
};

export default useCurrentUser;