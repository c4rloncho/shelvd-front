/**
 * Sistema de caché de imágenes usando IndexedDB
 * Guarda las imágenes en el navegador para evitar peticiones repetidas al servidor
 */

const DB_NAME = 'shelvd-image-cache';
const STORE_NAME = 'covers';
const DB_VERSION = 1;
const CACHE_EXPIRY_DAYS = 30; // Días antes de que expire una imagen en caché

export interface CachedImage {
  url: string;
  blob: Blob;
  timestamp: number;
  bookId: number;
}

class ImageCacheManager {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Inicializa la base de datos IndexedDB
   */
  private async initDB(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Error al abrir IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Crear el almacén de objetos si no existe
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'url' });
          objectStore.createIndex('bookId', 'bookId', { unique: false });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Guarda una imagen en el caché
   */
  async cacheImage(url: string, bookId: number): Promise<void> {
    try {
      await this.initDB();
      if (!this.db) return;

      // Descargar la imagen como blob
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al descargar la imagen');

      const blob = await response.blob();
      const cachedImage: CachedImage = {
        url,
        blob,
        timestamp: Date.now(),
        bookId
      };

      // Guardar en IndexedDB
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(cachedImage);

        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.error('Error al guardar imagen en caché:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error al cachear imagen:', error);
      // No lanzamos el error para no romper la UI
    }
  }

  /**
   * Obtiene una imagen del caché
   */
  async getCachedImage(url: string): Promise<string | null> {
    try {
      await this.initDB();
      if (!this.db) return null;

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(url);

        request.onsuccess = () => {
          const result = request.result as CachedImage | undefined;

          if (!result) {
            resolve(null);
            return;
          }

          // Verificar si la imagen ha expirado
          const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
          const isExpired = Date.now() - result.timestamp > expiryTime;

          if (isExpired) {
            // Eliminar imagen expirada
            this.deleteCachedImage(url);
            resolve(null);
            return;
          }

          // Convertir blob a URL
          const blobUrl = URL.createObjectURL(result.blob);
          resolve(blobUrl);
        };

        request.onerror = () => {
          console.error('Error al obtener imagen del caché:', request.error);
          resolve(null);
        };
      });
    } catch (error) {
      console.error('Error al obtener imagen cacheada:', error);
      return null;
    }
  }

  /**
   * Elimina una imagen del caché
   */
  async deleteCachedImage(url: string): Promise<void> {
    try {
      await this.initDB();
      if (!this.db) return;

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(url);

        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.error('Error al eliminar imagen del caché:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error al eliminar imagen cacheada:', error);
    }
  }

  /**
   * Limpia todas las imágenes expiradas del caché
   */
  async cleanExpiredCache(): Promise<void> {
    try {
      await this.initDB();
      if (!this.db) return;

      const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      const cutoffTime = Date.now() - expiryTime;

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('timestamp');
        const request = index.openCursor();

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;

          if (cursor) {
            const cachedImage = cursor.value as CachedImage;
            if (cachedImage.timestamp < cutoffTime) {
              cursor.delete();
            }
            cursor.continue();
          } else {
            resolve();
          }
        };

        request.onerror = () => {
          console.error('Error al limpiar caché expirado:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error al limpiar caché:', error);
    }
  }

  /**
   * Obtiene el tamaño total del caché (aproximado)
   */
  async getCacheSize(): Promise<number> {
    try {
      await this.initDB();
      if (!this.db) return 0;

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          const images = request.result as CachedImage[];
          const totalSize = images.reduce((sum, img) => sum + img.blob.size, 0);
          resolve(totalSize);
        };

        request.onerror = () => {
          console.error('Error al obtener tamaño del caché:', request.error);
          resolve(0);
        };
      });
    } catch (error) {
      console.error('Error al calcular tamaño del caché:', error);
      return 0;
    }
  }

  /**
   * Limpia todo el caché
   */
  async clearAllCache(): Promise<void> {
    try {
      await this.initDB();
      if (!this.db) return;

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.error('Error al limpiar todo el caché:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error al limpiar caché completo:', error);
    }
  }
}

// Exportar instancia singleton
export const imageCacheManager = new ImageCacheManager();
