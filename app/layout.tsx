import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { AuthProvider } from "@/context/AuthContext";
import { CollectionsProvider } from "@/context/CollectionsContext";
import LayoutWrapper from "@/components/LayoutWrapper";
import CacheCleaner from "@/components/CacheCleaner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shelvd",
  description: "Book management app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <CollectionsProvider>
            <CacheCleaner />
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </CollectionsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
