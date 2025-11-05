"use client";

import BookCard from "@/components/BookCard";
import BookLoadingAnimation from "@/components/BookLoadingAnimation";
import BackgroundBlobs from "@/components/BackgroundBlobs";
import CreateCollectionDialog from "@/components/CreateCollectionDialog";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useCollections } from "@/context/CollectionsContext";
import { Book, booksApi, Collection, collectionsApi } from "@/lib/api";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Folder,
  FolderPlus,
  Library,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
  const [deletingCollectionId, setDeletingCollectionId] = useState<
    number | null
  >(null);

  // 🗑️ Estados para confirmación de eliminación
  const [deleteCollectionDialogOpen, setDeleteCollectionDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<number | null>(null);
  const [deleteBookDialogOpen, setDeleteBookDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  // 🔄 Cargar libros desde el backend
  const loadBooks = async () => {
    if (!user) return;

    setBooksLoading(true);
    setError(null);
    try {
      if (selectedCollectionId) {
        // Cargar libros de una colección específica
        const response = await collectionsApi.getBooks(selectedCollectionId, {
          page,
          limit,
        });
        setBooks(response.data.books);
        setTotalPages(response.pagination.totalPages);
      } else {
        // Cargar todos los libros con filtros
        const response = await booksApi.getAll({
          title: searchTitle,
          page,
          limit,
        });
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
      console.error("Error al cargar colecciones:", error);
    } finally {
      setCollectionsLoading(false);
    }
  };

  // 🗑️ Eliminar colección
  const handleDeleteCollection = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollectionToDelete(id);
    setDeleteCollectionDialogOpen(true);
  };

  const confirmDeleteCollection = async () => {
    if (!collectionToDelete) return;

    setDeletingCollectionId(collectionToDelete);
    try {
      await collectionsApi.delete(collectionToDelete);
      await loadCollections();
      if (selectedCollectionId === collectionToDelete) {
        setSelectedCollectionId(null);
      }
      setDeleteCollectionDialogOpen(false); // Cerrar diálogo después de eliminar

      // Mostrar toast de éxito
      toast.success("Colección eliminada", {
        description: "La colección ha sido eliminada exitosamente.",
      });
    } catch (error) {
      console.error("Error al eliminar colección:", error);
      setError("Error al eliminar la colección");

      // Mostrar toast de error
      toast.error("Error al eliminar", {
        description: "No se pudo eliminar la colección. Intenta nuevamente.",
      });
    } finally {
      setDeletingCollectionId(null);
      setCollectionToDelete(null);
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

    // Extraer nombre del archivo sin extensión
    const fileName = file.name.replace(/\.[^/.]+$/, "");

    // Toast de carga
    const loadingToast = toast.loading("Subiendo libro...", {
      description: `Procesando "${fileName}"`,
    });

    try {
      const uploadedBook = await booksApi.upload(file);
      await loadBooks();
      event.target.value = "";

      // Usar el título del libro si existe, si no usar el nombre del archivo
      const bookTitle = uploadedBook?.title || fileName;

      // Cerrar toast de carga y mostrar éxito
      toast.success("¡Libro agregado! 📚", {
        id: loadingToast,
        description: `"${bookTitle}" está listo para leer.`,
        duration: 4000,
      });
    } catch (error: any) {
      console.error("Error al subir libro:", error);
      setError(error.message || "Error al subir el libro");

      // Cerrar toast de carga y mostrar error
      toast.error("Error al subir libro", {
        id: loadingToast,
        description: error.message || "No se pudo subir el archivo. Intenta nuevamente.",
        duration: 5000,
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteBook = async (id: number) => {
    const book = books.find(b => b.id === id);
    if (!book) return;
    setBookToDelete(book);
    setDeleteBookDialogOpen(true);
  };

  const confirmDeleteBook = async () => {
    if (!bookToDelete) return;

    const bookTitle = bookToDelete.title;

    try {
      await booksApi.delete(bookToDelete.id);

      // Limpiar caché de IndexedDB
      const { removeCachedBook } = await import('@/lib/bookCache');
      await removeCachedBook(bookToDelete.id).catch(err => {
        console.warn('Error al limpiar caché del libro:', err);
      });

      // Limpiar localStorage del libro eliminado
      localStorage.removeItem(`book-${bookToDelete.id}-location`);

      await loadBooks();
      setDeleteBookDialogOpen(false); // Cerrar diálogo después de eliminar

      // Mostrar toast de éxito
      toast.success("Libro eliminado", {
        description: `"${bookTitle}" ha sido eliminado exitosamente.`,
      });
    } catch (error: any) {
      console.error("Error al eliminar libro:", error);
      setError(error.message || "Error al eliminar el libro");

      // Mostrar toast de error
      toast.error("Error al eliminar", {
        description: error.message || "No se pudo eliminar el libro. Intenta nuevamente.",
      });
    } finally {
      setBookToDelete(null);
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
      <div className="flex min-h-screen items-center justify-center bg-background relative">
        <BackgroundBlobs />
        <div className="flex flex-col items-center justify-center gap-6 relative z-10">
          <BookLoadingAnimation />
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Cargando Shelvd</h2>
            <p className="text-sm text-muted-foreground animate-pulse">
              Preparando tu biblioteca...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <BackgroundBlobs />
      {/* Modal de carga para subida de archivos */}
      <Dialog open={uploadingFile}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl overflow-hidden" showCloseButton={false}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-lg mesh-gradient opacity-40"></div>
          <div className="flex flex-col items-center justify-center py-8 px-6 relative z-10">
            <BookLoadingAnimation />
            <div className="text-center space-y-3 mt-8">
              <h3 className="text-lg font-semibold text-foreground">
                Subiendo libro
              </h3>
              <p className="text-sm text-muted-foreground">
                Procesando tu archivo...
              </p>
              <p className="text-xs text-muted-foreground/70 animate-pulse">
                Esto puede tomar unos momentos
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {user ? (
        <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 relative z-10">
          <div className="w-full max-w-7xl mx-auto">
            {/* Contenido principal */}
            <div className="w-full">
              {/* Header - Botones de acción y búsqueda */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  {/* Botones de acción */}
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      onClick={() =>
                        document.getElementById("file-upload")?.click()
                      }
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
                        ? "text-foreground border-primary bg-accent/50"
                        : "text-muted-foreground border-transparent hover:text-foreground hover:bg-accent/30"
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
                            ? "text-foreground border-primary bg-accent/50"
                            : "text-muted-foreground border-transparent hover:text-foreground hover:bg-accent/30"
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
                          onClick={(e) =>
                            handleDeleteCollection(collection.id, e)
                          }
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
                <CardContent className="py-16 sm:py-20">
                  <div className="flex flex-col items-center justify-center gap-6">
                    <BookLoadingAnimation />
                    <div className="text-center space-y-2">
                      <p className="text-base font-medium text-foreground">Cargando libros</p>
                      <p className="text-sm text-muted-foreground animate-pulse">
                        Buscando tus historias...
                      </p>
                    </div>
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
                        : "Comienza agregando tu primer libro usando el botón de arriba"}
                    </p>
                    {!searchTitle && (
                      <Button
                        onClick={() =>
                          document.getElementById("file-upload")?.click()
                        }
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
                <CardContent className="p-4 sm:p-8 pb-8 sm:pb-12">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
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
                  <Badge
                    variant="secondary"
                    className="text-sm px-3 py-1 font-semibold"
                  >
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
                  <Badge
                    variant="secondary"
                    className="px-4 py-1.5 font-medium"
                  >
                    <span className="hidden sm:inline">Página </span>
                    {page}{" "}
                    <span className="hidden sm:inline">de {totalPages}</span>
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
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Shelvd
                </span>
                <div className="flex items-center gap-3 sm:gap-4">
                  <Button
                    asChild
                    variant="ghost"
                    size="default"
                    className="hover:bg-white/10"
                  >
                    <Link href="/login">Acceder</Link>
                  </Button>
                </div>
              </div>
            </div>
          </nav>

          {/* Hero Section - Colorido */}
          <section className="relative pt-16 sm:pt-24 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6">
            <div className="container relative mx-auto max-w-6xl">
              <div className="text-center space-y-8 sm:space-y-10">
                {/* Nombre de la app - Protagonista */}
                <div className="space-y-4 sm:space-y-6">
                  <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black tracking-tight">
                    <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                      Shelvd
                    </span>
                  </h1>

                  {/* Divider elegante */}
                  <div className="flex items-center justify-center gap-4">
                    <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent via-foreground/20 to-transparent"></div>
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                    <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent via-foreground/20 to-transparent"></div>
                  </div>

                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground/90">
                    Tu biblioteca siempre contigo
                  </p>
                </div>

                <p className="text-base sm:text-lg lg:text-xl text-foreground/70 max-w-2xl mx-auto px-4">
                  Lee, organiza y gestiona tu colección digital desde cualquier
                  dispositivo
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 sm:pt-6 lg:pt-8 w-full max-w-md sm:max-w-none px-4">
                  <Button
                    asChild
                    size="lg"
                    className="h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg bg-primary hover:bg-primary/90 shadow-xl w-full sm:w-auto"
                  >
                    <Link href="/register">
                      Comenzar ahora
                      <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg border-2 hover:bg-accent w-full sm:w-auto"
                  >
                    <Link href="/login">Iniciar sesión</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Features - Contenedor Cuadrado Ajustado */}
          <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
            <div className="container mx-auto max-w-6xl space-y-16 sm:space-y-24 lg:space-y-32">
              {/* Feature 1 */}
              <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent pb-2">
                    Organiza tu colección
                  </h2>
                  <p className="text-base sm:text-lg text-foreground/70 leading-relaxed font-medium">
                    Crea colecciones personalizadas, etiqueta tus libros y
                    mantén todo perfectamente organizado. Tu biblioteca, a tu
                    manera.
                  </p>
                </div>
                <div className="relative w-full aspect-square max-w-md mx-auto rounded-xl sm:rounded-2xl overflow-hidden border border-blue-500/20 shadow-xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
                  <img
                    src="/images/feature-organize.jpg"
                    alt="Organiza tu colección de libros"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Feature 2 */}
              <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
                <div className="relative w-full aspect-square max-w-md mx-auto rounded-xl sm:rounded-2xl overflow-hidden border border-purple-500/20 shadow-xl lg:order-first bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                  <img
                    src="/images/feature-read.jpg"
                    alt="Lee donde quieras"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent pb-2">
                    Lee donde quieras
                  </h2>
                  <p className="text-base sm:text-lg text-foreground/70 leading-relaxed font-medium">
                    Lector integrado y optimizado para EPUB, PDF y MOBI. Tus
                    libros sincronizados en todos tus dispositivos.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent pb-2">
                    Encuentra al instante
                  </h2>
                  <p className="text-base sm:text-lg text-foreground/70 leading-relaxed font-medium">
                    Búsqueda rápida y potente. Encuentra cualquier libro por
                    título, autor o etiqueta en segundos.
                  </p>
                </div>
                <div className="relative w-full aspect-square max-w-md mx-auto rounded-xl sm:rounded-2xl overflow-hidden border border-pink-500/20 shadow-xl bg-gradient-to-br from-pink-500/5 to-orange-500/5">
                  <img
                    src="/images/feature-search.jpg"
                    alt="Encuentra libros al instante"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Footer Colorido */}
          <footer className="relative border-t border-white/10 bg-white/5 backdrop-blur-xl py-8 sm:py-10 lg:py-12 px-4 sm:px-6">
            <div className="container mx-auto max-w-6xl">
              <div className="flex flex-col items-center gap-4 sm:gap-5 lg:gap-6">
                {/* Logo y nombre */}
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                    <Library className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    Shelvd
                  </span>
                </div>

                {/* Enlaces legales */}
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
                  <Link
                    href="/terms"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Términos y Condiciones
                  </Link>
                  <span className="text-muted-foreground/50">•</span>
                  <Link
                    href="/privacy"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Política de Privacidad
                  </Link>
                </div>

                {/* Copyright */}
                <p className="text-xs sm:text-sm text-muted-foreground text-center px-4">
                  © 2025 Shelvd - Tu biblioteca digital personal y privada
                </p>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* Diálogos de confirmación */}
      <DeleteConfirmDialog
        open={deleteCollectionDialogOpen}
        onOpenChange={setDeleteCollectionDialogOpen}
        onConfirm={confirmDeleteCollection}
        title="¿Eliminar colección?"
        description="¿Estás seguro de que quieres eliminar esta colección? Esta acción no se puede deshacer."
      />

      <DeleteConfirmDialog
        open={deleteBookDialogOpen}
        onOpenChange={setDeleteBookDialogOpen}
        onConfirm={confirmDeleteBook}
        title="¿Eliminar libro?"
        description={bookToDelete ? `¿Estás seguro de que quieres eliminar "${bookToDelete.title}"? Esta acción no se puede deshacer.` : "¿Estás seguro de que quieres eliminar este libro? Esta acción no se puede deshacer."}
      />
    </div>
  );
}
