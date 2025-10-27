'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Páginas que no deben tener sidebar ni margen
  const noSidebarPages = ['/login', '/register'];
  const isReaderPage = pathname?.startsWith('/reader/');
  const showSidebar = !noSidebarPages.includes(pathname) && !isReaderPage;

  return (
    <>
      <Sidebar />
      <BottomNav />
      <div className={showSidebar ? 'md:ml-64 pb-20 md:pb-0' : ''}>
        {children}
      </div>
    </>
  );
}
