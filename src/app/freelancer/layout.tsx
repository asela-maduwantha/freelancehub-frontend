"use client";
import { FreelancerLayout } from "@/components/freelancer/layout/FreelancerLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function FreelancerLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["freelancer"]}>
      <FreelancerLayout>
        {children}
      </FreelancerLayout>
    </ProtectedRoute>
  );
}
