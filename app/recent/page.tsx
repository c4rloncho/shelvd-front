"use client";

import BookCard from "@/components/BookCard";
import BookLoadingAnimation from "@/components/BookLoadingAnimation";
import BackgroundBlobs from "@/components/BackgroundBlobs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { Book, booksApi } from "@/lib/api";
import { AlertCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function RecentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [books, setBooks] = useState<Book[]>([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"reading" | "completed">("reading");

  // Paginación
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Estados para confirmación de eliminación
  const [deleteBookDialogOpen, setDeleteBookDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  // Cargar libros recientes
  const loadRecentBooks = async () => {
    if (!user) return;

    setBooksLoading(true);
    setError(null);
    try {
      const response = await booksApi.getAll({
        readingStatus: filter,
        page,
        limit,
      });

      // Filtrar para mostrar solo los libros que coincidan exactamente con el filtro
      const filteredBooks = response.data.filter((book: Book) => {
        return book.readingStatus === filter;
      });

      setBooks(filteredBooks);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error al cargar libros recientes:", error);
      setError("Error al cargar los libros");
    } finally {
      setBooksLoading(false);
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

      await loadRecentBooks();
      setDeleteBookDialogOpen(false);

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
          error.message ||
          "No se pudo eliminar el libro. Intenta nuevamente.",
      });
    } finally {
      setBookToDelete(null);
    }
  };

  useEffect(() => {
    if (user && !loading) {
      loadRecentBooks();
    }
  }, [user, loading, page, filter]);

  // Redirect si no está autenticado
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Reset page cuando cambia el filtro
  useEffect(() => {
    setPage(1);
  }, [filter]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background relative">
        <BackgroundBlobs />
        <div className="flex flex-col items-center justify-center gap-6 relative z-10">
          <BookLoadingAnimation />
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Cargando lecturas
            </h2>
            <p className="text-sm text-muted-foreground animate-pulse">
              Preparando tus lecturas recientes...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen relative">
      <BackgroundBlobs />
      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 relative z-10">
        <div className="w-full max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                Lecturas Recientes
              </h1>
            </div>
            <p className="text-sm text-muted-foreground ml-14">
              Libros que estás leyendo o has completado
            </p>
          </div>

          {/* Filtros */}
          <div className="mb-6">
            <Tabs
              value={filter}
              onValueChange={(value) =>
                setFilter(value as "reading" | "completed")
              }
            >
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="reading">Leyendo</TabsTrigger>
                <TabsTrigger value="completed">Completados</TabsTrigger>
              </TabsList>
            </Tabs>
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
                      Buscando tus lecturas...
                    </p>
                  </div>
                </div>
              </CardContent>
            ) : books.length === 0 ? (
              <CardContent className="py-16 sm:py-24 px-4">
                <div className="text-center flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
                  </div>
                  <h3 className="text-base sm:text-xl font-semibold text-foreground mb-2">
                    {filter === "reading"
                      ? "No tienes libros en lectura"
                      : "No has completado ningún libro aún"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                    {filter === "reading"
                      ? "Comienza a leer un libro desde tu biblioteca"
                      : "Termina de leer un libro para verlo aquí"}
                  </p>
                  <Button
                    onClick={() => router.push("/dashboard")}
                    size="lg"
                    className="group"
                  >
                    Ir a Mi Biblioteca
                  </Button>
                </div>
              </CardContent>
            ) : (
              <CardContent className="p-4 sm:p-8 pb-8 sm:pb-12">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-4 sm:gap-6">
                  {books.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onDelete={handleDeleteBook}
                      onCollectionChange={loadRecentBooks}
                    />
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Controles de paginación */}
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

              {/* Paginación */}
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
        </div>
      </main>

      {/* Diálogo de confirmación de eliminación */}
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
    </div>
  );
}
