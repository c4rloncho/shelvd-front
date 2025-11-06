import { Metadata } from "next";
import Link from "next/link";
import { Library, BookOpen, FolderHeart, Shield, Sparkles, Upload, Search, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BackgroundBlobs from "@/components/BackgroundBlobs";

export const metadata: Metadata = {
  title: "Shelvd - Tu Biblioteca Digital Personal",
  description: "Organiza, lee y gestiona tus libros digitales en un solo lugar. Sube PDFs, crea colecciones personalizadas y disfruta de una experiencia de lectura optimizada.",
  keywords: ["biblioteca digital", "gestión de libros", "lector pdf", "organizar libros", "colecciones de libros", "lectura digital"],
  authors: [{ name: "Shelvd" }],
  openGraph: {
    title: "Shelvd - Tu Biblioteca Digital Personal",
    description: "Organiza, lee y gestiona tus libros digitales en un solo lugar.",
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shelvd - Tu Biblioteca Digital Personal",
    description: "Organiza, lee y gestiona tus libros digitales en un solo lugar.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function LandingPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Shelvd",
    "description": "Organiza, lee y gestiona tus libros digitales en un solo lugar. Sube PDFs, crea colecciones personalizadas y disfruta de una experiencia de lectura optimizada.",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1"
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated mesh background */}
      <BackgroundBlobs />

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Hero Section */}
      <header className="container mx-auto px-4 py-6 relative z-10">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-600 to-yellow-600 rounded-xl shadow-lg shadow-amber-500/20">
              <Library className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
              Shelvd
            </h1>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="default">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/register">
              <Button size="default" className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700">
                Crear Cuenta
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Content */}
      <section className="container mx-auto px-4 py-8 md:py-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Tu biblioteca digital, organizada y accesible</span>
          </div>

          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
              Organiza
            </span>
            {" "}tus libros,{" "}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
              amplifica
            </span>
            {" "}tu lectura
          </h2>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            La plataforma perfecta para gestionar tu biblioteca digital. Sube, organiza y lee tus libros en PDF con una experiencia moderna y fluida.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 text-lg bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 shadow-lg shadow-amber-500/30">
                Comenzar Gratis
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
                Ir al Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12 md:py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Todo lo que necesitas para tu biblioteca digital
            </h3>
            <p className="text-lg text-muted-foreground">
              Funcionalidades diseñadas para mejorar tu experiencia de lectura
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="border-2 hover:border-amber-500/50 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-semibold">Sube tus PDFs</h4>
                <p className="text-muted-foreground">
                  Carga fácilmente tus libros en formato PDF y accede a ellos desde cualquier dispositivo.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-2 hover:border-amber-500/50 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <FolderHeart className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-semibold">Colecciones Personalizadas</h4>
                <p className="text-muted-foreground">
                  Organiza tus libros en colecciones temáticas y encuentra lo que buscas al instante.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-2 hover:border-amber-500/50 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-semibold">Lector Optimizado</h4>
                <p className="text-muted-foreground">
                  Disfruta de una experiencia de lectura fluida con nuestro visor de PDF integrado.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border-2 hover:border-amber-500/50 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-semibold">Búsqueda Inteligente</h4>
                <p className="text-muted-foreground">
                  Encuentra cualquier libro rápidamente con nuestra potente búsqueda por título y autor.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="border-2 hover:border-amber-500/50 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                  <BookMarked className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-semibold">Favoritos y Recientes</h4>
                <p className="text-muted-foreground">
                  Marca tus libros favoritos y continúa donde lo dejaste con el historial de lectura.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="border-2 hover:border-amber-500/50 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-zinc-500 flex items-center justify-center shadow-lg shadow-slate-500/30">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-semibold">Seguro y Privado</h4>
                <p className="text-muted-foreground">
                  Tus libros están seguros y solo tú tienes acceso a tu biblioteca personal.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Formats Section */}
      <section className="container mx-auto px-4 py-12 md:py-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6 md:p-10">
              <div className="text-center mb-6">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Formatos Soportados
                </h3>
                <p className="text-muted-foreground">
                  Trabaja con los formatos más populares de libros digitales
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* PDF */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20">
                  <div className="p-3 rounded-lg bg-red-500/20">
                    <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                      <path d="M14 2v6h6M10 12h4M10 16h4M10 20h4"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1 text-red-300">PDF (Portable Document Format)</h4>
                    <p className="text-sm text-muted-foreground">
                      El formato más universal para libros digitales. Perfectamente compatible con Shelvd.
                    </p>
                  </div>
                </div>

                {/* EPUB */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                  <div className="p-3 rounded-lg bg-blue-500/20">
                    <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                      <path d="M14 2v6h6"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1 text-blue-300">EPUB (Próximamente)</h4>
                    <p className="text-sm text-muted-foreground">
                      Soporte para libros electrónicos con texto adaptable y reflowable.
                    </p>
                  </div>
                </div>

                {/* MOBI */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                  <div className="p-3 rounded-lg bg-green-500/20">
                    <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                      <path d="M14 2v6h6"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1 text-green-300">MOBI (Próximamente)</h4>
                    <p className="text-sm text-muted-foreground">
                      Formato Kindle compatible con tu biblioteca digital.
                    </p>
                  </div>
                </div>

                {/* Otros */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                  <div className="p-3 rounded-lg bg-purple-500/20">
                    <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                      <path d="M14 2v6h6"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1 text-purple-300">Más Formatos</h4>
                    <p className="text-sm text-muted-foreground">
                      Trabajando en soporte para AZW3, CBR, CBZ y más formatos populares.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-center text-muted-foreground">
                  <span className="font-semibold text-amber-400">💡 Nota:</span> Actualmente Shelvd soporta archivos PDF. Estamos trabajando en agregar más formatos para expandir tu experiencia de lectura.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 md:py-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-yellow-500/10 to-amber-500/10">
            <CardContent className="p-8 md:p-10 text-center space-y-6">
              <h3 className="text-3xl md:text-4xl font-bold">
                ¿Listo para organizar tu biblioteca?
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Únete a Shelvd y comienza a disfrutar de una experiencia de lectura digital moderna y organizada.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/register">
                  <Button size="lg" className="h-12 px-8 text-lg bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 shadow-lg shadow-amber-500/30">
                    Crear Cuenta Gratis
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
                    Ya tengo cuenta
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-12 md:mt-16 relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-600 to-yellow-600 rounded-lg">
                <Library className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold">Shelvd</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Términos y Condiciones
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Política de Privacidad
              </Link>
            </div>

            <p className="text-sm text-muted-foreground">
              © 2025 Shelvd. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
