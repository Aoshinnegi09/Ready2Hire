import React from 'react';
import { Outlet } from 'react-router-dom';
import { RoleSwitcherBanner } from '@/components/common/RoleSwitcherBanner';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <RoleSwitcherBanner />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
