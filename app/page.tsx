"use client";

import BookCard from "@/components/BookCard";
import { useAuth } from "@/context/AuthContext";
import { useCollections } from "@/context/CollectionsContext";
import { Book, booksApi, collectionsApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Upload, X, AlertCircle, BookOpen, FolderPlus, Folder, Library, Trash2, Sparkles, Cloud, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import CreateCollectionDialog from "@/components/CreateCollectionDialog";
import { Collection } from "@/lib/api";

export default function Home() {
  const { user, loading } = useAuth();
  const { selectedCollectionId, setSelectedCollectionId } = useCollections();
  const router = useRouter();

  const [books, setBooks] = useState<Book[]>([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // 🔍 Estados para filtro y paginación
  const [searchTitle, setSearchTitle] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  // 📁 Estados para colecciones
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deletingCollectionId, setDeletingCollectionId] = useState<number | null>(null);

  // 🔄 Cargar libros desde el backend
  const loadBooks = async () => {
    if (!user) return;

    setBooksLoading(true);
    setError(null);
    try {
      if (selectedCollectionId) {
        // Cargar libros de una colección específica
        const response = await collectionsApi.getBooks(selectedCollectionId, { page, limit });
        setBooks(response.data.books);
        setTotalPages(response.pagination.totalPages);
      } else {
        // Cargar todos los libros con filtros
        const response = await booksApi.getAll({ title: searchTitle, page, limit });
        setBooks(response.data);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      console.error("Error al cargar libros:", error);
      setError("Error al cargar los libros");
    } finally {
      setBooksLoading(false);
    }
  };

  // 📁 Cargar colecciones
  const loadCollections = async () => {
    if (!user) return;

    setCollectionsLoading(true);
    try {
      const data = await collectionsApi.getAll();
      setCollections(data);
    } catch (error) {
      console.error('Error al cargar colecciones:', error);
    } finally {
      setCollectionsLoading(false);
    }
  };

  // 🗑️ Eliminar colección
  const handleDeleteCollection = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Estás seguro de eliminar esta colección?')) return;

    setDeletingCollectionId(id);
    try {
      await collectionsApi.delete(id);
      await loadCollections();
      if (selectedCollectionId === id) {
        setSelectedCollectionId(null);
      }
    } catch (error) {
      console.error('Error al eliminar colección:', error);
      setError("Error al eliminar la colección");
    } finally {
      setDeletingCollectionId(null);
    }
  };

  // 📂 Subir archivo
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setError(null);
    try {
      await booksApi.upload(file);
      await loadBooks();
      event.target.value = "";
    } catch (error: any) {
      console.error("Error al subir libro:", error);
      setError(error.message || "Error al subir el libro");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteBook = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este libro?")) return;

    try {
      await booksApi.delete(id);
      await loadBooks();
    } catch (error: any) {
      console.error("Error al eliminar libro:", error);
      setError(error.message || "Error al eliminar el libro");
    }
  };

  // 🔍 Ejecutar búsqueda
  const handleSearch = () => {
    setPage(1);
    setSearchTitle(searchInput);
  };

  // 🔍 Manejar búsqueda con Enter
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 🧭 Efecto para cargar libros
  useEffect(() => {
    if (user && !loading) {
      loadBooks();
    }
  }, [user, loading, page, searchTitle, selectedCollectionId]);

  // 📁 Efecto para cargar colecciones
  useEffect(() => {
    if (user && !loading) {
      loadCollections();
    }
  }, [user, loading]);

  // 📁 Efecto para resetear página cuando cambia la colección
  useEffect(() => {
    setPage(1);
    setSearchTitle("");
    setSearchInput("");
  }, [selectedCollectionId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-64">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-sm text-muted-foreground">Cargando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Modal de carga para subida de archivos */}
      <Dialog open={uploadingFile}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-center">Subiendo libro</DialogTitle>
            <DialogDescription className="text-center">
              Por favor espera mientras procesamos tu archivo
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-primary/10"></div>
              </div>
            </div>
            <p className="mt-6 text-sm text-muted-foreground font-medium">
              Esto puede tomar unos momentos...
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {user ? (
        <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="w-full max-w-7xl mx-auto">
            {/* Contenido principal */}
            <div className="w-full">
              {/* Header - Botones de acción y búsqueda */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  {/* Botones de acción */}
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      onClick={() => document.getElementById("file-upload")?.click()}
                      disabled={uploadingFile}
                      size="lg"
                      className="flex-1 sm:flex-none group"
                    >
                      <Upload className="w-4 h-4 transition-transform group-hover:scale-110" />
                      {uploadingFile ? "Subiendo..." : "Agregar Libro"}
                    </Button>
                    <Button
                      onClick={() => setCreateDialogOpen(true)}
                      variant="outline"
                      size="lg"
                      className="flex-1 sm:flex-none group"
                    >
                      <FolderPlus className="w-4 h-4 transition-transform group-hover:scale-110" />
                      <span className="hidden sm:inline">Nueva Colección</span>
                      <span className="sm:hidden">Colección</span>
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".epub,.pdf,.mobi"
                      onChange={handleFileUpload}
                      disabled={uploadingFile}
                      className="hidden"
                    />
                  </div>

                  {/* Barra de búsqueda mejorada */}
                  <div className="flex-1 sm:max-w-lg">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary pointer-events-none" />
                          <Input
                            type="text"
                            placeholder="Buscar por título..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="pl-10 pr-10 h-10 transition-all duration-200 focus-visible:ring-4"
                          />
                          {searchInput && (
                            <button
                              onClick={() => {
                                setSearchInput("");
                                setSearchTitle("");
                              }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <Button
                          onClick={handleSearch}
                          variant="secondary"
                          size="lg"
                          className="shrink-0 group/btn"
                        >
                          <Search className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                          <span className="hidden md:inline">Buscar</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección de Colecciones */}
              <div className="mb-6">
                <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-hide border-b border-border/50">
                  {/* Todos los libros */}
                  <button
                    onClick={() => setSelectedCollectionId(null)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
                      selectedCollectionId === null
                        ? 'text-foreground border-primary bg-accent/50'
                        : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-accent/30'
                    }`}
                  >
                    <Library className="w-4 h-4" />
                    Todos los libros
                  </button>

                  {/* Lista de colecciones */}
                  {collectionsLoading ? (
                    <div className="text-xs text-muted-foreground px-4 py-2">
                      Cargando colecciones...
                    </div>
                  ) : (
                    collections.map((collection) => (
                      <div
                        key={collection.id}
                        className={`group flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
                          selectedCollectionId === collection.id
                            ? 'text-foreground border-primary bg-accent/50'
                            : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-accent/30'
                        }`}
                      >
                        <div
                          onClick={() => setSelectedCollectionId(collection.id)}
                          className="flex items-center gap-2 flex-1 cursor-pointer"
                        >
                          <Folder className="w-4 h-4" />
                          <span>{collection.name}</span>
                          {collection.bookCount !== undefined && (
                            <Badge
                              variant="secondary"
                              className="text-xs px-1.5 py-0.5 ml-1"
                            >
                              {collection.bookCount}
                            </Badge>
                          )}
                        </div>
                        <button
                          onClick={(e) => handleDeleteCollection(collection.id, e)}
                          disabled={deletingCollectionId === collection.id}
                          className="ml-1 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity p-1 rounded hover:bg-destructive/10"
                          aria-label="Eliminar colección"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Card contenedor de libros */}
            <Card className="border border-border/50 shadow-xl bg-card/80 backdrop-blur-xl">

                {/* Mensaje de error */}
                {error && (
                  <CardContent className="pt-4 sm:pt-6 px-4 sm:px-8">
                    <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800 dark:text-red-300">
                          Error
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                          {error}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                )}

              {/* Grid de libros */}
              {booksLoading ? (
                <CardContent className="py-12 sm:py-16">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                </CardContent>
              ) : books.length === 0 ? (
                <CardContent className="py-16 sm:py-24 px-4">
                  <div className="text-center flex flex-col items-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-base sm:text-xl font-semibold text-foreground mb-2">
                      Tu biblioteca está vacía
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                      {searchTitle
                        ? `No se encontraron libros que coincidan con "${searchTitle}"`
                        : "Comienza agregando tu primer libro usando el botón de arriba"
                      }
                    </p>
                    {!searchTitle && (
                      <Button
                        onClick={() => document.getElementById("file-upload")?.click()}
                        size="lg"
                        className="group"
                      >
                        <Upload className="w-4 h-4 transition-transform group-hover:scale-110" />
                        Agregar Primer Libro
                      </Button>
                    )}
                  </div>
                </CardContent>
              ) : (
                <CardContent className="p-4 sm:p-8">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-5">
                    {books.map((book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        onDelete={handleDeleteBook}
                        onCollectionChange={loadBooks}
                      />
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Controles de paginación y total */}
            {!booksLoading && books.length > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                {/* Total de libros */}
                <div className="text-sm text-muted-foreground text-center sm:text-left flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm px-3 py-1 font-semibold">
                    {books.length} {books.length === 1 ? "libro" : "libros"}
                  </Badge>
                  <span className="hidden sm:inline">en esta página</span>
                </div>

                {/* Paginación mejorada */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="hidden sm:inline-flex hover:scale-105 transition-transform"
                  >
                    &larr; Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="sm:hidden"
                  >
                    &larr;
                  </Button>
                  <Badge variant="secondary" className="px-4 py-1.5 font-medium">
                    <span className="hidden sm:inline">Página </span>
                    {page} <span className="hidden sm:inline">de {totalPages}</span>
                    <span className="sm:hidden">/{totalPages}</span>
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="hidden sm:inline-flex hover:scale-105 transition-transform"
                  >
                    Siguiente &rarr;
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="sm:hidden"
                  >
                    &rarr;
                  </Button>
                </div>
              </div>
            )}

            {/* Diálogo para crear colección */}
            <CreateCollectionDialog
              open={createDialogOpen}
              onOpenChange={setCreateDialogOpen}
              onSuccess={loadCollections}
            />
          </div>
        </main>
      ) : (
        // Landing Page - Diseño Colorido y Vibrante
        <div className="min-h-screen bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5">
          {/* Decorative gradient blobs */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full blur-3xl opacity-20"></div>
            <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-300 rounded-full blur-3xl opacity-20"></div>
            <div className="absolute -bottom-40 right-1/4 w-96 h-96 bg-gradient-to-br from-pink-400 to-orange-300 rounded-full blur-3xl opacity-20"></div>
          </div>

          {/* Navbar Colorido */}
          <nav className="relative border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-50">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="flex h-20 items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/50">
                    <Library className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-foreground">Shelvd</span>
                </div>
                <div className="flex items-center gap-4">
                  <Button asChild variant="ghost" size="lg" className="hover:bg-white/10">
                    <Link href="/login">Acceder</Link>
                  </Button>
                </div>
              </div>
            </div>
          </nav>

          {/* Hero Section - Colorido */}
          <section className="relative pt-32 pb-20 px-6">
            <div className="container relative mx-auto max-w-6xl">
              <div className="text-center space-y-8">
                {/* Badge colorido */}
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                  <span className="text-sm font-semibold text-foreground">Tu biblioteca digital personal</span>
                </div>

                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight">
                  Tu biblioteca
                  <br />
                  <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
                    siempre contigo
                  </span>
                </h1>

                <p className="text-xl sm:text-2xl text-foreground/80 max-w-3xl mx-auto font-medium">
                  Lee, organiza y gestiona tu colección digital desde cualquier dispositivo
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                  <Button asChild size="lg" className="h-14 px-10 text-lg bg-primary hover:bg-primary/90 shadow-xl">
                    <Link href="/register">
                      Comenzar ahora
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-14 px-10 text-lg border-2 hover:bg-accent">
                    <Link href="/login">
                      Iniciar sesión
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Section - Coloridos */}
          <section className="relative py-16 px-6">
            <div className="container mx-auto max-w-5xl">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 backdrop-blur-sm">
                  <div className="text-5xl font-black bg-gradient-to-br from-blue-500 to-cyan-400 bg-clip-text text-transparent mb-3">∞</div>
                  <div className="text-sm font-semibold text-foreground">Libros ilimitados</div>
                </div>
                <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 backdrop-blur-sm">
                  <div className="text-5xl font-black bg-gradient-to-br from-purple-500 to-pink-400 bg-clip-text text-transparent mb-3">3</div>
                  <div className="text-sm font-semibold text-foreground">Formatos soportados</div>
                </div>
                <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 to-orange-500/10 border border-pink-500/20 backdrop-blur-sm">
                  <div className="text-5xl font-black bg-gradient-to-br from-pink-500 to-orange-400 bg-clip-text text-transparent mb-3">100%</div>
                  <div className="text-sm font-semibold text-foreground">En la nube</div>
                </div>
                <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 backdrop-blur-sm">
                  <div className="text-5xl font-black bg-gradient-to-br from-indigo-500 to-blue-400 bg-clip-text text-transparent mb-3">24/7</div>
                  <div className="text-sm font-semibold text-foreground">Acceso total</div>
                </div>
              </div>
            </div>
          </section>

          {/* Features - Super Coloridos */}
          <section className="relative py-20 px-6">
            <div className="container mx-auto max-w-6xl space-y-32">
              {/* Feature 1 */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="inline-block p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl shadow-blue-500/50">
                    <Library className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent pb-2">
                    Organiza tu colección
                  </h2>
                  <p className="text-lg text-foreground/70 leading-relaxed font-medium">
                    Crea colecciones personalizadas, etiqueta tus libros y mantén todo perfectamente organizado. Tu biblioteca, a tu manera.
                  </p>
                </div>
                <div className="relative h-80 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/50 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <Folder className="relative w-32 h-32 text-white/90 drop-shadow-lg" />
                </div>
              </div>

              {/* Feature 2 */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="relative h-80 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/50 overflow-hidden lg:order-first">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <BookOpen className="relative w-32 h-32 text-white/90 drop-shadow-lg" />
                </div>
                <div className="space-y-6">
                  <div className="inline-block p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl shadow-purple-500/50">
                    <BookOpen className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent pb-2">
                    Lee donde quieras
                  </h2>
                  <p className="text-lg text-foreground/70 leading-relaxed font-medium">
                    Lector integrado y optimizado para EPUB, PDF y MOBI. Tus libros sincronizados en todos tus dispositivos.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="inline-block p-4 bg-gradient-to-br from-pink-500 to-orange-500 rounded-2xl shadow-xl shadow-pink-500/50">
                    <Search className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent pb-2">
                    Encuentra al instante
                  </h2>
                  <p className="text-lg text-foreground/70 leading-relaxed font-medium">
                    Búsqueda rápida y potente. Encuentra cualquier libro por título, autor o etiqueta en segundos.
                  </p>
                </div>
                <div className="relative h-80 bg-gradient-to-br from-pink-500 via-orange-500 to-amber-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-pink-500/50 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <Search className="relative w-32 h-32 text-white/90 drop-shadow-lg" />
                </div>
              </div>
            </div>
          </section>

          {/* CTA Final - Colorido */}
          <section className="relative py-32 px-6">
            <div className="container mx-auto max-w-4xl">
              <div className="relative rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-12 sm:p-16 text-center shadow-2xl shadow-purple-500/50 overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
                <div className="relative space-y-6">
                  <h2 className="text-5xl sm:text-6xl font-black text-white">
                    Empieza hoy mismo
                  </h2>
                  <p className="text-xl text-white/90 font-medium">
                    Únete y organiza tu biblioteca digital en minutos
                  </p>
                  <Button asChild size="lg" className="h-16 px-12 text-lg bg-white text-purple-600 hover:bg-white/90 shadow-xl font-bold">
                    <Link href="/register">
                      Crear cuenta gratis
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Footer Colorido */}
          <footer className="relative border-t border-white/10 bg-white/5 backdrop-blur-xl py-12 px-6">
            <div className="container mx-auto max-w-6xl">
              <div className="flex flex-col items-center gap-6">
                {/* Logo y nombre */}
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                    <Library className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Shelvd</span>
                </div>

                {/* Enlaces legales */}
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                    Términos y Condiciones
                  </Link>
                  <span className="text-muted-foreground/50">•</span>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                    Política de Privacidad
                  </Link>
                </div>

                {/* Copyright */}
                <p className="text-sm text-muted-foreground text-center">
                  © 2025 Shelvd - Tu biblioteca digital personal y privada
                </p>
              </div>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
