import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap', // Optimize font loading
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap', // Optimize font loading
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
