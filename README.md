# Shelvd Frontend

Este es el frontend de Shelvd, una aplicación de gestión de libros construida con [Next.js](https://nextjs.org) y TypeScript.

## Características

- Sistema de autenticación completo (Login/Register/Logout)
- Gestión de estado de usuario con React Context
- Integración con backend NestJS
- Autenticación basada en cookies HttpOnly
- UI moderna con Tailwind CSS
- Soporte para tema claro/oscuro

## Requisitos previos

- Node.js 18+ instalado
- Backend NestJS corriendo en el puerto 4000

## Configuración

1. Instalar dependencias:

```bash
npm install
```

2. Configurar variables de entorno:

Copia el archivo `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

El archivo `.env.local` debe contener:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Ejecutar en desarrollo

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## Estructura del proyecto

```
app/
├── login/          # Página de inicio de sesión
├── register/       # Página de registro
├── layout.tsx      # Layout principal con AuthProvider
└── page.tsx        # Página de inicio

context/
└── AuthContext.tsx # Contexto de autenticación

lib/
└── api.ts          # Cliente de API y funciones de autenticación

components/
└── ProtectedRoute.tsx # Componente para proteger rutas
```

## Autenticación

### Endpoints utilizados

- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Inicio de sesión
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/me` - Obtener usuario actual
- `PATCH /auth/profile` - Actualizar perfil

### Uso del contexto de autenticación

```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, loading, login, register, logout } = useAuth();

  // user contiene la información del usuario autenticado
  // loading indica si está cargando
  // login, register, logout son funciones para gestionar la autenticación
}
```

### Proteger rutas

Para proteger una página, envuélvela con el componente `ProtectedRoute`:

```typescript
import ProtectedRoute from '@/components/ProtectedRoute';

export default function MyProtectedPage() {
  return (
    <ProtectedRoute>
      {/* Tu contenido protegido aquí */}
    </ProtectedRoute>
  );
}
```

## Páginas disponibles

- `/` - Página de inicio (pública)
- `/login` - Página de inicio de sesión
- `/register` - Página de registro

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
