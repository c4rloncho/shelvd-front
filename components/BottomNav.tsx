'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Home, User, LogOut, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import CollectionsMobileSheet from './CollectionsMobileSheet';

export default function BottomNav() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collectionsOpen, setCollectionsOpen] = useState(false);

  // No mostrar bottom nav en páginas de login/register/reader
  const isReaderPage = pathname?.startsWith('/reader/');
  if (pathname === '/login' || pathname === '/register' || isReaderPage) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex items-center justify-around px-2 py-3 safe-area-inset-bottom">
          {/* Home/Biblioteca */}
          <Link
            href="/dashboard"
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              pathname === '/dashboard'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium">Inicio</span>
          </Link>

          {/* Colecciones */}
          <button
            onClick={() => setCollectionsOpen(true)}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            <Folder className="w-5 h-5" />
            <span className="text-xs font-medium">Colecciones</span>
          </button>

          {/* Usuario */}
          <div className="flex flex-col items-center gap-1 px-3 py-2">
            <User className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground truncate max-w-[60px]">
              {user.username}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs font-medium">Salir</span>
          </button>
        </div>
      </nav>

      <CollectionsMobileSheet
        open={collectionsOpen}
        onOpenChange={setCollectionsOpen}
      />
    </>
  );
}
