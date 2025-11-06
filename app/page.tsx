"use client";

import BackgroundBlobs from "@/components/BackgroundBlobs";
import BookCard from "@/components/BookCard";
import BookLoadingAnimation from "@/components/BookLoadingAnimation";
import CreateCollectionDialog from "@/components/CreateCollectionDialog";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import AddBooksToCollectionDialog from "@/components/AddBooksToCollectionDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useCollections } from "@/context/CollectionsContext";
import { Book, booksApi, Collection, collectionsApi } from "@/lib/api";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  BookPlus,
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
  const [deleteCollectionDialogOpen, setDeleteCollectionDialogOpen] =
    useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<number | null>(
    null
  );
  const [deleteBookDialogOpen, setDeleteBookDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  // 📚 Estados para agregar libros a colección
  const [addBooksDialogOpen, setAddBooksDialogOpen] = useState(false);
  const [currentCollection, setCurrentCollection] = useState<Collection | null>(null);

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
        description:
          error.message || "No se pudo subir el archivo. Intenta nuevamente.",
        duration: 5000,
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteBook = async (id: number) => {
    const book = books.find((b) => b.id === id);
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
      const { removeCachedBook } = await import("@/lib/bookCache");
      await removeCachedBook(bookToDelete.id).catch((err) => {
        console.warn("Error al limpiar caché del libro:", err);
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
        description:
          error.message || "No se pudo eliminar el libro. Intenta nuevamente.",
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

  return (
    <div className="min-h-screen relative">
      <BackgroundBlobs />
      {/* Modal de carga para subida de archivos */}
      <Dialog open={uploadingFile}>
        <DialogContent
          className="sm:max-w-[500px] border-0 p-0 overflow-hidden bg-transparent shadow-2xl"
          showCloseButton={false}
        >
          {/* Card principal con glassmorphism mejorado */}
          <div className="relative bg-gradient-to-br from-card/95 via-card/98 to-card/95 backdrop-blur-2xl rounded-2xl border border-border/50 shadow-2xl">
            {/* Fondo animado con gradiente mesh */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none mesh-gradient opacity-40"></div>

            {/* Efectos de blob flotantes con colores de la paleta */}
            <div className="absolute -top-20 -left-20 w-48 h-48 bg-gradient-to-br from-amber-500/30 to-yellow-500/20 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-gradient-to-br from-purple-500/25 to-blue-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-br from-cyan-500/20 to-blue-500/15 rounded-full blur-3xl animate-blob animation-delay-4000"></div>

            {/* Contenido */}
            <div className="relative z-10 px-8 py-10">
              {/* Animación del libro con efecto de elevación */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  {/* Glow effect detrás de la animación */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-purple-500/20 to-blue-500/20 blur-2xl rounded-full scale-150"></div>

                  {/* Animación Lottie */}
                  <div className="relative">
                    <BookLoadingAnimation />
                  </div>
                </div>
              </div>

              {/* Texto con diseño mejorado */}
              <div className="text-center space-y-5">
                {/* Título principal */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                    Subiendo tu libro
                  </h3>

                  {/* Indicador de puntos animados */}
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-amber-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">
                    Procesando tu archivo
                  </p>
                  <p className="text-xs text-muted-foreground/70 max-w-xs mx-auto">
                    Estamos preparando tu libro para que lo disfrutes en unos momentos
                  </p>
                </div>

                {/* Barra de progreso estilizada */}
                <div className="pt-4">
                  <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-full animate-pulse bg-[length:200%_100%] animate-[shimmer_2s_linear_infinite]"></div>
                  </div>
                </div>
              </div>
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
                    {selectedCollectionId !== null && (
                      <Button
                        onClick={() => {
                          const collection = collections.find(c => c.id === selectedCollectionId);
                          setCurrentCollection(collection || null);
                          setAddBooksDialogOpen(true);
                        }}
                        variant="secondary"
                        size="lg"
                        className="flex-1 sm:flex-none group"
                      >
                        <BookPlus className="w-4 h-4 transition-transform group-hover:scale-110" />
                        <span className="hidden sm:inline">Agregar de Biblioteca</span>
                        <span className="sm:hidden">De Biblioteca</span>
                      </Button>
                    )}
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
                <Tabs
                  value={selectedCollectionId?.toString() || "all"}
                  onValueChange={(value) =>
                    setSelectedCollectionId(value === "all" ? null : parseInt(value))
                  }
                >
                  <div className="overflow-x-auto scrollbar-hide">
                    <TabsList className="w-fit">
                      {/* Todos los libros */}
                      <TabsTrigger value="all" className="gap-2">
                        <Library className="w-4 h-4" />
                        Todos los libros
                      </TabsTrigger>

                      {/* Lista de colecciones */}
                      {collectionsLoading ? (
                        <div className="text-xs text-muted-foreground px-4 py-2">
                          Cargando...
                        </div>
                      ) : (
                        collections.map((collection) => (
                          <TabsTrigger
                            key={collection.id}
                            value={collection.id.toString()}
                            className="gap-2 group relative"
                            title={collection.name}
                          >
                            <Folder className="w-4 h-4 shrink-0" />
                            <span className="truncate">{collection.name}</span>
                            {collection.bookCount !== undefined && (
                              <Badge
                                variant="secondary"
                                className="text-xs px-1.5 py-0.5 shrink-0"
                              >
                                {collection.bookCount}
                              </Badge>
                            )}
                            <span
                              role="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteCollection(collection.id, e);
                              }}
                              className={`ml-1 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity p-0.5 rounded hover:bg-destructive/10 shrink-0 cursor-pointer ${
                                deletingCollectionId === collection.id ? "pointer-events-none opacity-50" : ""
                              }`}
                              aria-label="Eliminar colección"
                              tabIndex={-1}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </span>
                          </TabsTrigger>
                        ))
                      )}
                    </TabsList>
                  </div>
                </Tabs>
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
                      <p className="text-base font-medium text-foreground">
                        Cargando libros
                      </p>
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
                      {selectedCollectionId !== null ? (
                        <Folder className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                      ) : (
                        <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                      )}
                    </div>
                    <h3 className="text-base sm:text-xl font-semibold text-foreground mb-2">
                      {selectedCollectionId !== null
                        ? "Esta colección está vacía"
                        : "Tu biblioteca está vacía"}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                      {searchTitle
                        ? `No se encontraron libros que coincidan con "${searchTitle}"`
                        : selectedCollectionId !== null
                        ? "Agrega libros de tu biblioteca a esta colección"
                        : "Comienza agregando tu primer libro usando el botón de arriba"}
                    </p>
                    {!searchTitle && (
                      selectedCollectionId !== null ? (
                        <Button
                          onClick={() => {
                            const collection = collections.find(c => c.id === selectedCollectionId);
                            setCurrentCollection(collection || null);
                            setAddBooksDialogOpen(true);
                          }}
                          size="lg"
                          className="group"
                        >
                          <BookPlus className="w-4 h-4 transition-transform group-hover:scale-110" />
                          Agregar de Biblioteca
                        </Button>
                      ) : (
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
                      )
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
                        collectionId={selectedCollectionId}
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
        // Landing Page
        <div className="min-h-screen relative">
          <BackgroundBlobs />

          {/* Navbar */}
          <nav className="relative border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
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

          {/* Hero Section */}
          <section className="relative pt-16 sm:pt-24 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6">
            <div className="container relative mx-auto max-w-6xl">
              <div className="text-center space-y-8 sm:space-y-10">
                {/* Badge de gratis */}
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-semibold text-amber-300">
                      100% Gratis
                    </span>
                  </div>
                </div>

                {/* Nombre de la app */}
                <div className="space-y-4 sm:space-y-6">
                  <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight">
                    <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                      Shelvd
                    </span>
                  </h1>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground/90 px-4">
                    Tu biblioteca digital personal
                  </h2>
                </div>

                <p className="text-lg sm:text-xl lg:text-2xl text-foreground/70 max-w-3xl mx-auto px-4 leading-relaxed">
                  Sube tus libros en{" "}
                  <span className="font-semibold text-amber-400">EPUB</span>,{" "}
                  <span className="font-semibold text-yellow-300">PDF</span> y{" "}
                  <span className="font-semibold text-amber-300">MOBI</span>.
                  Léelos desde cualquier dispositivo.{" "}
                  <span className="font-bold text-cream-50">
                    Sin límites. Sin anuncios.
                  </span>
                </p>

                {/* Badges de formatos */}
                <div className="flex flex-wrap items-center justify-center gap-3 px-4">
                  <div className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="text-sm font-bold text-amber-300">
                      📚 EPUB
                    </span>
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <span className="text-sm font-bold text-yellow-300">
                      📄 PDF
                    </span>
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-amber-600/10 border border-amber-600/20">
                    <span className="text-sm font-bold text-amber-400">
                      📖 MOBI
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 sm:pt-6 lg:pt-8 w-full max-w-md sm:max-w-none px-4">
                  <Button
                    asChild
                    size="lg"
                    className="h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg w-full sm:w-auto group"
                  >
                    <Link href="/register">
                      Comenzar ahora
                      <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg border-2 hover:bg-accent w-full sm:w-auto"
                  >
                    <Link href="/login">Ya tengo cuenta</Link>
                  </Button>
                </div>

                {/* Trust indicators */}
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="relative py-8 sm:py-12 lg:py-20 px-4 sm:px-6">
            <div className="container mx-auto max-w-6xl">
              {/* Section Header */}
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
                  <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                    Todo lo que necesitas
                  </span>
                </h2>
                <p className="text-lg sm:text-xl text-foreground/70 max-w-2xl mx-auto">
                  Una plataforma completa para gestionar tu biblioteca digital
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Feature 1 - Subir libros */}
                <div className="group relative p-6 sm:p-8 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-amber-500/10">
                  <div className="mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">
                    Sube tus libros
                  </h3>
                  <p className="text-foreground/70 leading-relaxed">
                    Arrastra y suelta tus archivos EPUB, PDF o MOBI. Sin límites
                    de almacenamiento.
                  </p>
                </div>

                {/* Feature 2 - Lector integrado */}
                <div className="group relative p-6 sm:p-8 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/10">
                  <div className="mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-600 to-yellow-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">
                    Lector optimizado
                  </h3>
                  <p className="text-foreground/70 leading-relaxed">
                    Lee directamente en el navegador con nuestro lector rápido y
                    personalizable.
                  </p>
                </div>

                {/* Feature 3 - Colecciones */}
                <div className="group relative p-6 sm:p-8 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/10">
                  <div className="mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Folder className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">
                    Organiza en colecciones
                  </h3>
                  <p className="text-foreground/70 leading-relaxed">
                    Crea colecciones personalizadas para organizar tu biblioteca
                    a tu manera.
                  </p>
                </div>

                {/* Feature 4 - Multiplataforma */}
                <div className="group relative p-6 sm:p-8 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-slate-500/10">
                  <div className="mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Library className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">
                    Acceso desde cualquier lugar
                  </h3>
                  <p className="text-foreground/70 leading-relaxed">
                    Tu biblioteca sincronizada en todos tus dispositivos. PC,
                    tablet o móvil.
                  </p>
                </div>

                {/* Feature 5 - Búsqueda */}
                <div className="group relative p-6 sm:p-8 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/10">
                  <div className="mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Search className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">
                    Búsqueda instantánea
                  </h3>
                  <p className="text-foreground/70 leading-relaxed">
                    Encuentra cualquier libro por título o autor en segundos con
                    búsqueda en tiempo real.
                  </p>
                </div>

                {/* Feature 6 - Privacidad */}
                <div className="group relative p-6 sm:p-8 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-amber-500/10">
                  <div className="mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">
                    100% privado y seguro
                  </h3>
                  <p className="text-foreground/70 leading-relaxed">
                    Tus libros son solo tuyos. Sin publicidad, sin rastreo, sin
                    vender tus datos.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Final */}
          <section className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6">
            <div className="container mx-auto max-w-4xl">
              <div className="relative p-8 sm:p-12 lg:p-16 rounded-3xl bg-gradient-to-br from-amber-600/10 via-yellow-600/10 to-orange-600/10 border border-amber-500/20 backdrop-blur-sm overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl"></div>

                <div className="relative text-center space-y-6">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black">
                    <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                      ¿Listo para empezar?
                    </span>
                  </h2>
                  <p className="text-lg sm:text-xl text-foreground/70 max-w-2xl mx-auto">
                    Únete a miles de lectores que ya disfrutan de su biblioteca
                    digital personal
                  </p>
                  <div className="pt-4">
                    <Button
                      asChild
                      size="lg"
                      className="h-14 px-10 text-lg group"
                    >
                      <Link href="/register">
                        Comenzar ahora
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No requiere tarjeta de crédito
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="relative border-t border-white/10 bg-white/5 backdrop-blur-xl py-8 sm:py-10 lg:py-12 px-4 sm:px-6">
            <div className="container mx-auto max-w-6xl">
              <div className="flex flex-col items-center gap-4 sm:gap-5 lg:gap-6">
                {/* Logo y nombre */}
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-amber-600 to-yellow-600 rounded-lg">
                    <Library className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                    Shelvd
                  </span>
                </div>

                {/* Tagline */}
                <p className="text-sm text-muted-foreground text-center">
                  Tu biblioteca digital personal. Gratis, privado, sin límites.
                </p>

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
                <p className="text-xs text-muted-foreground text-center px-4">
                  © 2025 Shelvd - Hecho con 💜 para los amantes de la lectura
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
        description={
          bookToDelete
            ? `¿Estás seguro de que quieres eliminar "${bookToDelete.title}"? Esta acción no se puede deshacer.`
            : "¿Estás seguro de que quieres eliminar este libro? Esta acción no se puede deshacer."
        }
      />

      {/* Diálogo para agregar libros a colección */}
      <AddBooksToCollectionDialog
        collection={currentCollection}
        open={addBooksDialogOpen}
        onOpenChange={setAddBooksDialogOpen}
        onSuccess={() => {
          loadBooks();
          loadCollections();
        }}
      />
    </div>
  );
}
