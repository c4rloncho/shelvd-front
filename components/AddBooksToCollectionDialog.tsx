'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collection, collectionsApi, Book, booksApi } from '@/lib/api';
import { BookOpen, Check, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AddBooksToCollectionDialogProps {
  collection: Collection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function AddBooksToCollectionDialog({
  collection,
  open,
  onOpenChange,
  onSuccess,
}: AddBooksToCollectionDialogProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [selectedBooks, setSelectedBooks] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      // Obtener todos los libros de la biblioteca del usuario
      const response = await booksApi.getAll({ limit: 1000 }); // Obtener todos los libros
      const allBooks = response.data || [];
      setBooks(allBooks);
      setFilteredBooks(allBooks);

      // Si la colección tiene libros, marcarlos como seleccionados
      if (collection?.books) {
        setSelectedBooks(new Set(collection.books.map(b => b.id)));
      }
    } catch (error) {
      console.error('Error al cargar libros:', error);
      toast.error("Error", {
        description: "No se pudieron cargar los libros.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && collection) {
      loadBooks();
    } else {
      // Reset cuando se cierra
      setSearchQuery('');
      setSelectedBooks(new Set());
    }
  }, [open, collection]);

  // Filtrar libros por búsqueda
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBooks(books);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredBooks(
        books.filter(
          (book) =>
            book.title.toLowerCase().includes(query) ||
            book.author?.toLowerCase().includes(query) ||
            book.description?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, books]);

  const handleToggleBook = async (bookId: number) => {
    if (!collection) return;

    setProcessingId(bookId);
    const book = books.find(b => b.id === bookId);
    const bookTitle = book?.title || 'el libro';

    try {
      const isInCollection = selectedBooks.has(bookId);

      if (isInCollection) {
        await collectionsApi.removeBook(collection.id, bookId);
        setSelectedBooks(prev => {
          const newSet = new Set(prev);
          newSet.delete(bookId);
          return newSet;
        });

        toast.info("Libro removido", {
          description: `"${bookTitle}" removido de "${collection.name}".`,
        });
      } else {
        await collectionsApi.addBook(collection.id, bookId);
        setSelectedBooks(prev => new Set(prev).add(bookId));

        toast.success("¡Libro agregado! ✨", {
          description: `"${bookTitle}" agregado a "${collection.name}".`,
          duration: 4000,
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error al modificar libro en colección:', error);

      toast.error("Error", {
        description: "No se pudo modificar el libro en la colección.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Agregar Libros a Colección
          </DialogTitle>
          <DialogDescription>
            {collection?.name && (
              <span className="block mt-1 font-medium text-foreground/80">
                {collection.name}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Barra de búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, autor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Lista de libros */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Cargando libros...
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No se encontraron libros con esa búsqueda.' : 'No tienes libros en tu biblioteca.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 py-2">
              {filteredBooks.map((book) => {
                const isInCollection = selectedBooks.has(book.id);
                const isProcessing = processingId === book.id;

                return (
                  <button
                    key={book.id}
                    onClick={() => handleToggleBook(book.id)}
                    disabled={isProcessing}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                      isInCollection
                        ? 'bg-primary/10 border-primary'
                        : 'bg-card border-border hover:bg-accent'
                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {/* Cover del libro */}
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-12 h-16 object-cover rounded shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-muted rounded flex items-center justify-center shrink-0">
                        <BookOpen className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}

                    {/* Info del libro */}
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-medium text-sm truncate">
                        {book.title}
                      </p>
                      {book.author && (
                        <p className="text-xs text-muted-foreground truncate">
                          {book.author}
                        </p>
                      )}
                    </div>

                    {/* Check icon */}
                    {isInCollection && (
                      <Check className="w-5 h-5 shrink-0 text-primary" />
                    )}

                    {/* Loading spinner */}
                    {isProcessing && (
                      <Loader2 className="w-5 h-5 shrink-0 animate-spin" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {selectedBooks.size} {selectedBooks.size === 1 ? 'libro seleccionado' : 'libros seleccionados'}
          </p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
