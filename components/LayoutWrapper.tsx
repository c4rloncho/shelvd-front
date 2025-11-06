'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Páginas que no deben tener sidebar ni margen
  const noSidebarPages = ['/login', '/register', '/'];
  const isReaderPage = pathname?.startsWith('/reader/');

  const showSidebar = !noSidebarPages.includes(pathname) && !isReaderPage;

  // Páginas que usan su propio BackgroundBlobs (no necesitan el fondo del LayoutWrapper)
  const pagesWithOwnBackground = ['/login', '/register', '/'];
  const showLayoutBackground = !pagesWithOwnBackground.includes(pathname);

  return (
    <>
      {/* Fondo con gradiente y brillos decorativos - solo para páginas internas */}
      {showLayoutBackground && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none z-0">
          {/* Decorative gradient blobs */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-300 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute -bottom-40 right-1/4 w-96 h-96 bg-gradient-to-br from-pink-400 to-orange-300 rounded-full blur-3xl opacity-20"></div>
        </div>
      )}

      {/* Contenido de la aplicación */}
      <div className="relative z-10">
        {showSidebar && <Sidebar />}
        {showSidebar && <BottomNav />}
        <div className={showSidebar ? 'md:ml-64 pb-20 md:pb-0' : ''}>
          {children}
        </div>
      </div>
    </>
  );
}
