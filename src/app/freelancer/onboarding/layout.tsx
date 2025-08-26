"use client";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function FreelancerOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["freelancer"]}>
      {children}
    </ProtectedRoute>
  );
}
