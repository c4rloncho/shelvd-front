'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { collectionsApi, CreateCollectionData } from '@/lib/api';
import { FolderPlus } from 'lucide-react';
import { toast } from 'sonner';

interface CreateCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function CreateCollectionDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateCollectionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateCollectionData>({
    name: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const collectionName = formData.name;

    try {
      await collectionsApi.create(formData);
      setFormData({ name: '', description: '' });
      onOpenChange(false);
      onSuccess?.();

      // Toast de éxito con emoji genial
      toast.success("¡Colección creada! 🎉", {
        description: `"${collectionName}" está lista para organizar tus libros.`,
        duration: 4000,
      });
    } catch (err: any) {
      setError(err.message || 'Error al crear la colección');

      // Toast de error
      toast.error("Error al crear colección", {
        description: err.message || "No se pudo crear la colección. Intenta nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5" />
            Nueva Colección
          </DialogTitle>
          <DialogDescription>
            Crea una nueva colección para organizar tus libros
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Nombre *
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Ej: Ciencia Ficción, Favoritos..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
              Descripción (opcional)
            </label>
            <Input
              id="description"
              type="text"
              placeholder="Describe tu colección..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
              <p className="text-sm text-red-800 dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading ? 'Creando...' : 'Crear Colección'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
