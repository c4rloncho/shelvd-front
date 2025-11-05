"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // No mostrar sidebar en páginas de login/register/reader
  const isReaderPage = pathname?.startsWith("/reader/");
  if (pathname === "/login" || pathname === "/register" || isReaderPage) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 border-r border-border bg-sidebar/80 backdrop-blur-xl flex-col z-50">
        {/* Logo/Header */}
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            Shelvd
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {user && (
            <div className="space-y-4">
              <Link
                href="/"
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === "/"
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Mi Biblioteca
              </Link>
            </div>
          )}
        </nav>

        {/* User Section (Bottom) */}
        <div className="p-3 border-t border-border">
          {user ? (
            <div className="space-y-3">
              <div className="px-3 py-2 rounded-lg bg-sidebar-accent/30">
                <p className="text-xs text-sidebar-foreground/60 mb-1">
                  Conectado como
                </p>
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.username}
                </p>
              </div>
              <Button
                onClick={handleLogout}
                variant="default"
                className="w-full group"
                size="default"
              >
                <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                Cerrar Sesión
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Button asChild variant="ghost" className="w-full">
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
              <Button asChild variant="default" className="w-full">
                <Link href="/register">Registrarse</Link>
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
