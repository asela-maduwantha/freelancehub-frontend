import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const useFreelancerAuth = () => {
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

            // Verify the user has freelancer role
            if (parsedUser.role && parsedUser.role.includes('freelancer')) {
              setUser(parsedUser);
            } else {
              router.push('/login');
              return;
            }
          } catch (parseError) {
            console.error('FreelancerLayout: Failed to parse user data:', parseError);
            // Clear corrupted data
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            router.push('/login');
            return;
          }
        } else {
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('FreelancerLayout: Authentication check failed:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  return { user, isLoading };
};
