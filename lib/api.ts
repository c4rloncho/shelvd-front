// Configuración base de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    timeoutMs: number = 30000 // 30 segundos por defecto
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Crear un AbortController para manejar el timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const config: RequestInit = {
      ...options,
      credentials: "include", // Importante para enviar cookies
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: "Error en la petición",
        }));
        throw new Error(
          error.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(
            `La petición ha tardado demasiado tiempo. Por favor, verifica tu conexión a internet e intenta nuevamente.`
          );
        }
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error(
            'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet y que el servidor esté funcionando.'
          );
        }
        throw error;
      }
      throw new Error("Error desconocido");
    }
  }

  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // Método especial para FormData (upload de archivos)
  async postFormData<T = any>(
    endpoint: string,
    formData: FormData,
    timeoutMs: number = 60000 // 60 segundos por defecto
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Crear un AbortController para manejar el timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        credentials: "include",
        signal: controller.signal,
        // No establecer Content-Type para FormData, el navegador lo hace automáticamente
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: "Error en la petición",
        }));
        throw new Error(
          error.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(
            `La subida ha tardado demasiado tiempo (más de ${timeoutMs / 1000} segundos). Por favor, verifica tu conexión a internet o intenta con un archivo más pequeño.`
          );
        }
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error(
            'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet y que el servidor esté funcionando.'
          );
        }
      }

      throw error;
    }
  }
}

export const api = new ApiClient(API_URL);

// Tipos para la autenticación
export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  identifier: string; // email o username
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  photo?: string;
  maxBooks?: number;
  bookCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  username?: string;
  email?: string;
  password?: string;
  photo?: File;
}

// Tipos para libros
export interface Book {
  id: number;
  title: string;
  description: string | null;
  author: string | null;
  isbn: string | null;
  publisher: string | null;
  publishedDate: string | null;
  coverPath: string | null;
  coverPublicId: string | null;
  pageCount: number | null;
  filePath: string;
  readingStatus: "unread" | "reading" | "completed";
  rating: number | null;
  isFavorite: boolean;
  addedAt: string;
  updatedAt: string;
  bookUrl: string | null;
  coverUrl: string | null;
  bookProgress?: {
    currentLocation: number;
    totalLocations: number;
    currentCFI: string | null;
    progressPercentage: number;
    isCompleted: boolean;
  };
  collections?: Collection[];
}

// Tipos para colecciones
export interface Collection {
  id: number;
  name: string;
  description: string | null;
  books?: Book[];
  bookCount?: number;
  createdAt?: string;
}

export interface CreateCollectionData {
  name: string;
  description?: string;
  bookIds?: number[];
}

export interface UpdateCollectionData {
  name?: string;
  description?: string;
}

// Funciones de autenticación
export const authApi = {
  register: async (data: RegisterData): Promise<ApiResponse> => {
    return api.post("/auth/register", data);
  },

  login: async (data: LoginData): Promise<ApiResponse> => {
    return api.post("/auth/login", data);
  },

  logout: async (): Promise<ApiResponse> => {
    return api.post("/auth/logout");
  },

  getMe: async (): Promise<User> => {
    return api.get("/auth/me");
  },

  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    if (data.photo) {
      const formData = new FormData();
      if (data.username) formData.append("username", data.username);
      if (data.email) formData.append("email", data.email);
      if (data.password) formData.append("password", data.password);
      formData.append("photo", data.photo);

      return api.postFormData("/auth/profile", formData);
    } else {
      return api.patch("/auth/profile", data);
    }
  },
};

// Funciones para libros
export const booksApi = {
  // 📄 Obtener todos los libros con filtro y paginación
  getAll: async (params?: {
    title?: string;
    page?: number;
    limit?: number;
    readingStatus?: "unread" | "reading" | "completed";
  }) => {
    const query = new URLSearchParams();

    if (params?.title) query.append("title", params.title);
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.readingStatus) query.append("readingStatus", params.readingStatus);

    // GET /books?title=algo&page=2&limit=8&readingStatus=reading
    const res = await api.get(`/books?${query.toString()}`);

    // El backend devuelve un objeto con { total, page, limit, totalPages, data }
    return res;
  },

  // 📘 Obtener libro por ID
  getById: async (id: number): Promise<Book> => {
    return api.get(`/books/${id}`);
  },

  // 📤 Subir libro
  upload: async (file: File): Promise<Book> => {
    const formData = new FormData();
    formData.append("file", file);
    // Timeout de 5 minutos para archivos grandes
    return api.postFormData("/books", formData, 300000);
  },

  // 🗑️ Eliminar libro
  delete: async (id: number): Promise<ApiResponse> => {
    return api.delete(`/books/${id}`);
  },

  // ⭐ Obtener libros favoritos
  getFavorites: async (params?: {
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());

    return api.get(`/books/favorites?${query.toString()}`);
  },

  // ⭐ Agregar a favoritos
  addToFavorites: async (id: number): Promise<ApiResponse> => {
    return api.post(`/books/${id}/favorite`);
  },

  // ⭐ Quitar de favoritos
  removeFromFavorites: async (id: number): Promise<ApiResponse> => {
    return api.delete(`/books/${id}/favorite`);
  },

  // ✅ Marcar como completado
  markAsCompleted: async (id: number): Promise<ApiResponse> => {
    return api.post(`/books/complete/${id}`);
  },
};
export interface BookProgress {
  currentPage: number;
  totalPages: number;
  progressPercentage: number;
  completed: boolean;
  currentCFI?: string;  // CFI para EPUBs
  lastReadAt?: string;
  completedAt?: string;
}

export const progressApi = {
  // Obtener progreso de lectura
  getProgress: async (bookId: number): Promise<BookProgress | null> => {
    try {
      return api.get(`/books/${bookId}/progress`);
    } catch (error) {
      // Si no hay progreso guardado, retornar null
      return null;
    }
  },

  // Actualizar progreso de lectura
  updateProgress: async (
    bookId: number,
    currentPage: number,
    totalPages: number,
    currentCFI?: string  // CFI para posición exacta en EPUBs
  ): Promise<ApiResponse> => {
    return api.patch(`/books/${bookId}/progress`, {
      currentPage,
      totalPages,
      currentCFI
    });
  },
};

// Funciones para colecciones
export const collectionsApi = {
  // 📚 Obtener todas las colecciones del usuario
  getAll: async (): Promise<Collection[]> => {
    return api.get("/books/collections");
  },

  // 📖 Obtener colección por ID con sus libros
  getById: async (id: number): Promise<Collection> => {
    return api.get(`/books/collections/${id}`);
  },

  // ➕ Crear nueva colección
  create: async (data: CreateCollectionData): Promise<Collection> => {
    return api.post("/books/create-collection", data);
  },

  // ✏️ Actualizar colección
  update: async (id: number, data: UpdateCollectionData): Promise<Collection> => {
    return api.patch(`/books/collections/${id}`, data);
  },

  // 🗑️ Eliminar colección
  delete: async (id: number): Promise<ApiResponse> => {
    return api.delete(`/books/collections/${id}`);
  },

  // 📘 Agregar libro a colección
  addBook: async (collectionId: number, bookId: number): Promise<ApiResponse> => {
    return api.post(`/books/collections/${collectionId}/books/${bookId}`);
  },

  // 📕 Quitar libro de colección
  removeBook: async (collectionId: number, bookId: number): Promise<ApiResponse> => {
    return api.delete(`/books/collections/${collectionId}/books/${bookId}`);
  },

  // 📚 Obtener libros de una colección
  getBooks: async (collectionId: number, params?: {
    page?: number;
    limit?: number;
  }): Promise<any> => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());

    return api.get(`/books/collections/${collectionId}/books?${query.toString()}`);
  },
};
