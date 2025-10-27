'use client';

import { useEffect } from 'react';
import { imageCacheManager } from '@/lib/imageCache';

/**
 * Componente que se encarga de limpiar el caché de imágenes expiradas
 * Se ejecuta automáticamente cuando la aplicación se carga
 */
export default function CacheCleaner() {
  useEffect(() => {
    const cleanCache = async () => {
      try {
        // Limpiar imágenes expiradas
        await imageCacheManager.cleanExpiredCache();

        // Opcional: Mostrar el tamaño del caché en consola (solo en desarrollo)
        if (process.env.NODE_ENV === 'development') {
          const cacheSize = await imageCacheManager.getCacheSize();
          const cacheSizeMB = (cacheSize / (1024 * 1024)).toFixed(2);
          console.log(`📦 Caché de imágenes: ${cacheSizeMB} MB`);
        }
      } catch (error) {
        console.error('Error al limpiar caché de imágenes:', error);
      }
    };

    // Ejecutar limpieza al cargar la aplicación
    cleanCache();

    // Opcional: Limpiar cada 24 horas si la app está abierta
    const interval = setInterval(cleanCache, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Este componente no renderiza nada
  return null;
}
