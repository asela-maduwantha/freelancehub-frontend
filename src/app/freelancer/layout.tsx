'use client';

import FreelancerLayout from '@/components/layout/FreelancerLayout';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FreelancerLayout>{children}</FreelancerLayout>;
}
