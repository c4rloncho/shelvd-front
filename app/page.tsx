"use client";

import BookCard from "@/components/BookCard";
import { useAuth } from "@/context/AuthContext";
import { useCollections } from "@/context/CollectionsContext";
import { Book, booksApi, collectionsApi } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Upload, X, AlertCircle, BookOpen, FolderPlus, Folder, Library, Trash2 } from "lucide-react";
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
    <div className="min-h-screen bg-background">
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

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {user ? (
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
            <Card className="border border-border/50 shadow-xl bg-card/50 backdrop-blur-sm">

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
        ) : (
          // Si no está logueado
          <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <Card className="max-w-2xl w-full shadow-2xl border-none">
              <CardHeader className="text-center space-y-4 pb-8">
                <CardTitle className="text-5xl sm:text-6xl font-bold tracking-tight">
                  Bienvenido a Shelvd
                </CardTitle>
                <CardDescription className="text-lg">
                  Tu aplicación de gestión de libros digital
                </CardDescription>
                <Separator />
              </CardHeader>
              <CardContent className="space-y-6 pb-8">
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground">
                    Organiza tu biblioteca personal, sube tus ebooks y accede a ellos desde cualquier lugar
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href="/register">
                      Comenzar
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                    <Link href="/login">
                      Iniciar sesión &rarr;
                    </Link>
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                  <div className="text-center p-4">
                    <Badge className="mb-2">Organiza</Badge>
                    <p className="text-sm text-muted-foreground">Gestiona tu colección de libros</p>
                  </div>
                  <div className="text-center p-4">
                    <Badge className="mb-2">Busca</Badge>
                    <p className="text-sm text-muted-foreground">Encuentra tus libros rápidamente</p>
                  </div>
                  <div className="text-center p-4">
                    <Badge className="mb-2">Accede</Badge>
                    <p className="text-sm text-muted-foreground">Lee desde cualquier dispositivo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
