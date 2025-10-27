'use client';

import { useEffect, useState } from 'react';
import { Collection, collectionsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Folder, FolderPlus, Trash2, Library } from 'lucide-react';
import CreateCollectionDialog from './CreateCollectionDialog';

interface CollectionsSidebarProps {
  selectedCollectionId: number | null;
  onSelectCollection: (id: number | null) => void;
}

export default function CollectionsSidebar({
  selectedCollectionId,
  onSelectCollection,
}: CollectionsSidebarProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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
    loadCollections();
  }, []);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Estás seguro de eliminar esta colección?')) return;

    setDeletingId(id);
    try {
      await collectionsApi.delete(id);
      await loadCollections();
      if (selectedCollectionId === id) {
        onSelectCollection(null);
      }
    } catch (error) {
      console.error('Error al eliminar colección:', error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Folder className="w-4 h-4" />
            Colecciones
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
            className="h-7 w-7 p-0"
          >
            <FolderPlus className="w-4 h-4" />
          </Button>
        </div>

        {/* Todos los libros */}
        <button
          onClick={() => onSelectCollection(null)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
            selectedCollectionId === null
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          }`}
        >
          <span className="flex items-center gap-2">
            <Library className="w-4 h-4" />
            Todos los libros
          </span>
        </button>

        {/* Lista de colecciones */}
        {loading ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Cargando...
          </div>
        ) : collections.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              No hay colecciones
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateDialogOpen(true)}
              className="mt-2"
            >
              <FolderPlus className="w-4 h-4" />
              Crear primera colección
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {collections.map((collection) => (
              <div
                key={collection.id}
                onClick={() => onSelectCollection(collection.id)}
                className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition-all ${
                  selectedCollectionId === collection.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Folder className="w-4 h-4 shrink-0" />
                  <span className="truncate">{collection.name}</span>
                  {collection.bookCount !== undefined && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {collection.bookCount}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDelete(collection.id, e)}
                  disabled={deletingId === collection.id}
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:text-destructive shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateCollectionDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={loadCollections}
      />
    </>
  );
}
