"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import BookLoadingAnimation from "@/components/BookLoadingAnimation";
import BackgroundBlobs from "@/components/BackgroundBlobs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background relative">
        <BackgroundBlobs />
        <div className="flex flex-col items-center justify-center gap-6 relative z-10">
          <BookLoadingAnimation />
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Cargando Shelvd
            </h2>
            <p className="text-sm text-muted-foreground animate-pulse">
              Preparando tu biblioteca...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
