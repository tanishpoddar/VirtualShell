'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, getRedirectResult, User } from 'firebase/auth';
import { auth } from '@/lib/firebase-config';

interface AuthState {
  user: User | null;
  loading: boolean;
}

const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Check for redirect result on mount
    getRedirectResult(auth)
      .then((result) => {
        if (result && mounted) {
          // Successfully signed in after redirect
        }
      })
      .catch((error) => {
        if (mounted && process.env.NODE_ENV === 'development') {
          console.error('Redirect error:', error);
        }
      });
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (mounted) {
        setUser(user);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return { user, loading };
};

export default useAuth;
