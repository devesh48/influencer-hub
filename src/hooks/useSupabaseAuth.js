// src/hooks/useSupabaseAuth.js
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/clerk-react';

export function useSupabaseAuth() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [supabaseAuth, setSupabaseAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function initAuthClient() {
      if (!isLoaded || !isSignedIn) {
        setLoading(false);
        return;
      }

      try {
        const token = await getToken({ template: 'supabase' });

        if (!token) {
          throw new Error('Failed to obtain Supabase JWT token from Clerk');
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

        if (mounted) {
          setSupabaseAuth(client);
          setLoading(false);
        }
      } catch (err) {
        console.error('Supabase auth client failed:', err);
        if (mounted) {
          setError(err.message || 'Authentication failed');
          setLoading(false);
        }
      }
    }

    initAuthClient();

    return () => {
      mounted = false;
    };
  }, [isLoaded, isSignedIn, getToken]);

  return { supabaseAuth, loading, error };
}