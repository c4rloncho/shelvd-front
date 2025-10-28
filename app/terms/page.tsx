"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Library } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <Library className="w-4 h-4" />
            ← Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold mb-2">Términos y Condiciones</h1>
          <p className="text-muted-foreground">Última actualización: Enero 2025</p>
        </div>

        {/* Content */}
        <Card className="bg-card/80 backdrop-blur-xl border border-border/50">
          <CardContent className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Aceptación de los Términos</h2>
              <p className="text-foreground/80 leading-relaxed">
                Al acceder y utilizar Shelvd ("el Servicio"), usted acepta estar legalmente vinculado por estos Términos y Condiciones.
                Si no está de acuerdo con alguna parte de estos términos, no debe utilizar el Servicio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Descripción del Servicio</h2>
              <p className="text-foreground/80 leading-relaxed mb-3">
                Shelvd es una plataforma de biblioteca digital personal que permite a los usuarios:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4">
                <li>Subir y almacenar libros digitales en formatos EPUB, PDF y MOBI</li>
                <li>Organizar su colección personal de libros</li>
                <li>Leer libros desde cualquier dispositivo con acceso a internet</li>
                <li>Crear colecciones y gestionar su biblioteca personal</li>
              </ul>
              <p className="text-foreground/80 leading-relaxed mt-3">
                <strong>Importante:</strong> Shelvd es un servicio de almacenamiento personal. Los libros subidos por un usuario
                NO se comparten con otros usuarios. Cada biblioteca es completamente privada y personal.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. Responsabilidad del Usuario sobre el Contenido</h2>
              <div className="space-y-3 text-foreground/80">
                <p className="leading-relaxed">
                  <strong>3.1 Propiedad y Derechos:</strong> Usted es el único responsable de todo el contenido que sube al Servicio.
                  Al subir contenido, usted declara y garantiza que:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Es el propietario legítimo del contenido, O</li>
                  <li>Ha adquirido legalmente el derecho a usar y almacenar dicho contenido, O</li>
                  <li>El contenido está en el dominio público, O</li>
                  <li>Tiene los permisos necesarios para usar el contenido de esta manera</li>
                </ul>
                <p className="leading-relaxed mt-3">
                  <strong>3.2 Uso Personal:</strong> El Servicio está diseñado exclusivamente para uso personal y privado.
                  Está prohibido:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Compartir credenciales de acceso a su cuenta</li>
                  <li>Usar el Servicio para distribución comercial de contenido</li>
                  <li>Subir contenido con el fin de compartirlo públicamente</li>
                  <li>Violar derechos de autor o propiedad intelectual de terceros</li>
                </ul>
                <p className="leading-relaxed mt-3">
                  <strong>3.3 Exención de Responsabilidad:</strong> Shelvd NO verifica ni valida que los usuarios tengan
                  derechos sobre el contenido que suben. La responsabilidad de cumplir con las leyes de derechos de autor
                  recae completamente en el usuario.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Privacidad del Contenido</h2>
              <p className="text-foreground/80 leading-relaxed">
                Todo el contenido subido a Shelvd es privado y solo accesible por el usuario que lo subió.
                Shelvd no comparte, vende, distribuye ni hace público el contenido de los usuarios.
                No hay funcionalidad de compartir libros entre usuarios.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Cuenta de Usuario</h2>
              <div className="space-y-3 text-foreground/80">
                <p className="leading-relaxed">
                  <strong>5.1 Registro:</strong> Para usar el Servicio, debe crear una cuenta proporcionando información precisa y completa.
                </p>
                <p className="leading-relaxed">
                  <strong>5.2 Seguridad:</strong> Usted es responsable de mantener la confidencialidad de sus credenciales de acceso
                  y de todas las actividades que ocurran bajo su cuenta.
                </p>
                <p className="leading-relaxed">
                  <strong>5.3 Suspensión:</strong> Nos reservamos el derecho de suspender o cancelar cuentas que violen estos términos.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Limitación de Responsabilidad</h2>
              <p className="text-foreground/80 leading-relaxed">
                Shelvd se proporciona "tal cual" sin garantías de ningún tipo. No somos responsables de:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80 ml-4 mt-2">
                <li>Pérdida de datos o contenido</li>
                <li>Violaciones de derechos de autor por parte de los usuarios</li>
                <li>Daños directos, indirectos, incidentales o consecuentes derivados del uso del Servicio</li>
                <li>Interrupciones del servicio o errores técnicos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Notificación de Infracción de Derechos de Autor</h2>
              <p className="text-foreground/80 leading-relaxed">
                Si cree que su obra protegida por derechos de autor ha sido almacenada por un usuario sin autorización,
                aunque el contenido es privado y no compartido, puede notificarnos. Sin embargo, tenga en cuenta que
                Shelvd es un servicio de almacenamiento personal y no tenemos acceso al contenido de las bibliotecas privadas.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Modificaciones del Servicio</h2>
              <p className="text-foreground/80 leading-relaxed">
                Nos reservamos el derecho de modificar, suspender o discontinuar el Servicio en cualquier momento,
                con o sin previo aviso.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Modificaciones de los Términos</h2>
              <p className="text-foreground/80 leading-relaxed">
                Podemos actualizar estos Términos y Condiciones periódicamente. Le notificaremos sobre cambios significativos
                publicando los nuevos términos en el Servicio. Su uso continuado del Servicio después de dichos cambios
                constituye su aceptación de los nuevos términos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Ley Aplicable</h2>
              <p className="text-foreground/80 leading-relaxed">
                Estos términos se regirán e interpretarán de acuerdo con las leyes aplicables, sin tener en cuenta
                sus disposiciones sobre conflictos de leyes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">11. Contacto</h2>
              <p className="text-foreground/80 leading-relaxed">
                Si tiene preguntas sobre estos Términos y Condiciones, puede contactarnos a través del Servicio.
              </p>
            </section>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link href="/privacy">Ver Política de Privacidad</Link>
          </Button>
          <Button asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
