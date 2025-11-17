# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sistema de Control de Asistencia - A comprehensive attendance tracking system built with Next.js 14, featuring:
- Role-based authentication (SUPERADMIN/ADMIN/USER)
- Manual attendance tracking with Excel import
- **Biometric clock system integration** with automatic error detection
- PDF report generation (tolerant and strict modes)
- Monthly summaries and statistics

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js v5 (beta)
- **UI Components**: shadcn/ui + Tailwind CSS
- **File Processing**: xlsx library for Excel imports
- **PDF Generation**: jsPDF + jspdf-autotable for reports
- **Date Handling**: date-fns for date manipulation

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

1. Ensure MySQL is running locally or update DATABASE_URL in .env
2. Copy .env.example to .env and configure:
   - DATABASE_URL: MySQL connection string
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
/dashboard/marcaciones          - Import biometric clock Excel files
/dashboard/empleados-biometrico - View biometric system employees
/dashboard/informes            - Generate PDF reports (tolerant/strict modes)
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
POST /api/marcaciones/importar   - Import biometric Excel, process punches, detect errors
GET  /api/empleados              - List biometric employees
POST /api/informes/generar       - Generate PDF reports (tolerant/strict)
GET  /api/estadisticas           - Get biometric system statistics
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
- `src/components/ui/`: shadcn/ui components
- `src/components/dashboard/`: Dashboard navbar, sidebar
- `src/components/marcaciones/`: Biometric Excel upload component
- `src/components/informes/`: PDF report generator component

**Pages:**
- `src/app/`: Next.js App Router pages and layouts
- `src/app/dashboard/marcaciones/`: Biometric import page
- `src/app/dashboard/empleados-biometrico/`: Employee list page
- `src/app/dashboard/informes/`: PDF report generation page

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

- All user-facing text is in Spanish
- Dates use es-ES locale formatting
- Components use "use client" directive where hooks/interactivity needed
- API routes validate user session and role permissions
- Password minimum length: 6 characters
- Database uses cuid() for IDs

## Role Helper Functions

Located in `src/lib/role-helpers.ts`:
- `canManageUsers(role)`: Check if user can manage users (SUPERADMIN only)
- `canManageAttendance(role)`: Check if user can manage attendance (ADMIN/SUPERADMIN)
- `canViewAllAttendance(role)`: Check if user can view all attendance records
- `isSuperAdmin(role)`, `isAdmin(role)`, `isUser(role)`: Role checks

**Note**: Biometric system routes require ADMIN or SUPERADMIN roles.

## Biometric Clock System

### Error Detection Engine

The system automatically detects 5 types of punch errors:

1. **entrada_sin_salida**: Entry without corresponding exit
2. **salida_sin_entrada**: Exit without prior entry
3. **repetido**: Duplicate/repeated punch
4. **invalido**: Punch marked invalid by biometric clock
5. **secuencia_incorrecta**: Invalid entry-exit sequence

### Calculation Modes

**Tolerant Mode** (`modo: 'tolerante'`):
- Attempts to calculate hours even with errors
- Assumes 8 hours when entry or exit is missing
- Best for general audits and reviews

**Strict Mode** (`modo: 'estricto'`):
- Only counts days without any errors
- Days with errors show 0 hours
- Best for precise payroll calculations

### Processing Flow

```
1. Upload Excel → 2. Parse & Normalize → 3. Detect Errors →
4. Build Entry-Exit Pairs → 5. Calculate Hours → 6. Save to DB →
7. Generate Monthly Summaries
```

### Data Storage

- **Raw Punches**: Stored in `marcaciones_raw` with all original data
- **Processed Daily**: Stored in `asistencia_diaria` with up to 3 entry-exit pairs
- **Monthly Summaries**: Auto-calculated in `resumen_mensual`
- **Reports**: Generated on-demand, metadata saved in `informes`

### PDF Reports

Generated using jsPDF with:
- Employee details (name, badge number)
- Date range
- Daily breakdown with all entry-exit pairs
- Total days worked and hours
- Error indicators (in strict mode)
- Professional formatting with tables

## Additional Resources

See [README_SISTEMA_BIOMETRICO.md](README_SISTEMA_BIOMETRICO.md) for:
- Complete biometric system documentation
- Step-by-step usage guide
- Troubleshooting tips
- Architecture details
