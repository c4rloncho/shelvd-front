'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collection, collectionsApi, Book } from '@/lib/api';
import { FolderPlus, Check, Folder } from 'lucide-react';
import CreateCollectionDialog from './CreateCollectionDialog';
import { toast } from 'sonner';

interface AddToCollectionDialogProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function AddToCollectionDialog({
  book,
  open,
  onOpenChange,
  onSuccess,
}: AddToCollectionDialogProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [bookCollections, setBookCollections] = useState<Set<number>>(new Set());

  const loadCollections = async () => {
    setLoading(true);
    try {
      const data = await collectionsApi.getAll();
      setCollections(data);

      // Si el libro tiene colecciones, marcarlas
      if (book?.collections) {
        setBookCollections(new Set(book.collections.map(c => c.id)));
      }
    } catch (error) {
      console.error('Error al cargar colecciones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && book) {
      loadCollections();
    }
  }, [open, book]);

  const handleToggleCollection = async (collectionId: number) => {
    if (!book) return;

    setProcessingId(collectionId);
    const collection = collections.find(c => c.id === collectionId);
    const collectionName = collection?.name || 'la colección';

    try {
      const isInCollection = bookCollections.has(collectionId);

      if (isInCollection) {
        await collectionsApi.removeBook(collectionId, book.id);
        setBookCollections(prev => {
          const newSet = new Set(prev);
          newSet.delete(collectionId);
          return newSet;
        });

        // Toast al remover
        toast.info("Libro removido", {
          description: `"${book.title}" removido de "${collectionName}".`,
        });
      } else {
        await collectionsApi.addBook(collectionId, book.id);
        setBookCollections(prev => new Set(prev).add(collectionId));

        // Toast al agregar con emoji genial
        toast.success("¡Libro agregado! ✨", {
          description: `"${book.title}" agregado a "${collectionName}".`,
          duration: 4000,
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error al modificar colección:', error);

      // Toast de error
      toast.error("Error", {
        description: "No se pudo modificar la colección. Intenta nuevamente.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleCreateSuccess = async () => {
    await loadCollections();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Folder className="w-5 h-5" />
              Agregar a Colección
            </DialogTitle>
            <DialogDescription>
              {book?.title && (
                <span className="block mt-1 font-medium text-foreground/80">
                  {book.title}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-3">
            {/* Botón crear nueva colección */}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setCreateDialogOpen(true)}
            >
              <FolderPlus className="w-4 h-4" />
              Crear nueva colección
            </Button>

            {/* Lista de colecciones */}
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Cargando colecciones...
              </div>
            ) : collections.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  No tienes colecciones aún
                </p>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <FolderPlus className="w-4 h-4" />
                  Crear primera colección
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {collections.map((collection) => {
                  const isInCollection = bookCollections.has(collection.id);
                  const isProcessing = processingId === collection.id;

                  return (
                    <button
                      key={collection.id}
                      onClick={() => handleToggleCollection(collection.id)}
                      disabled={isProcessing}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${
                        isInCollection
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-card border-border hover:bg-accent'
                      } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Folder className="w-4 h-4 shrink-0" />
                        <div className="text-left min-w-0">
                          <p className="font-medium text-sm truncate">
                            {collection.name}
                          </p>
                          {collection.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {collection.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {isInCollection && (
                        <Check className="w-5 h-5 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CreateCollectionDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}
