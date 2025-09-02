import FreelancerLayout from '@/components/layout/FreelancerLayout';

export default function FreelancerRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FreelancerLayout>{children}</FreelancerLayout>;
}
