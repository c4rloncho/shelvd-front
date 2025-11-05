'use client';

import { Book } from '@/lib/api';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCachedImage } from '@/lib/hooks/useCachedImage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AddToCollectionDialog from './AddToCollectionDialog';

interface BookCardProps {
  book: Book;
  onDelete?: (id: number) => void;
  onCollectionChange?: () => void;
}

export default function BookCard({ book, onDelete, onCollectionChange }: BookCardProps) {
  const router = useRouter();
  const { imageSrc, isLoading, hasError } = useCachedImage(book.coverUrl, book.id);
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const badges = {
      unread: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Sin leer' },
      reading: { bg: 'bg-blue-500/20 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400', label: 'Leyendo' },
      completed: { bg: 'bg-green-500/20 dark:bg-green-500/20', text: 'text-green-600 dark:text-green-400', label: 'Completado' },
    };

    const badge = badges[status as keyof typeof badges] || badges.unread;

    return (
      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getRatingStars = (rating: number | null) => {
    if (!rating) return null;

    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-muted-foreground/30'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const handleCardClick = () => {
    // Navegar al lector de EPUB
    router.push(`/reader/${book.id}`);
  };

  const handleDownload = async () => {
    if (!book.bookUrl) {
      alert('URL del libro no disponible');
      return;
    }

    try {
      // Descargar el libro
      const response = await fetch(book.bookUrl);

      if (!response.ok) {
        throw new Error(`Error al descargar: ${response.status}`);
      }

      const blob = await response.blob();

      // Crear un enlace temporal para descargar
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${book.title}.epub`;
      document.body.appendChild(a);
      a.click();

      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al descargar el libro:', error);
      alert('Error al descargar el libro');
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      {/* Contenedor clickeable */}
      <div
        className="cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Imagen de portada */}
        <div className="aspect-[2/3] relative bg-muted overflow-hidden">
          {isLoading ? (
            // Skeleton mientras carga
            <div className="w-full h-full bg-muted animate-pulse" />
          ) : imageSrc && !hasError ? (
            <Image
              src={imageSrc}
              alt={book.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized={imageSrc.startsWith('blob:')}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <svg
                className="w-16 h-16 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Información del libro */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              {getStatusBadge(book.readingStatus)}
            </div>

            {/* Menú de tres puntos */}
            {onDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="rounded-full p-1 hover:bg-muted transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <svg
                      className="w-4 h-4 text-muted-foreground"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCollectionDialogOpen(true);
                    }}
                  >
                    Agregar a colección
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload();
                    }}
                  >
                    Descargar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(book.id);
                    }}
                  >
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <h3 className="font-semibold text-card-foreground text-sm mb-1 line-clamp-2 min-h-[2.5rem]">
            {book.title}
          </h3>

          {book.author && (
            <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
              {book.author}
            </p>
          )}

          {book.rating && (
            <div className="mb-2">
              {getRatingStars(book.rating)}
            </div>
          )}

          {/* Barra de progreso */}
          {book.bookProgress && book.bookProgress.progressPercentage > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">
                  Progreso
                </span>
                <span className="text-xs font-medium text-primary">
                  {Math.round(book.bookProgress.progressPercentage)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${book.bookProgress.progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground/80">
            {book.pageCount && (
              <span>{book.pageCount} páginas</span>
            )}
            {book.publishedDate && (
              <span>{new Date(book.publishedDate).getFullYear()}</span>
            )}
          </div>
        </div>
      </div>

      {/* Diálogo para agregar a colección */}
      <AddToCollectionDialog
        book={book}
        open={collectionDialogOpen}
        onOpenChange={setCollectionDialogOpen}
        onSuccess={onCollectionChange}
      />
    </div>
  );
}
