// Utilidades para cachear libros EPUB en IndexedDB

const DB_NAME = "ShelvdBooksCache";
const STORE_NAME = "books";
const DB_VERSION = 1;

interface CachedBook {
  id: number;
  data: ArrayBuffer;
  timestamp: number;
  bookUrl: string;
}

// Abrir o crear la base de datos IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

// Guardar un libro en caché
export async function cacheBook(
  bookId: number,
  data: ArrayBuffer,
  bookUrl: string
): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const cachedBook: CachedBook = {
      id: bookId,
      data,
      timestamp: Date.now(),
      bookUrl,
    };

    return new Promise((resolve, reject) => {
      const request = store.put(cachedBook);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error al guardar libro en caché:", error);
    throw error;
  }
}

// Obtener un libro del caché
export async function getCachedBook(
  bookId: number,
  currentBookUrl: string
): Promise<ArrayBuffer | null> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(bookId);

      request.onsuccess = () => {
        const result = request.result as CachedBook | undefined;

        // Si no existe en caché, retornar null
        if (!result) {
          resolve(null);
          return;
        }

        // Extraer la parte de la URL sin el token de firma (para Supabase signed URLs)
        // La URL base será la misma si el archivo no cambió
        const getBaseUrl = (url: string) => {
          try {
            const urlObj = new URL(url);
            // Remover los query params (token, exp, etc)
            return urlObj.origin + urlObj.pathname;
          } catch {
            return url;
          }
        };

        const cachedBaseUrl = getBaseUrl(result.bookUrl);
        const currentBaseUrl = getBaseUrl(currentBookUrl);

        // Si la URL base cambió (diferente archivo), invalidar caché
        if (cachedBaseUrl !== currentBaseUrl) {
          console.log("Archivo del libro cambió, invalidando caché");
          resolve(null);
          return;
        }

        // Retornar el libro cacheado
        console.log("Libro encontrado en caché");
        resolve(result.data);
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error al obtener libro del caché:", error);
    return null;
  }
}

// Eliminar un libro del caché
export async function removeCachedBook(bookId: number): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.delete(bookId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error al eliminar libro del caché:", error);
    throw error;
  }
}

// Limpiar todo el caché
export async function clearBookCache(): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error al limpiar caché:", error);
    throw error;
  }
}

// Obtener información sobre el caché (útil para debugging)
export async function getCacheInfo(): Promise<{
  count: number;
  size: number;
}> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => {
        const books = request.result as CachedBook[];
        const size = books.reduce(
          (total, book) => total + book.data.byteLength,
          0
        );

        resolve({
          count: books.length,
          size: size,
        });
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error al obtener info del caché:", error);
    return { count: 0, size: 0 };
  }
}
