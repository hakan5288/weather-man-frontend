'use client';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname(); // Get current route

  useEffect(() => {
    const fetchUser = async () => {
      console.log('Fetching user from API...');
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('access_token');
        console.log('Access token:', token ? 'Found' : 'Not found');

        // If no token and not on login/signup, redirect to /auth/login
        if (
          !token &&
          !['/auth/login', '/auth/signup'].includes(pathname)
        ) {
          console.log('No token, redirecting to /auth/login');
          setUser(null);
          setError('No access token found.');
          router.push('/auth/login');
          return;
        }

        // If token exists, fetch user profile
        if (token) {
          const API_URL = process.env.NEXT_PUBLIC_API_URL;
          const response = await fetch(`${API_URL}/auth/profile`, {
            credentials: 'include', // Keep if backend still uses cookies
            headers: {
              Authorization: `Bearer ${token}`, // Send token in header
            },
          });

          if (!response.ok) {
            if (response.status === 401) {
              localStorage.removeItem('access_token');
              setError('Invalid or expired token. Please log in again.');
              setUser(null);
              // Redirect to login if not already there
              if (!['/auth/login', '/auth/signup'].includes(pathname)) {
                console.log('Invalid token, redirecting to /auth/login');
                router.push('/auth/login');
              }
            } else {
              throw new Error(
                `API error: ${response.statusText} (${response.status})`
              );
            }
            return;
          }

          const data = await response.json();
          console.log('User fetched:', data);
          setUser(data.data);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to fetch user data.');
        setUser(null);
        // Redirect to login if not already there
        if (!['/auth/login', '/auth/signup'].includes(pathname)) {
          console.log('Error fetching user, redirecting to /auth/login');
          router.push('/auth/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router, pathname]); // Re-run if route changes

  return (
    <UserContext.Provider value={{ user, isLoading, error, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
