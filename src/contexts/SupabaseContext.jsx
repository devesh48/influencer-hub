// src/contexts/SupabaseContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/clerk-react';

const SupabaseContext = createContext({
  supabaseAuth: null,
  loading: true,
  error: null,
});

export function SupabaseProvider({ children }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [supabaseAuth, setSupabaseAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoaded) return;

    // If not signed in → no auth client needed
    if (!isSignedIn) {
      setSupabaseAuth(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function createAuthClient() {
      try {
        const token = await getToken({ template: 'supabase' });

        if (!token) {
          throw new Error('Failed to get Supabase JWT from Clerk');
        }

        const client = createClient(
          import.meta.env.VITE_SUPABASE_URL,
          import.meta.env.VITE_SUPABASE_ANON_KEY,
          {
            global: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          }
        );

        if (isMounted) {
          setSupabaseAuth(client);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to initialize authenticated Supabase client:', err);
        if (isMounted) {
          setError(err.message || 'Authentication failed');
          setLoading(false);
        }
      }
    }

    createAuthClient();

    return () => {
      isMounted = false;
    };
  }, [isLoaded, isSignedIn, getToken]);

  return (
    <SupabaseContext.Provider value={{ supabaseAuth, loading, error }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}