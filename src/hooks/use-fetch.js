import { useSession } from "@clerk/clerk-react";
import { useState } from "react";

// Custom hook for API calls with loading states and auth token injection
const useFetch = (cb, options = {}) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const { session } = useSession();

  // Execute API function with proper authentication and error handling
  const fn = async (...args) => {
    setLoading(true);
    setError(null);

    try {
      // Get authenticated Supabase token from Clerk session
      const supabaseAccessToken = await session.getToken({
        template: "supabase",
      });
      
      // Call API function with token, options, and arguments
      const response = await cb(supabaseAccessToken, options, ...args);
      setData(response);
      setError(null);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn };
};

export default useFetch;