import { useState, useEffect, useRef } from 'react';
import { imageCacheManager } from '../imageCache';

interface UseCachedImageReturn {
  /** URL de la imagen (puede ser del caché o la original) */
  imageSrc: string | null;
  /** Indica si la imagen está cargando */
  isLoading: boolean;
  /** Indica si hubo un error al cargar la imagen */
  hasError: boolean;
  /** Indica si la imagen viene del caché */
  isFromCache: boolean;
}

/**
 * Hook personalizado para cargar imágenes con caché automático
 *
 * @param originalUrl - URL original de la imagen
 * @param bookId - ID del libro (para organizar el caché)
 * @returns Objeto con la URL de la imagen, estado de carga y error
 *
 * @example
 * ```tsx
 * const { imageSrc, isLoading, hasError, isFromCache } = useCachedImage(
 *   book.coverUrl,
 *   book.id
 * );
 *
 * if (isLoading) return <Skeleton />;
 * if (hasError) return <DefaultIcon />;
 * return <img src={imageSrc} alt="Cover" />;
 * ```
 */
export function useCachedImage(
  originalUrl: string | null | undefined,
  bookId: number
): UseCachedImageReturn {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFromCache, setIsFromCache] = useState(false);

  // Mantener referencia a la URL del blob para limpiarla después
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    // Si no hay URL original, terminar inmediatamente
    if (!originalUrl) {
      setImageSrc(null);
      setIsLoading(false);
      setHasError(false);
      setIsFromCache(false);
      return;
    }

    let isMounted = true;

    const loadImage = async () => {
      setIsLoading(true);
      setHasError(false);
      setIsFromCache(false);

      try {
        // 1. Intentar obtener la imagen del caché primero
        const cachedUrl = await imageCacheManager.getCachedImage(originalUrl);

        if (!isMounted) return;

        if (cachedUrl) {
          // Imagen encontrada en caché
          blobUrlRef.current = cachedUrl;
          setImageSrc(cachedUrl);
          setIsFromCache(true);
          setIsLoading(false);
        } else {
          // 2. No está en caché, usar la URL original
          setImageSrc(originalUrl);
          setIsFromCache(false);
          setIsLoading(false);

          // 3. Cachear la imagen en segundo plano (sin bloquear)
          imageCacheManager.cacheImage(originalUrl, bookId).catch((error) => {
            console.warn('No se pudo cachear la imagen:', error);
            // No mostramos error al usuario porque la imagen ya se está mostrando
          });
        }
      } catch (error) {
        console.error('Error al cargar imagen:', error);
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    loadImage();

    // Cleanup: Liberar la URL del blob cuando el componente se desmonte
    return () => {
      isMounted = false;
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [originalUrl, bookId]);

  return {
    imageSrc,
    isLoading,
    hasError,
    isFromCache
  };
}
