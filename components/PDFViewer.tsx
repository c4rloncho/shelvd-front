"use client";
import { useState, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCw } from "lucide-react";

interface PDFViewerProps {
  file: string | ArrayBuffer;
  onPageChange?: (page: number, totalPages: number) => void;
  initialPage?: number;
}

export default function PDFViewer({
  file,
  onPageChange,
  initialPage = 1,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(initialPage);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Configurar el worker de PDF.js en el cliente
  useEffect(() => {
    // Intentar usar el worker local primero
    const workerUrl = `${window.location.origin}/pdf-worker/pdf.worker.min.mjs`;
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  }, []);

  useEffect(() => {
    if (onPageChange && numPages > 0) {
      onPageChange(pageNumber, numPages);
    }
  }, [pageNumber, numPages, onPageChange]);

  // Resetear scroll al cambiar de página
  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [pageNumber]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(numPages, prev + 1));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(3.0, prev + 0.2));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(0.5, prev - 0.2));
  };

  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Manejar scroll para navegación de páginas
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout | null = null;
    let isScrolling = false;

    const handleWheel = (event: WheelEvent) => {
      // Solo procesar scroll si no estamos ya en medio de un cambio de página
      if (isScrolling) return;

      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      const atTop = scrollTop === 0;
      const atBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 1;

      // Si estamos con zoom y hay contenido que scrollear
      if (scale !== 1.0 && scrollHeight > clientHeight) {
        // Si scrolleamos hacia abajo y NO estamos al final, permitir scroll normal
        if (event.deltaY > 0 && !atBottom) {
          return; // Permitir scroll normal
        }
        // Si scrolleamos hacia arriba y NO estamos al inicio, permitir scroll normal
        if (event.deltaY < 0 && !atTop) {
          return; // Permitir scroll normal
        }
      }

      // Si llegamos aquí, cambiar de página
      event.preventDefault();

      if (event.deltaY > 0 && pageNumber < numPages) {
        // Scroll hacia abajo = página siguiente
        goToNextPage();
      } else if (event.deltaY < 0 && pageNumber > 1) {
        // Scroll hacia arriba = página anterior
        goToPrevPage();
      }

      isScrolling = true;
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 300);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [pageNumber, numPages, scale]);

  // Manejar teclas de flechas
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        goToNextPage();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        goToPrevPage();
      } else if (e.key === "+" || e.key === "=") {
        zoomIn();
      } else if (e.key === "-") {
        zoomOut();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [numPages, pageNumber]);

  return (
    <div className="flex flex-col h-full">
      {/* Controles de zoom y rotación */}
      <div className="flex items-center justify-center gap-2 p-2 bg-card border-b border-border">
        <Button variant="outline" size="sm" onClick={zoomOut} title="Alejar (-)">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground min-w-[60px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <Button variant="outline" size="sm" onClick={zoomIn} title="Acercar (+)">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-2" />
        <Button variant="outline" size="sm" onClick={rotate} title="Rotar">
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Visor del PDF */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-secondary/20 flex items-start justify-center p-4"
      >
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          }
          error={
            <div className="flex items-center justify-center p-8">
              <p className="text-destructive">Error al cargar el PDF</p>
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            rotate={rotation}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="shadow-lg"
          />
        </Document>
      </div>

      {/* Navegación de páginas */}
      <div className="flex items-center justify-between gap-4 p-3 bg-card border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevPage}
          disabled={pageNumber <= 1}
        >
          ← Anterior
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Página{" "}
            <input
              type="number"
              min={1}
              max={numPages}
              value={pageNumber}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= numPages) {
                  setPageNumber(page);
                }
              }}
              className="w-16 px-2 py-1 text-center bg-background border border-border rounded"
            />{" "}
            de {numPages}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={goToNextPage}
          disabled={pageNumber >= numPages}
        >
          Siguiente →
        </Button>
      </div>
    </div>
  );
}
