'use client';

import { ReactNode } from 'react';
import Header from '../../components/common/Header/Header';
import Sidebar from '../../components/common/Sidebar/Sidebar';
import Footer from '../../components/common/Footer/Footer';

interface MainLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export default function MainLayout({ children, showSidebar = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header />
      <div className="flex">
        {showSidebar && <Sidebar items={[]} />}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}