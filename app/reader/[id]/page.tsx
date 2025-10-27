"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Book, BookProgress, booksApi, progressApi } from "@/lib/api";
import { cacheBook, getCachedBook } from "@/lib/bookCache";
import ePub, { Book as EpubBook, Rendition } from "epubjs";
import { debounce } from "lodash";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  BookCopy,
  BookOpen,
  List,
  Settings,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface TocItem {
  label: string;
  href: string;
  subitems?: TocItem[];
}

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = Number(params.id);

  const viewerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const epubBookRef = useRef<EpubBook | null>(null);

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isViewerReady, setIsViewerReady] = useState(false);
  const [lastSavedPage, setLastSavedPage] = useState<number>(0);
  const [tableOfContents, setTableOfContents] = useState<TocItem[]>([]);
  const [isTocOpen, setIsTocOpen] = useState(false);

  // Configuración de lectura
  const [fontSize, setFontSize] = useState(100);
  const [fontFamily, setFontFamily] = useState("serif");
  const [pageMode, setPageMode] = useState<"single" | "double">("single");
  const [lineHeight, setLineHeight] = useState(1.6);
  const [colorTheme, setColorTheme] = useState<
    "dark" | "light" | "sepia" | "high-contrast"
  >("dark");
  const [textAlign, setTextAlign] = useState<"justify" | "left" | "center">(
    "justify"
  );
  const saveProgress = useRef(
    debounce(
      async (bookId: number, page: number, total: number, cfi?: string) => {
        try {
          await progressApi.updateProgress(bookId, page, total, cfi);
        } catch (error) {
          console.error("Error al guardar progreso:", error);
        }
      },
      2000
    ) // Espera 2 segundos después del último cambio
  ).current;

  // Cargar preferencias de lectura desde localStorage
  useEffect(() => {
    const savedFontSize = localStorage.getItem("reader-fontSize");
    const savedFontFamily = localStorage.getItem("reader-fontFamily");
    const savedPageMode = localStorage.getItem("reader-pageMode");
    const savedLineHeight = localStorage.getItem("reader-lineHeight");
    const savedColorTheme = localStorage.getItem("reader-colorTheme");
    const savedTextAlign = localStorage.getItem("reader-textAlign");

    if (savedFontSize) setFontSize(Number(savedFontSize));
    if (savedFontFamily) setFontFamily(savedFontFamily);
    if (savedPageMode) setPageMode(savedPageMode as "single" | "double");
    if (savedLineHeight) setLineHeight(Number(savedLineHeight));
    if (savedColorTheme)
      setColorTheme(
        savedColorTheme as "dark" | "light" | "sepia" | "high-contrast"
      );
    if (savedTextAlign)
      setTextAlign(savedTextAlign as "justify" | "left" | "center");
  }, []);
  // Guardar progreso antes de salir
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentPage > 0) {
        saveProgress.flush(); // Ejecutar inmediatamente
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentPage]);

  // Marcar cuando el viewer está listo
  useEffect(() => {
    if (viewerRef.current) {
      setIsViewerReady(true);
    }
  }, []);

  // Aplicar estilos cuando cambien
  useEffect(() => {
    if (renditionRef.current) {
      applyReaderStyles();
      // Guardar preferencias
      localStorage.setItem("reader-fontSize", fontSize.toString());
      localStorage.setItem("reader-fontFamily", fontFamily);
      localStorage.setItem("reader-pageMode", pageMode);
      localStorage.setItem("reader-lineHeight", lineHeight.toString());
      localStorage.setItem("reader-colorTheme", colorTheme);
      localStorage.setItem("reader-textAlign", textAlign);
    }
  }, [fontSize, fontFamily, pageMode, lineHeight, colorTheme, textAlign]);

  // Función para obtener colores según el tema
  const getThemeColors = () => {
    switch (colorTheme) {
      case "light":
        return {
          background: "#ffffff",
          text: "#1a1a1a",
          heading: "#000000",
          link: "#2563eb",
        };
      case "sepia":
        return {
          background: "#f4ecd8",
          text: "#5c4a3a",
          heading: "#3d2f23",
          link: "#8b6914",
        };
      case "high-contrast":
        return {
          background: "#000000",
          text: "#ffffff",
          heading: "#ffffff",
          link: "#00ffff",
        };
      case "dark":
      default:
        return {
          background: "oklch(0.23 0.025 250)",
          text: "oklch(0.88 0.01 250)",
          heading: "oklch(0.98 0.005 250)",
          link: "oklch(0.72 0.12 240)",
        };
    }
  };

  // Función para aplicar estilos del tema
  const applyReaderStyles = () => {
    if (!renditionRef.current) return;

    const colors = getThemeColors();

    renditionRef.current.themes.fontSize(`${fontSize}%`);

    // Configurar vista simple o doble
    renditionRef.current.spread(pageMode === "double" ? "auto" : "none");

    renditionRef.current.themes.default({
      body: {
        color: `${colors.text} !important`,
        background: `${colors.background} !important`,
        "line-height": `${lineHeight} !important`,
        "font-family": `${fontFamily} !important`,
        "text-align": `${textAlign} !important`,
      },
      p: {
        color: `${colors.text} !important`,
        "font-family": `${fontFamily} !important`,
        "text-align": `${textAlign} !important`,
      },
      "h1, h2, h3, h4, h5, h6": {
        color: `${colors.heading} !important`,
        "font-family": `${fontFamily} !important`,
      },
      a: {
        color: `${colors.link} !important`,
      },
      "div, section, article": {
        "text-align": `${textAlign} !important`,
      },
    });
  };

  useEffect(() => {
    const loadAndRenderBook = async () => {
      if (!viewerRef.current) {
        return;
      }

      try {
        setLoading(true);
        const bookData = await booksApi.getById(bookId);
        setBook(bookData);

        if (!bookData.bookUrl) {
          throw new Error("URL del libro no disponible");
        }

        // Intentar obtener el libro del caché primero
        let arrayBuffer = await getCachedBook(bookId, bookData.bookUrl);

        if (arrayBuffer) {
        } else {
          // Si no está en caché, descargarlo
          const response = await fetch(bookData.bookUrl);

          if (!response.ok) {
            throw new Error(`Error al descargar el libro: ${response.status}`);
          }

          arrayBuffer = await response.arrayBuffer();

          // Guardar en caché para futuras cargas
          try {
            await cacheBook(bookId, arrayBuffer, bookData.bookUrl);
          } catch (cacheError) {
            console.error("Error al guardar en caché:", cacheError);
            // No lanzar error, continuar sin caché
          }
        }

        // Crear el libro EPUB desde el arrayBuffer
        const epubBook = ePub(arrayBuffer);
        epubBookRef.current = epubBook;

        // Limpiar el contenedor antes de renderizar
        if (viewerRef.current) {
          viewerRef.current.innerHTML = "";
        }

        // Renderizar en el contenedor con tamaño explícito
        const rendition = epubBook.renderTo(viewerRef.current, {
          width: viewerRef.current?.offsetWidth || window.innerWidth,
          height: viewerRef.current?.offsetHeight || window.innerHeight - 61,
          flow: "paginated",
          manager: "default",
        });

        renditionRef.current = rendition;

        // Cargar progreso desde la base de datos
        let savedProgress: BookProgress | null = null;
        try {
          savedProgress = await progressApi.getProgress(bookId);
          if (savedProgress) {
          }
        } catch (error) {}

        // Cargar la ubicación guardada (priorizar CFI de DB sobre localStorage)
        const savedLocationLS = localStorage.getItem(`book-${bookId}-location`);
        const savedCFI = savedProgress?.currentCFI || savedLocationLS;

        // Asegurar que el libro esté completamente listo
        await epubBook.ready;

        try {
          if (savedProgress && savedProgress.currentPage > 0 && savedCFI) {
            // Actualizar el estado de la página actual
            setCurrentPage(savedProgress.currentPage);
            setLastSavedPage(savedProgress.currentPage);

            // Intentar restaurar la ubicación exacta con CFI
            try {
              await rendition.display(savedCFI);
            } catch (cfiError) {
              // Si el CFI falla (por ejemplo, si el libro cambió), mostrar desde el inicio
              await rendition.display();
            }
          } else if (savedCFI) {
            try {
              await rendition.display(savedCFI);
            } catch {
              await rendition.display();
            }
          } else {
            // Libro nuevo: mostrar desde el inicio
            await rendition.display();
          }
        } catch (displayError) {
          console.warn(
            "Error al renderizar, intentando alternativa:",
            displayError
          );
          // Último intento: mostrar sin argumentos
          try {
            await rendition.display();
          } catch (finalError) {
            console.error("No se pudo renderizar el libro:", finalError);
            throw finalError;
          }
        }

        // Manejar clicks para navegación
        rendition.on("click", (event: MouseEvent) => {
          // Obtener el ancho del contenedor
          const rect = viewerRef.current?.getBoundingClientRect();
          if (!rect) return;

          const clickX = event.clientX;
          const containerCenter = rect.left + rect.width / 2;

          // Si el click es en la mitad izquierda, ir a página anterior
          // Si es en la mitad derecha, ir a página siguiente
          if (clickX < containerCenter) {
            rendition.prev();
          } else {
            rendition.next();
          }
        });

        // Manejar scroll del ratón dentro del libro
        let scrollTimeout: NodeJS.Timeout | null = null;
        let isScrolling = false;

        const handleBookWheel = (event: WheelEvent) => {
          if (isScrolling) return;

          if (event.deltaY > 0) {
            rendition.next();
          } else if (event.deltaY < 0) {
            rendition.prev();
          }

          isScrolling = true;
          if (scrollTimeout) clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            isScrolling = false;
          }, 300);
        };

        // Agregar listener al iframe del libro cuando esté listo
        rendition.on("rendered", () => {
          const iframe = viewerRef.current?.querySelector("iframe");
          if (iframe) {
            // Actualizar el atributo sandbox para permitir scripts
            // Esto es necesario para libros con contenido interactivo
            const currentSandbox = iframe.getAttribute("sandbox");
            if (currentSandbox !== null) {
              iframe.setAttribute(
                "sandbox",
                "allow-same-origin allow-scripts allow-popups allow-forms"
              );
            }

            if (iframe.contentWindow) {
              iframe.contentWindow.addEventListener("wheel", handleBookWheel);
            }
          }
        });

        rendition.on("relocated", (location: any) => {
          const { start } = location;
          const currentCFI = start.cfi; // ✅ Capturar el CFI

          // Guardar ubicación en localStorage
          localStorage.setItem(`book-${bookId}-location`, currentCFI);

          // Calcular el progreso del libro completo usando locations
          const locations = epubBookRef.current?.locations;
          const totalLocations = locations ? (locations as any).length() : 0;

          if (totalLocations > 0 && start.location !== undefined) {
            // start.location es el índice de la location actual
            const currentLocationIndex = start.location;
            // Calcular porcentaje basado en la location actual
            const progressFraction = currentLocationIndex / totalLocations;
            const currentPageNum = currentLocationIndex + 1; // +1 porque empieza en 0

            setCurrentPage(currentPageNum);
            setTotalPages(totalLocations);

            // Guardar progreso en el backend solo si cambió
            if (currentPageNum !== lastSavedPage) {
              saveProgress(bookId, currentPageNum, totalLocations, currentCFI); // ✅ Enviar CFI
              setLastSavedPage(currentPageNum);
            }
          } else {
            // Fallback: usar displayed pages (por capítulo) si locations no está disponible
            if (start.displayed?.page && start.displayed?.total) {
              setCurrentPage(start.displayed.page);
              setTotalPages(start.displayed.total);

              // Guardar progreso también en modo fallback
              if (start.displayed.page !== lastSavedPage) {
                saveProgress(
                  bookId,
                  start.displayed.page,
                  start.displayed.total,
                  currentCFI
                ); // ✅ Enviar CFI
                setLastSavedPage(start.displayed.page);
              }
            }
          }
        });

        // Aplicar estilos del tema
        applyReaderStyles();

        // Cargar tabla de contenidos
        await epubBook.ready;
        const navigation = epubBook.navigation;
        if (navigation && navigation.toc) {
          setTableOfContents(navigation.toc as TocItem[]);
        }

        // Generar locations para calcular el progreso del libro completo

        try {
          await epubBook.locations.generate(1024); // Genera locations cada 1024 caracteres
          const totalLocs = (epubBook.locations as any).length();
        } catch (locError) {
          console.warn("No se pudieron generar locations:", locError);
        }

        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Error al cargar el libro");
        setLoading(false);
      }
    };

    if (bookId && isViewerReady) {
      loadAndRenderBook();
    }

    // Cleanup
    return () => {
      if (renditionRef.current) {
        renditionRef.current.destroy();
      }
    };
  }, [bookId, isViewerReady]);

  const nextPage = () => {
    renditionRef.current?.next();
  };

  const prevPage = () => {
    renditionRef.current?.prev();
  };

  const goToChapter = async (href: string) => {
    if (!renditionRef.current || !epubBookRef.current) return;

    try {
      // Resolver el path completo del capítulo
      const resolvedPath = await epubBookRef.current.resolve(href);

      if (!resolvedPath) {
        return;
      }

      // Buscar el índice en el spine que coincida con el path resuelto
      const spine = epubBookRef.current.spine;
      let foundIndex = -1;
      let i = 0;

      while (true) {
        const item = spine.get(i);
        if (!item) break;

        if (
          item.href === resolvedPath ||
          item.href.includes(href) ||
          resolvedPath.includes(item.href)
        ) {
          foundIndex = i;
          break;
        }

        i++;
        if (i > 1000) break; // Límite de seguridad
      }

      if (foundIndex >= 0) {
        await renditionRef.current.display(foundIndex);
        setIsTocOpen(false);
      } else {
        alert("No se pudo navegar a este capítulo.");
      }
    } catch (error: any) {
      alert("Error al navegar al capítulo.");
    }
  };

  // Manejar teclas de flechas
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        nextPage();
      } else if (e.key === "ArrowLeft") {
        prevPage();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Componente para renderizar items de la tabla de contenidos
  const renderTocItem = (item: TocItem, level = 0) => (
    <div key={item.href} style={{ marginLeft: `${level * 12}px` }}>
      <button
        onClick={() => goToChapter(item.href)}
        className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
      >
        {item.label}
      </button>
      {item.subitems &&
        item.subitems.map((subitem) => renderTocItem(subitem, level + 1))}
    </div>
  );

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold text-destructive">Error</h2>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={() => router.push("/")}>Volver al inicio</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
      {/* Overlay de carga */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background">
          <Card className="w-64">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-sm text-muted-foreground">
                Cargando libro...
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-border bg-card flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="flex-shrink-0"
            >
              ← Volver
            </Button>
            {book && (
              <div className="min-w-0 flex-1">
                <h1 className="font-semibold text-sm truncate">{book.title}</h1>
                {book.author && (
                  <p className="text-xs text-muted-foreground truncate">
                    {book.author}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Controles de navegación */}
          {!loading && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Botón de capítulos */}
              <Popover open={isTocOpen} onOpenChange={setIsTocOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <List className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-80 max-h-[500px] overflow-y-auto"
                  align="end"
                >
                  <div className="space-y-2">
                    <div className="sticky top-0 bg-popover pb-2 border-b border-border">
                      <h4 className="font-semibold text-sm">Capítulos</h4>
                    </div>
                    {tableOfContents.length > 0 ? (
                      <div className="space-y-1">
                        {tableOfContents.map((item) => renderTocItem(item))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        No hay capítulos disponibles
                      </p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Botón de configuración */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-96 max-h-[600px] overflow-y-auto"
                  align="end"
                >
                  <div className="space-y-4 pb-2">
                    <div className="space-y-2 sticky top-0 bg-popover pb-2 border-b border-border">
                      <h4 className="font-semibold text-sm">
                        Configuración de lectura
                      </h4>
                    </div>

                    {/* Control de tamaño de fuente */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="fontSize" className="text-sm">
                          Tamaño de fuente
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          {fontSize}%
                        </span>
                      </div>
                      <Slider
                        id="fontSize"
                        min={75}
                        max={200}
                        step={5}
                        value={[fontSize]}
                        onValueChange={(value) => setFontSize(value[0])}
                        className="w-full"
                      />
                    </div>

                    {/* Selector de tipo de fuente */}
                    <div className="space-y-2">
                      <Label htmlFor="fontFamily" className="text-sm">
                        Tipo de fuente
                      </Label>
                      <Select value={fontFamily} onValueChange={setFontFamily}>
                        <SelectTrigger id="fontFamily">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="serif">Serif</SelectItem>
                          <SelectItem value="sans-serif">Sans Serif</SelectItem>
                          <SelectItem value="monospace">Monospace</SelectItem>
                          <SelectItem value="Georgia, serif">
                            Georgia
                          </SelectItem>
                          <SelectItem value="'Times New Roman', serif">
                            Times New Roman
                          </SelectItem>
                          <SelectItem value="Arial, sans-serif">
                            Arial
                          </SelectItem>
                          <SelectItem value="'Courier New', monospace">
                            Courier New
                          </SelectItem>
                          <SelectItem value="Verdana, sans-serif">
                            Verdana
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Selector de vista de página */}
                    <div className="space-y-2">
                      <Label className="text-sm">Vista de página</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={
                            pageMode === "single" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setPageMode("single")}
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          <BookOpen className="h-4 w-4" />
                          <span>Simple</span>
                        </Button>
                        <Button
                          variant={
                            pageMode === "double" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setPageMode("double")}
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          <BookCopy className="h-4 w-4" />
                          <span>Doble</span>
                        </Button>
                      </div>
                    </div>

                    {/* Control de espaciado de líneas */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="lineHeight" className="text-sm">
                          Espaciado de líneas
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          {lineHeight.toFixed(1)}
                        </span>
                      </div>
                      <Slider
                        id="lineHeight"
                        min={1.0}
                        max={2.5}
                        step={0.1}
                        value={[lineHeight]}
                        onValueChange={(value) => setLineHeight(value[0])}
                        className="w-full"
                      />
                    </div>

                    {/* Selector de tema de color */}
                    <div className="space-y-2">
                      <Label className="text-sm">Tema de color</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={
                            colorTheme === "dark" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setColorTheme("dark")}
                          className="flex items-center justify-center gap-2"
                        >
                          <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-600"></div>
                          <span>Oscuro</span>
                        </Button>
                        <Button
                          variant={
                            colorTheme === "light" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setColorTheme("light")}
                          className="flex items-center justify-center gap-2"
                        >
                          <div className="w-3 h-3 rounded-full bg-white border border-slate-300"></div>
                          <span>Claro</span>
                        </Button>
                        <Button
                          variant={
                            colorTheme === "sepia" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setColorTheme("sepia")}
                          className="flex items-center justify-center gap-2"
                        >
                          <div className="w-3 h-3 rounded-full bg-amber-100 border border-amber-400"></div>
                          <span>Sepia</span>
                        </Button>
                        <Button
                          variant={
                            colorTheme === "high-contrast"
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => setColorTheme("high-contrast")}
                          className="flex items-center justify-center gap-2"
                        >
                          <div className="w-3 h-3 rounded-full bg-black border border-white"></div>
                          <span>Alto contraste</span>
                        </Button>
                      </div>
                    </div>

                    {/* Selector de alineación */}
                    <div className="space-y-2">
                      <Label className="text-sm">Alineación</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={textAlign === "left" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTextAlign("left")}
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          <AlignLeft className="h-4 w-4" />
                          <span>Izquierda</span>
                        </Button>
                        <Button
                          variant={
                            textAlign === "center" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setTextAlign("center")}
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          <AlignCenter className="h-4 w-4" />
                          <span>Centro</span>
                        </Button>
                        <Button
                          variant={
                            textAlign === "justify" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setTextAlign("justify")}
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          <AlignJustify className="h-4 w-4" />
                          <span>Justificado</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {totalPages > 0 && (
                <div className="flex flex-col items-end">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {currentPage} / {totalPages}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {Math.round((currentPage / totalPages) * 100)}%
                  </span>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={prevPage}>
                ← Anterior
              </Button>
              <Button variant="outline" size="sm" onClick={nextPage}>
                Siguiente →
              </Button>
            </div>
          )}
        </div>

        {/* 🎯 AQUÍ VA LA BARRA DE PROGRESO - DESPUÉS DEL DIV ANTERIOR */}
        {!loading && totalPages > 0 && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{
                    width: `${Math.round((currentPage / totalPages) * 100)}%`,
                  }}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground min-w-[45px] text-right">
                {Math.round((currentPage / totalPages) * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Contenedor del lector */}
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={viewerRef}
          className="absolute inset-0"
          style={{ height: "100%", width: "100%" }}
        />
      </div>
    </div>
  );
}
