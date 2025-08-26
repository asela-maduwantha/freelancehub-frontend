"use client";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

interface LogoutButtonProps {
  callbackUrl?: string;
  className?: string;
}

function LogoutButton({
  callbackUrl = "/login",
  className = "",
}: LogoutButtonProps) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push(callbackUrl);
  };

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white transition-colors ${className}`}
    >
      <LogOut className="w-4 h-4" />
      <span>Logout</span>
    </button>
  );
}

export default LogoutButton;
