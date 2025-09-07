import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const useFreelancerAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('FreelancerLayout: Checking authentication...');
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');

        console.log('FreelancerLayout: userData exists:', !!userData);
        console.log('FreelancerLayout: token exists:', !!token);

        if (userData && token) {
          try {
            const parsedUser = JSON.parse(userData);
            console.log('FreelancerLayout: User authenticated:', parsedUser.firstName || 'Unknown');

            // Verify the user has freelancer role
            if (parsedUser.role && parsedUser.role.includes('freelancer')) {
              setUser(parsedUser);
            } else {
              console.log('FreelancerLayout: User does not have freelancer role');
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
          console.log('FreelancerLayout: No valid authentication found, redirecting to login');
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
