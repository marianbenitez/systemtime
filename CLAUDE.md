# CLAUDE.md

Este archivo proporciona orientación a Claude Code (claude.ai/code) al trabajar con código en este repositorio.

## Descripción General del Proyecto

Sistema de Control de Asistencia - Un sistema integral de seguimiento de asistencia construido con Next.js, que incluye autenticación basada en roles y capacidades de importación de Excel.

## Stack Tecnológico

- **Framework**: Next.js 16.0.3 (App Router)
- **Runtime**: React 19.2.0
- **Lenguaje**: TypeScript
- **Base de Datos**: MySQL 8.0+ con Prisma ORM v6.19.0
- **Autenticación**: NextAuth.js v5.0.0-beta.30
- **Librería UI**: shadcn/ui con primitivos de Radix UI
- **Estilos**: Tailwind CSS v4
- **Manejo de Formularios**: react-hook-form v7.66.0
- **Validación**: Zod v4.1.12
- **Hashing de Contraseñas**: bcryptjs v3.0.3
- **Procesamiento de Archivos**: xlsx v0.18.5 para importaciones de Excel
- **Iconos**: lucide-react v0.554.0

## Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones de base de datos
npx prisma migrate dev

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Iniciar servidor de producción
npm start
```

## Configuración de Base de Datos

1. Asegurarse de que MySQL 8.0+ esté ejecutándose localmente
2. Crear un archivo `.env` en la raíz del proyecto con:
   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/attendance_db"
   NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
   NEXTAUTH_URL="http://localhost:3000"
   NODE_ENV="development"
   ```
   **Nota**: `.env.example` se referencia en la documentación pero actualmente falta en el repositorio. Arriba se muestran las variables requeridas.

3. Generar cliente de Prisma y ejecutar migraciones:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. Crear usuarios iniciales:
   - Visitar `/auth/register` para crear tu primer usuario
   - Actualizar el rol del usuario directamente en la base de datos: `UPDATE users SET role = 'SUPERADMIN' WHERE email = 'tu@email.com'`
   - O usar Prisma Studio: `npx prisma studio`

## Arquitectura

### Esquema de Base de Datos (Prisma)

**Modelos Principales:**

1. **User** (tabla `users`)
   - `id`: String (cuid, clave primaria)
   - `email`: String (único, indexado)
   - `name`: String
   - `password`: String (hash bcryptjs, 12 rondas)
   - `role`: Enum (SUPERADMIN | ADMIN | USER) - por defecto: USER
   - `createdAt`, `updatedAt`: DateTime
   - Relaciones: `attendances[]` (uno a muchos)

2. **Attendance** (tabla `attendances`)
   - `id`: String (cuid, clave primaria)
   - `userId`: String (clave foránea, eliminación en cascada)
   - `user`: Relación con User
   - `date`: DateTime (indexado para rendimiento de consultas)
   - `status`: Enum (PRESENT | ABSENT | LATE | JUSTIFIED)
   - `checkIn`: DateTime (opcional)
   - `checkOut`: DateTime (opcional)
   - `notes`: Text (opcional)
   - `createdAt`, `updatedAt`: DateTime
   - Restricción única: Ninguna (permite múltiples entradas por usuario/fecha si es necesario)

**Tablas de NextAuth:**
- `Account`: Vinculación de cuentas OAuth (proveedor, tokens, etc.)
- `Session`: Sesiones de usuario (sessionToken, expires)
- `VerificationToken`: Tokens de verificación de email

**Roles y Permisos:**
- **SUPERADMIN**: Acceso completo al sistema, gestión de usuarios, todos los registros de asistencia
- **ADMIN**: Gestionar todos los registros de asistencia, no puede gestionar usuarios
- **USER**: Ver y gestionar solo su propia asistencia

### Flujo de Autenticación

**Configuración** (`src/lib/auth.ts`):
- **Proveedor**: CredentialsProvider (solo email + contraseña, sin OAuth actualmente)
- **Adaptador**: PrismaAdapter para integración con base de datos
- **Estrategia de Sesión**: JWT (validación del lado del servidor)
- **Hashing de Contraseña**: bcryptjs con 12 rondas de salt
- **Extensión de Sesión**:
  - Callback JWT agrega `id` y `role` al token
  - Callback de sesión expone `id` y `role` en `session.user`
- **URLs de Redirección**: Página de inicio de sesión en `/auth/login`

**Protección de Rutas** (`src/middleware.ts`):
- Usa middleware `withAuth` de NextAuth
- Patrones protegidos: `/dashboard/:path*`, `/admin/:path*`, `/attendance/:path*`
- Valida token JWT y rol para cada solicitud
- Redirige usuarios no autorizados a `/dashboard` o página de login

**Acceso del Lado del Cliente** (`src/lib/hooks/use-current-user.ts`):
- Hook personalizado `useCurrentUser()` envuelve `useSession()` de NextAuth
- Retorna: `{ user, isLoading, isAuthenticated }`
- Disponible para todos los componentes cliente envueltos en `SessionProvider`

### Estructura de Rutas

**Rutas Públicas:**
- `/` - Página raíz (actualmente plantilla de Next.js sin usar, debería redirigir al dashboard)
- `/auth/login` - Página de login con formulario de email/contraseña
- `/auth/register` - Página de registro (crea rol USER por defecto)

**Rutas Protegidas** (todas requieren autenticación):
- `/dashboard` - Vista general del dashboard principal (muestra tarjetas de información del usuario)
- `/dashboard/my-attendance` - Registros de asistencia propios del usuario (todos los roles)
- `/dashboard/attendance` - Gestión de asistencia con importación de Excel (solo ADMIN/SUPERADMIN)
- `/dashboard/users` - Gestión de usuarios (**AÚN NO IMPLEMENTADO**, solo SUPERADMIN)

**Layout del Dashboard** (`/dashboard/layout.tsx`):
- Incluye componentes Navbar (superior) y Sidebar (izquierdo)
- Items del Sidebar filtrados por permisos de rol
- Layout responsivo de altura completa

### Rutas de API

**Autenticación:**
- `POST /api/auth/[...nextauth]` - Manejadores de NextAuth (login, logout, session)
- `POST /api/register` - Registro de usuario
  - Body: `{ email, name, password }`
  - Valida: unicidad de email, contraseña mínimo 6 caracteres
  - Retorna: Usuario creado (contraseña excluida) con estado 201
  - Errores: 400 (validación), 500 (error del servidor)

**Gestión de Asistencia:**
- `GET /api/attendance` - Obtener registros de asistencia
  - Parámetros de consulta: `userId` (opcional), `startDate` (opcional), `endDate` (opcional)
  - **Filtrado por rol**:
    - ADMIN/SUPERADMIN: Pueden obtener todos los registros o filtrar por userId
    - USER: Solo obtienen sus propios registros (userId forzado)
  - Retorna: Array de objetos de asistencia con información de usuario
  - Ordenado por fecha descendente

- `POST /api/attendance` - Crear registro de asistencia
  - Body: `{ date, status, userId?, checkIn?, checkOut?, notes? }`
  - Requerido: `date`, `status` (PRESENT|ABSENT|LATE|JUSTIFIED)
  - Opcional: `userId` (por defecto session.user.id), `checkIn`, `checkOut`, `notes`
  - Retorna: Asistencia creada con información de usuario
  - Errores: 401 (no autenticado), 400 (validación)

- `POST /api/attendance/import` - Importación masiva desde Excel/CSV
  - **Autorización**: Solo ADMIN o SUPERADMIN (retorna 403 en caso contrario)
  - Content-Type: `multipart/form-data`
  - Tipos de archivo: `.xlsx`, `.xls`, `.csv`
  - Retorna: `{ success: number, errors: number, errorDetails: string[] }`
  - Ver sección "Formato de Importación de Excel" para estructura de columnas

### Estructura del Proyecto

```
/home/user/systemtime/
├── prisma/
│   ├── schema.prisma              # Esquema de base de datos
│   └── migrations/                # Historial de migraciones de base de datos
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── api/                   # Rutas de API
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── register/route.ts
│   │   │   └── attendance/
│   │   │       ├── route.ts       # GET/POST asistencia
│   │   │       └── import/route.ts
│   │   ├── auth/                  # Páginas de autenticación
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── dashboard/             # Dashboard protegido
│   │   │   ├── page.tsx           # Vista general del dashboard
│   │   │   ├── layout.tsx         # Layout del dashboard
│   │   │   ├── my-attendance/page.tsx
│   │   │   └── attendance/page.tsx
│   │   ├── layout.tsx             # Layout raíz
│   │   ├── page.tsx               # Página raíz (plantilla sin usar)
│   │   └── globals.css            # Tailwind CSS + variables de tema
│   ├── components/
│   │   ├── ui/                    # Componentes shadcn/ui (11 archivos)
│   │   │   ├── avatar.tsx, badge.tsx, button.tsx
│   │   │   ├── card.tsx, dialog.tsx, dropdown-menu.tsx
│   │   │   ├── form.tsx, input.tsx, label.tsx
│   │   │   └── select.tsx, table.tsx
│   │   ├── dashboard/
│   │   │   ├── navbar.tsx         # Navegación superior con menú de usuario
│   │   │   ├── sidebar.tsx        # Barra lateral izquierda con items basados en roles
│   │   │   └── import-excel.tsx   # Diálogo de importación de Excel
│   │   └── providers/
│   │       └── session-provider.tsx  # Wrapper de SessionProvider de NextAuth
│   ├── lib/
│   │   ├── auth.ts                # Configuración de NextAuth
│   │   ├── prisma.ts              # Singleton del cliente de Prisma
│   │   ├── role-helpers.ts        # Utilidades de permisos de rol
│   │   ├── utils.ts               # Fusionador de nombres de clase cn()
│   │   └── hooks/
│   │       └── use-current-user.ts  # Hook useCurrentUser()
│   └── middleware.ts              # Protección de rutas de NextAuth
├── public/                        # Recursos estáticos
├── .env                           # Variables de entorno (no en repo)
├── .gitignore
├── package.json                   # Dependencias y scripts
├── tsconfig.json                  # Configuración de TypeScript
├── next.config.ts                 # Configuración de Next.js
├── prisma.config.ts               # Configuración de Prisma
├── components.json                # Configuración de shadcn/ui
├── tailwind.config.ts             # Configuración de Tailwind CSS
├── postcss.config.mjs             # Configuración de PostCSS
├── eslint.config.mjs              # Configuración de ESLint
├── CLAUDE.md                      # Este archivo
└── README.md                      # README del proyecto
```

### Formato de Importación de Excel

La función de importación de asistencia (página `/dashboard/attendance`, solo ADMIN+) espera archivos CSV/Excel con estas columnas:

**Columnas Requeridas:**
- `email`: Email del usuario para coincidir con la base de datos (debe existir en la tabla users)
- `fecha`: Fecha de asistencia (cualquier formato de fecha estándar)
- `estado`: Estado - debe ser uno de: PRESENT, ABSENT, LATE, JUSTIFIED

**Columnas Opcionales:**
- `entrada`: Fecha y hora de entrada
- `salida`: Fecha y hora de salida
- `notas`: Notas/comentarios (texto)

**Proceso de Importación:**
1. Hacer clic en el botón "Importar Excel" en la página de asistencia
2. Descargar plantilla CSV como referencia (incluye datos de ejemplo)
3. Subir archivo Excel/CSV completado
4. El sistema valida cada fila y proporciona retroalimentación detallada de errores
5. Los registros importados exitosamente aparecen en la tabla de asistencia

**Manejo de Errores:**
- Email inválido: Omite la fila, reporta "Usuario no encontrado"
- Estado inválido: Omite la fila, reporta valores permitidos
- Campos requeridos faltantes: Omite la fila con mensaje de error
- El resumen de importación muestra: conteo de éxitos, conteo de errores, lista detallada de errores

### Componentes del Dashboard

**Navbar** (`src/components/dashboard/navbar.tsx`):
- Barra de navegación superior fija con título "Sistema de Asistencia"
- Menú desplegable de usuario mostrando nombre, email, insignia de rol
- Colores de insignia de rol: SUPERADMIN (morado), ADMIN (azul), USER (gris)
- Botón de cerrar sesión activa signOut de NextAuth
- Componente cliente usando hook useCurrentUser

**Sidebar** (`src/components/dashboard/sidebar.tsx`):
- Panel de navegación izquierdo con items de menú basados en roles
- Items de navegación:
  - Dashboard (todos los roles)
  - Mi Asistencia (todos los roles)
  - Gestionar Asistencia (ADMIN/SUPERADMIN) - usa `canManageAttendance()`
  - Usuarios (solo SUPERADMIN) - usa `canManageUsers()`
- Resaltado de ruta activa con color de fondo diferente
- Componente cliente usando usePathname para detección de activo

**ImportExcel** (`src/components/dashboard/import-excel.tsx`):
- Modal de diálogo para carga de archivo Excel
- Características: entrada de archivo, descarga de plantilla, progreso de carga
- Retroalimentación de éxito/error con lista detallada de errores
- Llama a `/api/attendance/import` con FormData
- Dispara callback en éxito para refrescar tabla de asistencia

### Hooks Personalizados

**useCurrentUser** (`src/lib/hooks/use-current-user.ts`):
```typescript
const { user, isLoading, isAuthenticated } = useCurrentUser()
```
- Envuelve el hook `useSession()` de NextAuth
- Retorna objeto de usuario con `id`, `email`, `name`, `role`
- `isLoading`: true mientras se obtiene la sesión
- `isAuthenticated`: true si el usuario está logueado
- Usar solo en componentes cliente

## Convenciones Importantes

**Idioma y Localización:**
- Todo el texto de cara al usuario está en español
- Fechas formateadas con locale `es-ES`: `toLocaleDateString('es-ES')`
- Horas formateadas con locale `es-ES`: `toLocaleTimeString('es-ES')`
- Los campos de base de datos usan español: `fecha`, `estado`, `entrada`, `salida`, `notas`

**Organización del Código:**
- Los componentes cliente deben usar la directiva `"use client"` al inicio del archivo
- Los componentes servidor (por defecto) pueden acceder a la base de datos directamente
- Las rutas de API siempre validan sesión y permisos de rol antes de procesar
- Usar funciones helper de rol en lugar de comparación directa de strings de rol
- Todos los componentes usan TypeScript con modo estricto

**Seguridad:**
- Contraseñas hasheadas con bcryptjs (12 rondas) antes del almacenamiento
- Longitud mínima de contraseña: 6 caracteres (considerar aumentar a 8+)
- Tokens JWT validados en cada ruta protegida vía middleware
- Protección CSRF habilitada por defecto en NextAuth
- Sin datos sensibles en sesión del lado del cliente (solo id, email, name, role)

**Base de Datos:**
- Todos los IDs usan `cuid()` para identificadores únicos y seguros distribuidos
- Timestamps auto-gestionados: `createdAt`, `updatedAt`
- Restricciones de clave foránea con eliminación en cascada (User → Attendance)
- Campos indexados: `email`, `date`, `userId` para rendimiento de consultas

**Estilos:**
- Tailwind CSS v4 con variables CSS para temas
- Soporte de modo oscuro vía clase `.dark` (toggle no implementado)
- Componentes shadcn/ui estilizados con variante "new-york"
- Sistema de color usa oklch() para mejor uniformidad perceptual
- Usar utilidad `cn()` para fusionar clases de Tailwind condicionalmente

**Colores de Insignias de Estado:**
- PRESENT: verde (`bg-green-100 text-green-800`)
- ABSENT: rojo (`bg-red-100 text-red-800`)
- LATE: amarillo (`bg-yellow-100 text-yellow-800`)
- JUSTIFIED: azul (`bg-blue-100 text-blue-800`)

## Funciones Helper de Roles

Ubicadas en `src/lib/role-helpers.ts` - **Siempre usar estas en lugar de verificaciones directas de rol:**

```typescript
hasRole(role, allowedRoles)      // Verificador genérico de rol
isSuperAdmin(role)               // Retorna true si SUPERADMIN
isAdmin(role)                    // Retorna true si ADMIN o SUPERADMIN
isUser(role)                     // Retorna true si USER
canManageUsers(role)             // Retorna true solo si SUPERADMIN
canManageAttendance(role)        // Retorna true si ADMIN o SUPERADMIN
canViewAllAttendance(role)       // Retorna true si ADMIN o SUPERADMIN
```

**Ejemplo de Uso:**
```typescript
import { canManageAttendance } from '@/lib/role-helpers'

if (canManageAttendance(session.user.role)) {
  // Mostrar características de admin
}
```

## Brechas Conocidas y Mejoras Futuras

**Implementaciones Faltantes:**
1. **Página de Gestión de Usuarios** (`/dashboard/users`):
   - El enlace en el sidebar existe pero la página no está implementada
   - Debería permitir a SUPERADMIN: crear, editar, eliminar usuarios, cambiar roles
   - Rutas de API requeridas: GET/POST/PUT/DELETE `/api/users`

2. **Registro Manual de Asistencia**:
   - El botón "Registrar Asistencia" existe pero sin funcionalidad
   - Debería abrir un diálogo para crear registro de asistencia manualmente
   - Campos del formulario: usuario (dropdown), fecha, estado, horarios, notas

3. **Redirección de Página Raíz**:
   - `/` todavía muestra la plantilla por defecto de Next.js
   - Debería redirigir usuarios autenticados a `/dashboard`
   - Debería mostrar página de inicio o redirigir a `/auth/login` para invitados

4. **Editar/Eliminar Asistencia**:
   - Sin UI para editar o eliminar registros de asistencia existentes
   - Considerar agregar columna de acciones a las tablas de asistencia

**Archivos Faltantes:**
- `.env.example`: Debería crearse con variables de entorno de plantilla

**Mejoras de Seguridad Necesarias:**
- Requisitos de fortaleza de contraseña (actualmente solo 6 caracteres)
- Flujo de verificación de email
- Funcionalidad de restablecimiento de contraseña
- Bloqueo de cuenta después de intentos fallidos de login
- Limitación de tasa en rutas de API
- Registro de auditoría para cambios de usuario/asistencia

**Mejoras de UX:**
- Esqueletos de carga en lugar de texto "Cargando..."
- Límites de error para mejor manejo de errores
- Notificaciones toast para mensajes de éxito/error
- Paginación para tablas de asistencia (actualmente carga todas)
- Filtros de rango de fechas en páginas de asistencia
- Funcionalidad de búsqueda en tablas de asistencia
- Exportar asistencia a Excel/PDF

**Modo Oscuro:**
- Las variables CSS existen en `globals.css`
- Toggle UI no implementado
- Agregar conmutador de tema al navbar

## Consejos de Desarrollo

**Agregar una Nueva Página:**
1. Crear archivo de página: `src/app/tu-ruta/page.tsx`
2. Agregar al sidebar si es necesario: `src/components/dashboard/sidebar.tsx`
3. Actualizar middleware si la ruta necesita protección: `src/middleware.ts`
4. Agregar verificaciones de rol si es necesario usando funciones helper

**Agregar una Nueva Ruta de API:**
1. Crear archivo de ruta: `src/app/api/tu-ruta/route.ts`
2. Siempre validar sesión: `const session = await auth()`
3. Verificar permisos usando helpers de rol antes de procesar
4. Retornar códigos de estado HTTP apropiados (200, 201, 400, 401, 403, 500)
5. Usar cliente de Prisma desde `@/lib/prisma`

**Agregar un Nuevo Componente de shadcn/ui:**
```bash
npx shadcn@latest add [nombre-componente]
```
El componente se agregará a `src/components/ui/`

**Cambios en Base de Datos:**
1. Actualizar `prisma/schema.prisma`
2. Crear migración: `npx prisma migrate dev --name descripcion`
3. Regenerar cliente: `npx prisma generate`
4. Actualizar tipos de TypeScript si es necesario

**Probar Cambios:**
1. Ejecutar servidor de desarrollo: `npm run dev`
2. Probar en navegador en http://localhost:3000
3. Verificar consola del navegador para errores
4. Probar con diferentes roles de usuario (crear usuarios de prueba con diferentes roles)
5. Compilar antes de desplegar: `npm run build`

## Tareas Comunes

**Crear un usuario SUPERADMIN:**
```bash
# Opción 1: Vía Prisma Studio
npx prisma studio
# Navegar al modelo User, encontrar usuario, editar rol a SUPERADMIN

# Opción 2: SQL Directo (si MySQL CLI está disponible)
mysql -u user -p nombre_base_datos
UPDATE users SET role = 'SUPERADMIN' WHERE email = 'tu@email.com';
```

**Resetear Base de Datos:**
```bash
npx prisma migrate reset
# Advertencia: ¡Esto elimina todos los datos!
```

**Ver Base de Datos:**
```bash
npx prisma studio
# Abre GUI en http://localhost:5555
```

**Verificar Errores de TypeScript:**
```bash
npx tsc --noEmit
```

**Formatear Código:**
```bash
npm run lint
```

**Actualizar Dependencias:**
```bash
npm update
# O para paquete específico:
npm update nombre-paquete
```

## Solución de Problemas

**Error "Prisma Client not generated":**
```bash
npx prisma generate
```

**Errores de conexión a base de datos:**
- Verificar que MySQL esté ejecutándose
- Verificar DATABASE_URL en `.env`
- Verificar que el usuario de MySQL tenga permisos adecuados
- Asegurarse de que la base de datos exista

**Errores de NextAuth:**
- Verificar que NEXTAUTH_SECRET esté configurado en `.env`
- Verificar que NEXTAUTH_URL coincida con la URL de tu aplicación
- Limpiar cookies del navegador si persisten problemas de sesión

**Errores de compilación:**
- Ejecutar `npx prisma generate` antes de compilar
- Verificar errores de TypeScript: `npx tsc --noEmit`
- Limpiar carpeta `.next`: `rm -rf .next && npm run build`

**Importación no funciona:**
- Verificar que el archivo tenga las columnas correctas (email, fecha, estado)
- Verificar que los emails de usuario existan en la base de datos
- Verificar que los valores de estado sean exactamente: PRESENT, ABSENT, LATE, o JUSTIFIED
- Mirar los detalles de error en el diálogo de resultado de importación
