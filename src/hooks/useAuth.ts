// hooks/useAuth.ts
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth as useAuthContext } from "@/context/auth-context";

export function useAuth({ required = false, redirectTo = "/login" } = {}) {
  const router = useRouter();
  const authContext = useAuthContext();
  
  const isAuthenticated = authContext.isAuthenticated;
  const isLoading = authContext.loading;
  
  useEffect(() => {
    const accessToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

    if (required && !isLoading && !isAuthenticated && !accessToken) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, required, redirectTo, router]);
  
  const login = async (email: string, password: string) => {
    try {
      // Use our auth context for login
      await authContext.login(email, password);
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { error: "Login failed" };
    }
  };
  
  const logout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    }
    
    authContext.logout();
    router.push("/");
  };
  
  return {
    user: authContext.user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}