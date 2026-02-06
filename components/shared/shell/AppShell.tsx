// components/shared/shell/AppShell.tsx
import { useState, useEffect } from 'react';
import { Loading } from '@/components/shared';
import { useSession } from 'next-auth/react';
import React from 'react';
import Header from './Header';
import Drawer from './Drawer';
import { useRouter } from 'next/router';

export default function AppShell({ children }) {
  const router = useRouter();
  const { status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🔁 Når vi er på en kurs-side, collapse global sidebar
  useEffect(() => {
    if (router.pathname?.includes('/courses')) {
      setSidebarOpen(false);
    }
  }, [router.pathname]);

  if (status === 'loading') {
    return <Loading />;
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return;
  }

  return (
    <div>
      <Drawer sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="lg:pl-64">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="py-5">
          <div className="px-0">{children}</div>
        </main>
      </div>
    </div>
  );
}
