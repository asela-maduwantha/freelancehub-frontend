import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: "FreelanceHub - Connect Freelancers with Clients",
  description: "Join thousands of freelancers and clients on FreelanceHub. Find top talent or discover your next project opportunity.",
  keywords: "freelance, freelancers, clients, projects, jobs, remote work",
  authors: [{ name: "FreelanceHub Team" }],
  openGraph: {
    title: "FreelanceHub - Connect Freelancers with Clients",
    description: "Join thousands of freelancers and clients on FreelanceHub",
    type: "website",
    url: "https://freelancehub.com",
    siteName: "FreelanceHub",
  },
  twitter: {
    card: "summary_large_image",
    title: "FreelanceHub - Connect Freelancers with Clients",
    description: "Join thousands of freelancers and clients on FreelanceHub",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "google-site-verification-code", // Add your verification code
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} font-inter antialiased`}
      >
          {children}
      </body>
    </html>
  );
}
