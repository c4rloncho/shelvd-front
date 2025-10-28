"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Library } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <Library className="w-4 h-4" />
            ← Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold mb-2">Política de Privacidad</h1>
          <p className="text-muted-foreground">Última actualización: Enero 2025</p>
        </div>

        {/* Content */}
        <Card className="bg-card/80 backdrop-blur-xl border border-border/50">
          <CardContent className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Introducción</h2>
              <p className="text-foreground/80 leading-relaxed">
                En Shelvd, nos tomamos muy en serio la privacidad de nuestros usuarios. Esta Política de Privacidad
                explica qué información recopilamos, cómo la usamos, y cómo la protegemos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Información que Recopilamos</h2>
              <div className="space-y-3 text-foreground/80">
                <p className="leading-relaxed">
                  <strong>2.1 Información de la Cuenta:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Nombre de usuario</li>
                  <li>Dirección de correo electrónico</li>
                  <li>Contraseña (almacenada de forma encriptada)</li>
                </ul>
                <p className="leading-relaxed mt-3">
                  <strong>2.2 Contenido del Usuario:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Libros digitales que sube al Servicio</li>
                  <li>Metadatos de los libros (título, autor, portada, etc.)</li>
                  <li>Colecciones y organización de su biblioteca</li>
                  <li>Progreso de lectura y preferencias de lectura</li>
                </ul>
                <p className="leading-relaxed mt-3">
                  <strong>2.3 Información de Uso:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Fecha y hora de acceso</li>
                  <li>Dispositivo y navegador utilizado</li>
                  <li>Dirección IP</li>
                  <li>Actividad dentro del Servicio</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. Cómo Usamos su Información</h2>
              <p className="text-foreground/80 leading-relaxed mb-3">
                Utilizamos la información recopilada para:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                <li>Proporcionar y mantener el Servicio</li>
                <li>Autenticar su identidad y gestionar su cuenta</li>
                <li>Almacenar y organizar su biblioteca personal de libros</li>
                <li>Sincronizar su progreso de lectura entre dispositivos</li>
                <li>Mejorar y personalizar su experiencia de usuario</li>
                <li>Comunicarnos con usted sobre el Servicio</li>
                <li>Detectar y prevenir fraudes o abusos</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Privacidad de su Contenido</h2>
              <div className="space-y-3 text-foreground/80">
                <p className="leading-relaxed font-semibold">
                  Su biblioteca es completamente privada.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Los libros que sube son visibles SOLO para usted</li>
                  <li>NO compartimos su contenido con otros usuarios</li>
                  <li>NO vendemos ni distribuimos su contenido a terceros</li>
                  <li>NO tenemos funcionalidad de compartir libros entre usuarios</li>
                  <li>El personal de Shelvd NO accede a su contenido excepto cuando sea necesario para soporte técnico y con su consentimiento</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Compartir Información con Terceros</h2>
              <div className="space-y-3 text-foreground/80">
                <p className="leading-relaxed">
                  <strong>NO vendemos ni alquilamos su información personal.</strong> Solo compartimos información en las siguientes circunstancias:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Proveedores de Servicios:</strong> Podemos compartir información con proveedores de confianza que nos ayudan a operar el Servicio (hosting, almacenamiento en la nube, análisis). Estos proveedores están obligados a proteger su información.</li>
                  <li><strong>Requerimientos Legales:</strong> Podemos divulgar información si es requerido por ley o en respuesta a procesos legales válidos.</li>
                  <li><strong>Protección de Derechos:</strong> Podemos divulgar información para proteger nuestros derechos, propiedad o seguridad, y la de nuestros usuarios.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Seguridad de los Datos</h2>
              <p className="text-foreground/80 leading-relaxed">
                Implementamos medidas de seguridad técnicas y organizativas para proteger su información:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4 mt-2">
                <li>Encriptación de contraseñas</li>
                <li>Conexiones HTTPS seguras</li>
                <li>Acceso restringido a datos personales</li>
                <li>Monitoreo regular de seguridad</li>
              </ul>
              <p className="text-foreground/80 leading-relaxed mt-3">
                Sin embargo, ningún método de transmisión por Internet o almacenamiento electrónico es 100% seguro.
                No podemos garantizar la seguridad absoluta de su información.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Retención de Datos</h2>
              <p className="text-foreground/80 leading-relaxed">
                Retenemos su información mientras su cuenta esté activa o según sea necesario para proporcionar el Servicio.
                Si elimina su cuenta, eliminaremos su información personal y contenido, excepto cuando sea necesario retenerla
                por obligaciones legales.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Sus Derechos</h2>
              <p className="text-foreground/80 leading-relaxed mb-3">
                Usted tiene derecho a:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                <li><strong>Acceder</strong> a su información personal</li>
                <li><strong>Corregir</strong> información inexacta o incompleta</li>
                <li><strong>Eliminar</strong> su cuenta y contenido</li>
                <li><strong>Exportar</strong> sus datos en un formato portable</li>
                <li><strong>Objetar</strong> el procesamiento de su información en ciertas circunstancias</li>
              </ul>
              <p className="text-foreground/80 leading-relaxed mt-3">
                Para ejercer estos derechos, puede gestionar su cuenta desde la configuración del Servicio o contactarnos directamente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Cookies y Tecnologías Similares</h2>
              <p className="text-foreground/80 leading-relaxed">
                Utilizamos cookies y tecnologías similares para:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4 mt-2">
                <li>Mantener su sesión iniciada</li>
                <li>Recordar sus preferencias</li>
                <li>Analizar el uso del Servicio</li>
                <li>Mejorar la funcionalidad y rendimiento</li>
              </ul>
              <p className="text-foreground/80 leading-relaxed mt-3">
                Puede controlar las cookies a través de la configuración de su navegador.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Privacidad de Menores</h2>
              <p className="text-foreground/80 leading-relaxed">
                El Servicio no está dirigido a menores de 13 años. No recopilamos intencionalmente información personal
                de menores de 13 años. Si descubrimos que hemos recopilado información de un menor, eliminaremos
                esa información inmediatamente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">11. Transferencias Internacionales</h2>
              <p className="text-foreground/80 leading-relaxed">
                Su información puede ser transferida y almacenada en servidores ubicados fuera de su país de residencia.
                Tomamos medidas para asegurar que su información reciba un nivel adecuado de protección.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">12. Cambios a esta Política</h2>
              <p className="text-foreground/80 leading-relaxed">
                Podemos actualizar esta Política de Privacidad periódicamente. Le notificaremos sobre cambios significativos
                publicando la nueva política en el Servicio y actualizando la fecha de "Última actualización".
                Le recomendamos revisar esta política regularmente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">13. Contacto</h2>
              <p className="text-foreground/80 leading-relaxed">
                Si tiene preguntas o inquietudes sobre esta Política de Privacidad o sobre cómo manejamos su información,
                puede contactarnos a través del Servicio.
              </p>
            </section>

            <section className="border-t border-border pt-6 mt-8">
              <h2 className="text-xl font-semibold mb-3">Resumen de Privacidad</h2>
              <div className="bg-accent/30 rounded-lg p-4">
                <p className="text-foreground/90 leading-relaxed font-medium">
                  <strong>En resumen:</strong> Su biblioteca es 100% privada. Los libros que sube solo son visibles para usted.
                  No compartimos, vendemos ni distribuimos su contenido. Shelvd es su espacio personal y privado para organizar
                  y leer sus libros digitales.
                </p>
              </div>
            </section>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link href="/terms">Ver Términos y Condiciones</Link>
          </Button>
          <Button asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
