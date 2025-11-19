# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sistema de Control de Asistencia** - Sistema integral de seguimiento de asistencia construido con Next.js 14, que incluye:

### Características Principales
- 🔐 **Autenticación basada en roles** (SUPERADMIN/ADMIN/USER)
- ✅ **Sistema manual de asistencia** con importación desde Excel
- 🖐️ **Integración con relojes biométricos** con detección automática de 5 tipos de errores
- 📄 **Generación de reportes PDF** (modos tolerante y estricto)
- 📊 **Resúmenes y estadísticas mensuales** automáticas
- 🔄 **Procesamiento dual de archivos Excel** (normales e inválidos)

### Dos Sistemas Independientes

1. **Sistema Manual** (`User` → `Attendance`): Para seguimiento tradicional de asistencia
2. **Sistema Biométrico** (`Empleado` → `MarcacionRaw` → `AsistenciaDiaria` → `ResumenMensual`): Para procesar datos de relojes biométricos

## Tech Stack

- **Framework**: Next.js 16.0.3 (App Router con React 19.2.0)
- **Language**: TypeScript 5
- **Database**: PostgreSQL (Supabase) con Prisma ORM 6.19.0
- **Authentication**: NextAuth.js v5.0.0-beta.30 (JWT strategy)
- **UI Components**: shadcn/ui + Tailwind CSS v4 + Radix UI
- **Forms**: React Hook Form + Zod para validación
- **File Processing**: xlsx 0.18.5 para importación de Excel
- **PDF Generation**: jsPDF 3.0.3 + jspdf-autotable 5.0.2
- **Date Handling**: date-fns 4.1.0
- **Icons**: lucide-react 0.554.0
- **Security**: bcryptjs 3.0.3 para hashing de passwords

## Development Commands

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Database Setup

1. Ensure Supabase project is set up or update DATABASE_URL/DIRECT_URL in .env
2. Copy .env.example to .env and configure:
   - DATABASE_URL: Supabase Connection String (Transaction Pooler)
   - DIRECT_URL: Supabase Direct Connection String (Session Pooler)
   - NEXTAUTH_SECRET: Generate with `openssl rand -base64 32`
   - NEXTAUTH_URL: Application URL (default: http://localhost:3000)

3. Run migrations:
```bash
npx prisma migrate dev
```

4. (Optional) Seed initial data or create users via /auth/register

## Architecture

### Database Schema (Prisma)

**Models (Manual Attendance System):**
- `User`: Users with email, password (hashed), role (SUPERADMIN/ADMIN/USER)
- `Attendance`: Attendance records linked to users with status, check-in/out times, notes
- `Account`, `Session`, `VerificationToken`: NextAuth required tables

**Models (Biometric Clock System):**
- `Empleado`: Employees from biometric clock (numeroAC, nombre, departamento)
- `Importacion`: Import records with stats (total, valid, invalid records)
- `MarcacionRaw`: Raw clock punches (numeroAC, fechaHora, estado, excepcion)
- `AsistenciaDiaria`: Processed daily attendance (up to 3 in/out pairs, hours, errors)
- `ResumenMensual`: Monthly summaries per employee (days worked, total hours, error days)
- `Informe`: PDF report generation history

**Roles & Permissions:**
- **SUPERADMIN**: Full access, can manage users
- **ADMIN**: Can manage all attendance records
- **USER**: Can only view their own attendance

### Authentication Flow

- Credential-based authentication using NextAuth.js
- Password hashing with bcryptjs
- JWT session strategy
- Role information stored in session token
- Middleware protects routes based on user role (src/middleware.ts)

### Route Structure

**Authentication:**
```
/auth/login          - Login page
/auth/register       - Registration page
```

**Dashboard (Protected):**
```
/dashboard                      - Main dashboard with stats
/dashboard/my-attendance        - User's own attendance records (USER)
/dashboard/attendance           - Attendance management (ADMIN/SUPERADMIN)
/dashboard/users               - User management (SUPERADMIN only)
```

**Biometric System (ADMIN/SUPERADMIN only):**
```
/dashboard/marcaciones              - Import biometric clock Excel files (single mode)
/dashboard/marcaciones-dual         - Import dual Excel files (normal + invalid)
/dashboard/empleados-biometrico     - View biometric system employees
/dashboard/asistencias-biometrico   - View processed daily attendance records
/dashboard/informes                 - Generate PDF reports (tolerant/strict modes)
```

### API Routes

**Authentication & Manual Attendance:**
```
POST /api/auth/[...nextauth]     - NextAuth handlers
POST /api/register               - User registration
GET  /api/attendance             - Fetch attendances (filtered by role)
POST /api/attendance             - Create attendance record
POST /api/attendance/import      - Import attendances from Excel
```

**Biometric Clock System:**
```
POST /api/marcaciones/importar       - Import single biometric Excel file
POST /api/marcaciones/importar-dual  - Import dual Excel files (normal + invalid)
GET  /api/empleados                  - List biometric employees with filters
GET  /api/asistencias                - Get processed daily attendance records
POST /api/informes/generar           - Generate PDF reports (tolerant/strict)
GET  /api/estadisticas               - Get biometric system statistics
```

### Key Files & Directories

**Core:**
- `prisma/schema.prisma`: Database schema (User, Attendance, Biometric models)
- `src/lib/auth.ts`: NextAuth configuration with role support
- `src/lib/prisma.ts`: Prisma client instance
- `src/lib/role-helpers.ts`: Role permission checking utilities
- `src/lib/utils.ts`: Utility functions (date formatting, Excel parsing)
- `src/middleware.ts`: Route protection middleware

**Biometric Clock Engine:**
- `src/lib/asistencia/deteccion-errores.ts`: Detect 5 error types in punches
- `src/lib/asistencia/armado-pares.ts`: Build entry-exit pairs from punches
- `src/lib/asistencia/calculo-horas.ts`: Calculate hours (tolerant/strict modes)
- `src/lib/asistencia/motor-calculo.ts`: Main processing engine
- `src/lib/excel/lector.ts`: Read Excel files from biometric clocks
- `src/lib/excel/normalizador.ts`: Normalize and group punches
- `src/lib/pdf/generador-informes.ts`: Generate PDF reports with jsPDF

**Types:**
- `src/types/marcacion.ts`: Biometric punch types
- `src/types/empleado.ts`: Employee types
- `src/types/informe.ts`: Report types

**UI Components:**
- `src/components/ui/`: shadcn/ui components (button, card, table, dialog, select, etc.)
- `src/components/dashboard/`: Dashboard navbar, sidebar, import-excel
- `src/components/marcaciones/`: Biometric Excel upload components (single & dual mode)
- `src/components/informes/`: PDF report generator component
- `src/components/providers/`: Session provider for NextAuth

**Pages (App Router):**
- `src/app/page.tsx`: Landing page
- `src/app/auth/login/`: Login page
- `src/app/auth/register/`: Registration page
- `src/app/dashboard/page.tsx`: Main dashboard with statistics
- `src/app/dashboard/attendance/`: Manual attendance management
- `src/app/dashboard/my-attendance/`: User's own attendance
- `src/app/dashboard/users/`: User management (SUPERADMIN)
- `src/app/dashboard/marcaciones/`: Single biometric import
- `src/app/dashboard/marcaciones-dual/`: Dual biometric import
- `src/app/dashboard/empleados-biometrico/`: Employee list
- `src/app/dashboard/asistencias-biometrico/`: Daily attendance view
- `src/app/dashboard/informes/`: PDF report generation

**Hooks:**
- `src/lib/hooks/use-current-user.ts`: Get current authenticated user from session

### Excel Import Formats

**Manual Attendance Import** (`/api/attendance/import`):
- `email` (required): User email to match against database
- `fecha` (required): Attendance date
- `estado` (required): Status (PRESENT, ABSENT, LATE, JUSTIFIED)
- `entrada` (optional): Check-in datetime
- `salida` (optional): Check-out datetime
- `notas` (optional): Notes/comments

**Biometric Clock Import** (`/api/marcaciones/importar`):
- `Nº AC.` (required): Employee ID/badge number (unique identifier)
- `Nº` (optional): Employee number
- `Nombre` (required): Full name
- `Tiempo` (required): Timestamp in format "DD/M/YYYY HH:mm" (e.g., "14/5/2025 08:04")
- `Estado` (required): "Entrada" or "Salida"
- `Excepción` (optional): "FOT" (normal), "Invalido", or "Repetido"
- `Nuevo Estado` (optional): New status
- `Operación` (optional): Operation performed

## Important Conventions

### General Rules
- **Idioma**: Todo el texto visible para usuarios está en español
- **Fechas**: Usar formato es-ES locale (formato: DD/MM/YYYY)
- **Client Components**: Usar directiva "use client" cuando se necesiten hooks o interactividad
- **Validación**: Todas las rutas API validan sesión de usuario y permisos de rol
- **Seguridad**:
  - Contraseñas: mínimo 6 caracteres
  - Hashing con bcryptjs
  - Validación con Zod en formularios
- **IDs**: La base de datos usa `cuid()` para IDs únicos
- **Prisma Client**: Generado en `src/generated/prisma` (no en node_modules)

### Coding Standards
- **TypeScript**: Usar tipos estrictos, evitar `any`
- **Naming**:
  - Componentes: PascalCase (e.g., `UploadExcel.tsx`)
  - Archivos de utilidades: kebab-case (e.g., `deteccion-errores.ts`)
  - Variables: camelCase en español (e.g., `empleadoId`, `fechaInicio`)
- **Imports**: Preferir imports absolutos desde `@/` cuando sea posible
- **Error Handling**: Siempre manejar errores con try-catch en API routes

## Role Helper Functions

Located in `src/lib/role-helpers.ts`:
- `canManageUsers(role)`: Check if user can manage users (SUPERADMIN only)
- `canManageAttendance(role)`: Check if user can manage attendance (ADMIN/SUPERADMIN)
- `canViewAllAttendance(role)`: Check if user can view all attendance records
- `isSuperAdmin(role)`, `isAdmin(role)`, `isUser(role)`: Role checks

**Note**: Biometric system routes require ADMIN or SUPERADMIN roles.

## Biometric Clock System

### Architecture Overview

El sistema biométrico procesa marcaciones de relojes biométricos en 7 pasos:

```
1. Excel Upload → 2. Parse (xlsx) → 3. Normalize & Group by Date →
4. Error Detection → 5. Build Entry-Exit Pairs → 6. Calculate Hours →
7. Save to DB (MarcacionRaw + AsistenciaDiaria + ResumenMensual)
```

### Error Detection Engine

El sistema detecta automáticamente **5 tipos de errores** en marcaciones:

1. **entrada_sin_salida**: Entrada sin su salida correspondiente
2. **salida_sin_entrada**: Salida sin entrada previa
3. **repetido**: Marcación duplicada/repetida (detectado por el reloj)
4. **invalido**: Marcación marcada como inválida por el reloj biométrico
5. **secuencia_incorrecta**: Secuencia de entrada-salida inválida

Estos errores se almacenan en:
- `AsistenciaDiaria.tieneErrores` (boolean)
- `AsistenciaDiaria.tipoError` (CSV string: "invalido,repetido")
- `AsistenciaDiaria.observaciones` (detalles JSON)

### Calculation Modes

**Modo Tolerante** (`modo: 'tolerante'`):
- Intenta calcular horas incluso con errores
- Asume 8 horas cuando falta entrada o salida
- Mejor para auditorías generales y revisiones
- Usado en dashboard principal y vistas de asistencia

**Modo Estricto** (`modo: 'estricto'`):
- Solo cuenta días sin ningún error
- Días con errores muestran 0 horas
- Mejor para cálculos precisos de nómina
- Usado en reportes PDF para nómina

### Dual Import System

El sistema soporta **dos modos de importación**:

1. **Single Mode** (`/api/marcaciones/importar`):
   - Importa un solo archivo Excel con todas las marcaciones
   - Filtra automáticamente marcaciones inválidas y repetidas

2. **Dual Mode** (`/api/marcaciones/importar-dual`):
   - Importa dos archivos simultáneamente:
     - **Archivo Normal**: Marcaciones válidas (FOT)
     - **Archivo Inválidos**: Marcaciones inválidas y repetidas
   - Combina ambos archivos antes del procesamiento
   - Mejor precisión en detección de errores

### Data Storage

**Capa 1 - Raw Data** (`MarcacionRaw`):
- Almacena todas las marcaciones originales del Excel
- Incluye: numeroAC, nombre, fechaHora, estado, excepcion
- Relación con `Importacion` (metadata del archivo Excel)
- Nunca se modifica después de importar

**Capa 2 - Processed Daily** (`AsistenciaDiaria`):
- Almacena asistencia procesada por día
- Hasta **3 pares entrada-salida** por día:
  - entrada1/salida1, entrada2/salida2, entrada3/salida3
- Campos calculados:
  - `horasTrabajadas`: Decimal (5,2) - total de horas del día
  - `tieneErrores`: Boolean - indica si hay algún error
  - `tipoError`: String - tipos de errores separados por coma
  - `observaciones`: Text - detalles de errores en JSON
  - `marcacionesRaw`: Text - JSON con todas las marcaciones originales

**Capa 3 - Monthly Summaries** (`ResumenMensual`):
- Auto-calculado por año y mes
- Campos:
  - `diasTrabajados`: Días con asistencia
  - `totalHoras`: Suma de horas del mes
  - `diasConErrores`: Cantidad de días con errores
- Relación única: `[empleadoId, año, mes]`

**Capa 4 - Reports** (`Informe`):
- Metadata de reportes PDF generados
- No almacena el PDF (se genera on-demand)
- Incluye: empleado, fechas, tipo (tolerante/estricto), totales

### PDF Reports

Generados con **jsPDF + jspdf-autotable**:

**Contenido del Reporte:**
- 📋 Datos del empleado (nombre completo, DNI, legajo, escuela)
- 📅 Rango de fechas del reporte
- 📊 Tabla detallada diaria:
  - Fecha
  - Entrada 1, Salida 1
  - Entrada 2, Salida 2
  - Entrada 3, Salida 3
  - Horas trabajadas
  - Observaciones (errores en modo estricto)
- 📈 Totales:
  - Total días trabajados
  - Total horas trabajadas
  - Indicadores de error (en modo estricto)

**Formateo:**
- Tamaño: A4 landscape (horizontal)
- Fuentes: Helvetica (regular y bold)
- Tablas con auto-ajuste de columnas
- Colores: Header azul (#3B82F6)
- Exportado con nombre: `informe_{nombre}_{fechas}.pdf`

## Database Schema Details

### Enums Definidos

```typescript
// Roles del sistema
enum Role {
  SUPERADMIN  // Acceso total + gestión de usuarios
  ADMIN       // Gestión de asistencias + sistema biométrico
  USER        // Solo ver sus propias asistencias
}

// Estados de asistencia manual
enum AttendanceStatus {
  PRESENT     // Presente
  ABSENT      // Ausente
  LATE        // Tarde
  JUSTIFIED   // Justificado
}

// Estados de marcación biométrica
enum EstadoMarcacion {
  Entrada     // Marcación de entrada
  Salida      // Marcación de salida
}

// Excepciones en marcaciones
enum ExcepcionMarcacion {
  FOT         // Normal (sin excepciones)
  Invalido    // Marcado como inválido por el reloj
  Repetido    // Marcación duplicada
}

// Tipos de archivo Excel
enum TipoArchivo {
  marcaciones  // Archivo de marcaciones normales
  invalidos    // Archivo de marcaciones inválidas
}

// Tipos de informe
enum TipoInforme {
  tolerante   // Calcula horas incluso con errores
  estricto    // Solo cuenta días sin errores
}
```

### Índices y Optimizaciones

**Índices importantes:**
- `users`: `[email]` - Búsqueda rápida por email en login
- `attendances`: `[userId]`, `[date]` - Filtrado por usuario y fecha
- `empleados`: `[numeroAC]` - Búsqueda por DNI (único)
- `marcaciones_raw`: `[numeroAC, fechaHora]`, `[importacionId]`
- `asistencia_diaria`: `[fecha]`, `[empleadoId, fecha]` - Queries por rango de fechas
- `resumen_mensual`: `[año, mes]` - Búsqueda por periodo

**Constraints únicos:**
- `empleados.numeroAC` - Un DNI por empleado
- `asistencia_diaria.[empleadoId, fecha]` - Una asistencia por día por empleado
- `resumen_mensual.[empleadoId, año, mes]` - Un resumen por mes por empleado

### Relaciones Cascade

- `User` → `Attendance`: ON DELETE CASCADE (al borrar usuario, borra asistencias)
- `Empleado` → `AsistenciaDiaria/ResumenMensual/Informe`: ON DELETE CASCADE
- `Importacion` → `MarcacionRaw`: ON DELETE CASCADE

## Best Practices & Common Patterns

### Authentication
```typescript
// Obtener sesión en Server Components
import { auth } from "@/lib/auth";
const session = await auth();
if (!session) redirect("/auth/login");

// Obtener usuario actual en Client Components
import { useCurrentUser } from "@/lib/hooks/use-current-user";
const user = useCurrentUser();
```

### Role Checking
```typescript
import { canManageUsers, canManageAttendance } from "@/lib/role-helpers";

// En API routes
if (!canManageUsers(session.user.role)) {
  return NextResponse.json({ error: "No autorizado" }, { status: 403 });
}
```

### Prisma Queries
```typescript
// Usar el cliente generado
import { prisma } from "@/lib/prisma";

// Incluir relaciones
const empleado = await prisma.empleado.findUnique({
  where: { numeroAC: dni },
  include: {
    asistencias: { orderBy: { fecha: "desc" } },
    resumenMensual: true
  }
});

// Crear con relación
await prisma.asistenciaDiaria.create({
  data: {
    empleadoId: empleado.id,
    fecha: new Date(),
    entrada1: entradaTime,
    // ...
  }
});
```

### Error Handling en API Routes
```typescript
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Validar con Zod
    const body = await req.json();
    // ... lógica

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error en API:", error);
    return NextResponse.json(
      { error: "Error del servidor" },
      { status: 500 }
    );
  }
}
```

## Troubleshooting

### Common Issues

1. **Prisma Client not found**
   ```bash
   npx prisma generate
   ```

2. **Database connection error**
   - Verificar credenciales de Supabase
   - Verificar que DATABASE_URL use el puerto 6543 (Pooler) y DIRECT_URL el 5432

3. **NextAuth session error**
   - Verificar NEXTAUTH_SECRET está configurado
   - Regenerar con: `openssl rand -base64 32`

4. **Excel import fails**
   - Verificar formato de columnas
   - Verificar formato de fechas: "DD/M/YYYY HH:mm"
   - Verificar que numeroAC (DNI) exista en empleados

5. **PDF generation fails**
   - Verificar rango de fechas tiene datos
   - Verificar empleado existe
   - Ver logs del servidor para detalles

## Additional Resources

### Documentation Files
- [README_SISTEMA_BIOMETRICO.md](README_SISTEMA_BIOMETRICO.md): Documentación completa del sistema biométrico
- [ANALISIS_ARCHIVOS_BIOMETRICO.md](ANALISIS_ARCHIVOS_BIOMETRICO.md): Análisis de estructura de archivos Excel

### External Documentation
- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [Prisma ORM](https://www.prisma.io/docs)
- [NextAuth.js v5](https://authjs.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
