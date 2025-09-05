import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const useClientAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');

        if (userData && token) {
          try {
            const parsedUser = JSON.parse(userData);

            // Verify the user has client role
            if (parsedUser.role && parsedUser.role.includes('client')) {
              console.log('ClientLayout: User authenticated as client:', parsedUser);
              setUser(parsedUser);
            } else {
              console.log('ClientLayout: User does not have client role');
              router.push('/login');
              return;
            }
          } catch (parseError) {
            console.error('ClientLayout: Failed to parse user data:', parseError);
            // Clear corrupted data
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            router.push('/login');
            return;
          }
        } else {
          console.log('ClientLayout: No valid authentication found, redirecting to login');
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('ClientLayout: Authentication check failed:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  return { user, isLoading, setUser };
};
