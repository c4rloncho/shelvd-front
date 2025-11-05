'use client';

import { useEffect, useState } from 'react';
import { Collection, collectionsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Folder, FolderPlus, Trash2, Library } from 'lucide-react';
import { useCollections } from '@/context/CollectionsContext';
import CreateCollectionDialog from './CreateCollectionDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { toast } from 'sonner';

interface CollectionsMobileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CollectionsMobileSheet({ open, onOpenChange }: CollectionsMobileSheetProps) {
  const { selectedCollectionId, setSelectedCollectionId } = useCollections();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<number | null>(null);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const data = await collectionsApi.getAll();
      setCollections(data);
    } catch (error) {
      console.error('Error al cargar colecciones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadCollections();
    }
  }, [open]);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollectionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!collectionToDelete) return;

    setDeletingId(collectionToDelete);
    try {
      await collectionsApi.delete(collectionToDelete);
      await loadCollections();
      if (selectedCollectionId === collectionToDelete) {
        setSelectedCollectionId(null);
      }
      setDeleteDialogOpen(false); // Cerrar diálogo después de eliminar

      // Mostrar toast de éxito
      toast.success("Colección eliminada", {
        description: "La colección ha sido eliminada exitosamente.",
      });
    } catch (error) {
      console.error('Error al eliminar colección:', error);

      // Mostrar toast de error
      toast.error("Error al eliminar", {
        description: "No se pudo eliminar la colección. Intenta nuevamente.",
      });
    } finally {
      setDeletingId(null);
      setCollectionToDelete(null);
    }
  };

  const handleSelectCollection = (id: number | null) => {
    setSelectedCollectionId(id);
    onOpenChange(false); // Cerrar el sheet al seleccionar
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
          <SheetHeader className="text-left mb-6">
            <SheetTitle className="flex items-center gap-2 text-2xl">
              <Folder className="w-6 h-6" />
              Colecciones
            </SheetTitle>
            <SheetDescription>
              Organiza tus libros en colecciones
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-3 overflow-y-auto max-h-[calc(80vh-120px)] pb-4">
            {/* Botón crear colección */}
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => setCreateDialogOpen(true)}
            >
              <FolderPlus className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Crear nueva colección</div>
                <div className="text-xs text-muted-foreground">Organiza tus libros</div>
              </div>
            </Button>

            {/* Todos los libros */}
            <button
              onClick={() => handleSelectCollection(null)}
              className={`w-full flex items-center justify-between px-4 py-4 rounded-lg text-left transition-all ${
                selectedCollectionId === null
                  ? 'bg-primary/10 text-primary border-2 border-primary'
                  : 'bg-accent hover:bg-accent/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Library className="w-5 h-5" />
                <div>
                  <div className="font-semibold">Todos los libros</div>
                  <div className="text-xs text-muted-foreground">Ver toda tu biblioteca</div>
                </div>
              </div>
              {selectedCollectionId === null && (
                <Badge variant="default">Actual</Badge>
              )}
            </button>

            {/* Lista de colecciones */}
            {loading ? (
              <div className="py-12 text-center text-muted-foreground">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                Cargando colecciones...
              </div>
            ) : collections.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Folder className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">
                  Aún no tienes colecciones
                </p>
                <Button
                  variant="default"
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <FolderPlus className="w-4 h-4" />
                  Crear primera colección
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {collections.map((collection) => (
                  <div
                    key={collection.id}
                    onClick={() => handleSelectCollection(collection.id)}
                    className={`group flex items-center justify-between px-4 py-4 rounded-lg cursor-pointer transition-all ${
                      selectedCollectionId === collection.id
                        ? 'bg-primary/10 text-primary border-2 border-primary'
                        : 'bg-accent hover:bg-accent/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Folder className="w-5 h-5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold truncate">{collection.name}</div>
                        {collection.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {collection.description}
                          </div>
                        )}
                      </div>
                      {collection.bookCount !== undefined && (
                        <Badge variant="secondary" className="ml-2">
                          {collection.bookCount}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(collection.id, e)}
                      disabled={deletingId === collection.id}
                      className="ml-2 h-9 w-9 p-0 shrink-0 hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <CreateCollectionDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={loadCollections}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="¿Eliminar colección?"
        description="¿Estás seguro de que quieres eliminar esta colección? Esta acción no se puede deshacer."
      />
    </>
  );
}
