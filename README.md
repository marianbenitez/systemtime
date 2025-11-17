# Sistema de Control de Asistencia

Sistema completo de gestión de asistencia con autenticación basada en roles, construido con Next.js 14, TypeScript, MySQL y shadcn/ui.

## Características

- ✅ Autenticación con NextAuth.js
- ✅ Sistema de roles (SUPERADMIN, ADMIN, USER)
- ✅ Gestión de usuarios
- ✅ Control de asistencia con estados (Presente, Ausente, Tarde, Justificado)
- ✅ Importación masiva desde archivos Excel/CSV
- ✅ Dashboard con diferentes vistas según rol
- ✅ Interfaz moderna con shadcn/ui y Tailwind CSS

## Requisitos Previos

- Node.js 18+
- MySQL 8.0+
- npm o yarn

## Configuración Inicial

1. **Clonar el repositorio e instalar dependencias**

```bash
npm install
```

2. **Configurar variables de entorno**

Copia el archivo `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de MySQL:

```env
DATABASE_URL="mysql://usuario:contraseña@localhost:3307/systemtime"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-secreto-aqui"
```

Para generar un NEXTAUTH_SECRET seguro:

```bash
openssl rand -base64 32
```

3. **Configurar la base de datos**

Crea la base de datos en MySQL:

```sql
CREATE DATABASE systemtime;
```

Ejecuta las migraciones de Prisma:

```bash
npx prisma generate
npx prisma migrate dev
```

4. **Iniciar el servidor de desarrollo**

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Uso

### Primer Uso

1. Accede a `/auth/register` para crear tu primera cuenta
2. El primer usuario creado debería tener rol SUPERADMIN (editar manualmente en la base de datos si es necesario)
3. Inicia sesión en `/auth/login`

### Roles y Permisos

- **SUPERADMIN**: Acceso completo, puede gestionar usuarios
- **ADMIN**: Puede gestionar todas las asistencias
- **USER**: Solo puede ver su propia asistencia

### Importar Asistencias desde Excel

1. Accede a `/dashboard/attendance` (requiere rol ADMIN o SUPERADMIN)
2. Haz clic en "Importar desde Excel"
3. Descarga la plantilla o sube tu archivo con el siguiente formato:

| email | fecha | estado | entrada | salida | notas |
|-------|-------|--------|---------|--------|-------|
| usuario@ejemplo.com | 2024-01-15 | PRESENT | 2024-01-15T09:00:00 | 2024-01-15T17:00:00 | |

**Estados válidos:** PRESENT, ABSENT, LATE, JUSTIFIED

## Estructura del Proyecto

```
├── prisma/
│   └── schema.prisma         # Schema de base de datos
├── src/
│   ├── app/
│   │   ├── api/              # API Routes
│   │   ├── auth/             # Páginas de autenticación
│   │   └── dashboard/        # Páginas del dashboard
│   ├── components/
│   │   ├── ui/               # Componentes de shadcn/ui
│   │   └── dashboard/        # Componentes del dashboard
│   └── lib/
│       ├── auth.ts           # Configuración de NextAuth
│       ├── prisma.ts         # Cliente de Prisma
│       └── role-helpers.ts   # Utilidades de roles
└── .env                      # Variables de entorno
```

## Scripts Disponibles

```bash
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Compilar para producción
npm start            # Iniciar servidor de producción
npm run lint         # Ejecutar ESLint
npx prisma studio    # Abrir Prisma Studio (GUI para la BD)
```

## Tecnologías Utilizadas

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Base de Datos**: MySQL con Prisma ORM
- **Autenticación**: NextAuth.js v5
- **UI**: shadcn/ui + Tailwind CSS
- **Procesamiento de Archivos**: xlsx

## Licencia

MIT
