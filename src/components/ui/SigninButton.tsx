"use client";
import { useRouter } from "next/navigation";

interface SignInButtonProps {
  callbackUrl?: string;
  className?: string;
}

function SignInButton({
  callbackUrl = "/dashboard",
  className = "",
}: SignInButtonProps) {
  const router = useRouter();

  const handleSignIn = () => {
    // For now, redirect to a login page
    // You can implement Google OAuth later if needed
    router.push("/login");
  };

  return (
    <button
      onClick={handleSignIn}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 transition-colors w-full ${className}`}
    >
      <span>Sign In</span>
    </button>
  );
}

export default SignInButton;
