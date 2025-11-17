# SISTEMA DE CONTROL DE ASISTENCIA - GUÍA COMPLETA
## Next.js + MySQL + TypeScript

**Tiempo estimado: 2-3 horas**  
**Nivel: Intermedio**

---

## 📋 ÍNDICE

1. [Descripción del Sistema](#descripción-del-sistema)
2. [Pre-requisitos](#pre-requisitos)
3. [Paso 1: Configurar Base de Datos](#paso-1-configurar-base-de-datos)
4. [Paso 2: Crear Proyecto Next.js](#paso-2-crear-proyecto-nextjs)
5. [Paso 3: Instalar Dependencias](#paso-3-instalar-dependencias)
6. [Paso 4: Configurar Prisma](#paso-4-configurar-prisma)
7. [Paso 5: Crear Estructura de Carpetas](#paso-5-crear-estructura-de-carpetas)
8. [Paso 6: Archivos de Configuración](#paso-6-archivos-de-configuración)
9. [Paso 7: Tipos TypeScript](#paso-7-tipos-typescript)
10. [Paso 8: Utilidades](#paso-8-utilidades)
11. [Paso 9: Lógica de Excel](#paso-9-lógica-de-excel)
12. [Paso 10: Motor de Asistencia](#paso-10-motor-de-asistencia)
13. [Paso 11: Generador de PDFs](#paso-11-generador-de-pdfs)
14. [Paso 12: API Routes](#paso-12-api-routes)
15. [Paso 13: Componentes UI](#paso-13-componentes-ui)
16. [Paso 14: Páginas](#paso-14-páginas)
17. [Paso 15: Ejecutar el Sistema](#paso-15-ejecutar-el-sistema)
18. [Paso 16: Pruebas](#paso-16-pruebas)
19. [Troubleshooting](#troubleshooting)

---

## DESCRIPCIÓN DEL SISTEMA

Sistema que procesa marcaciones de relojes biométricos, calcula automáticamente horas trabajadas y genera informes en PDF.

**Características principales:**
- ✅ Importación desde archivos Excel del reloj biométrico
- ✅ Detección automática de 5 tipos de errores de marcación
- ✅ Cálculo inteligente de horas trabajadas
- ✅ Manejo de múltiples turnos y turnos nocturnos
- ✅ Dos modos de informe (tolerante y estricto)
- ✅ Generación de PDFs profesionales
- ✅ Dashboard con estadísticas
- ✅ Gestión completa de empleados

**Flujo de datos:**
```
[Excel del Reloj] → [Importación] → [Limpieza] → [Cálculo] → [Base de Datos] → [PDF]
```

---

## PRE-REQUISITOS

Antes de comenzar, instala:

1. **Node.js 18+** → https://nodejs.org/
2. **MySQL 8.0+** → https://dev.mysql.com/downloads/
3. **Git** → https://git-scm.com/
4. **Editor de código** (VS Code recomendado)

Verifica las instalaciones:

```bash
node --version    # Debe ser v18.0.0 o superior
npm --version     # Debe estar instalado
mysql --version   # Debe ser 8.0 o superior
```

---

## PASO 1: CONFIGURAR BASE DE DATOS

### 1.1 Iniciar MySQL

```bash
# Windows
net start MySQL80

# Mac
brew services start mysql

# Linux
sudo systemctl start mysql
```

### 1.2 Crear Base de Datos

Conéctate a MySQL:

```bash
mysql -u root -p
```

Ejecuta estos comandos:

```sql
-- Crear base de datos
CREATE DATABASE asistencia_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario
CREATE USER 'asistencia_user'@'localhost' IDENTIFIED BY 'Password123!';

-- Dar permisos
GRANT ALL PRIVILEGES ON asistencia_db.* TO 'asistencia_user'@'localhost';
FLUSH PRIVILEGES;

-- Verificar
SHOW DATABASES;
SELECT user FROM mysql.user WHERE user = 'asistencia_user';

-- Salir
EXIT;
```

### 1.3 Probar Conexión

```bash
mysql -u asistencia_user -p asistencia_db
# Ingresa: Password123!
# Si conecta, escribe: EXIT;
```

✅ **Checkpoint**: Base de datos creada y usuario configurado

---

## PASO 2: CREAR PROYECTO NEXT.JS

### 2.1 Crear proyecto

```bash
npx create-next-app@latest sistema-asistencia
```

Responde a las preguntas:
```
✔ Would you like to use TypeScript? … Yes
✔ Would you like to use ESLint? … Yes
✔ Would you like to use Tailwind CSS? … Yes
✔ Would you like to use `src/` directory? … Yes
✔ Would you like to use App Router? … Yes
✔ Would you like to customize the default import alias (@/*)? … No
```

### 2.2 Entrar al proyecto

```bash
cd sistema-asistencia
```

✅ **Checkpoint**: Proyecto Next.js creado

---

## PASO 3: INSTALAR DEPENDENCIAS

### 3.1 Dependencias de producción

```bash
npm install @prisma/client \
  prisma \
  xlsx \
  jspdf \
  jspdf-autotable \
  date-fns \
  zod \
  @tanstack/react-query \
  clsx \
  tailwind-merge \
  lucide-react \
  class-variance-authority
```

### 3.2 Dependencias de desarrollo

```bash
npm install -D \
  @types/node \
  ts-node \
  @types/jest \
  jest \
  @testing-library/react \
  @testing-library/jest-dom
```

### 3.3 Verificar instalación

```bash
npm list --depth=0
```

✅ **Checkpoint**: Todas las dependencias instaladas

---

## PASO 4: CONFIGURAR PRISMA

### 4.1 Inicializar Prisma

```bash
npx prisma init
```

Esto crea:
- `prisma/schema.prisma`
- `.env`

### 4.2 Configurar `.env`

Abre `.env` y reemplaza todo con:

```env
# Base de Datos
DATABASE_URL="mysql://asistencia_user:Password123!@localhost:3306/asistencia_db"

# Aplicación
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=".xls,.xlsx"

# PDF
PDF_OUTPUT_DIR="./public/informes"
DEFAULT_WORK_HOURS=8
TIMEZONE="America/Argentina/Buenos_Aires"
```

### 4.3 Configurar `prisma/schema.prisma`

Reemplaza todo el contenido con:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ============================================
// MODELO: Empleado
// ============================================
model Empleado {
  id              Int       @id @default(autoincrement())
  numeroAC        String    @unique @db.VarChar(20) @map("numero_ac")
  numeroEmpleado  String?   @db.VarChar(10) @map("numero_empleado")
  nombre          String    @db.VarChar(255)
  departamento    String?   @db.VarChar(100)
  activo          Boolean   @default(true)
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  asistencias     AsistenciaDiaria[]
  resumenMensual  ResumenMensual[]
  informes        Informe[]

  @@index([numeroAC])
  @@map("empleados")
}

// ============================================
// MODELO: Importación
// ============================================
model Importacion {
  id                  Int       @id @default(autoincrement())
  nombreArchivo       String    @db.VarChar(255) @map("nombre_archivo")
  tipoArchivo         TipoArchivo @map("tipo_archivo")
  fechaInicio         DateTime  @db.Date @map("fecha_inicio")
  fechaFin            DateTime  @db.Date @map("fecha_fin")
  totalRegistros      Int       @map("total_registros")
  registrosValidos    Int       @map("registros_validos")
  registrosInvalidos  Int       @map("registros_invalidos")
  usuario             String?   @db.VarChar(100)
  createdAt           DateTime  @default(now()) @map("created_at")

  marcaciones         MarcacionRaw[]

  @@index([fechaInicio, fechaFin])
  @@map("importaciones")
}

enum TipoArchivo {
  marcaciones
  invalidos

  @@map("tipo_archivo")
}

// ============================================
// MODELO: Marcación Raw
// ============================================
model MarcacionRaw {
  id            Int       @id @default(autoincrement())
  numeroAC      String    @db.VarChar(20) @map("numero_ac")
  nombre        String    @db.VarChar(255)
  fechaHora     DateTime  @map("fecha_hora")
  estado        EstadoMarcacion
  excepcion     ExcepcionMarcacion @default(FOT)
  nuevoEstado   String?   @db.VarChar(50) @map("nuevo_estado")
  operacion     String?   @db.VarChar(50)
  importacionId Int       @map("importacion_id")
  createdAt     DateTime  @default(now()) @map("created_at")

  importacion   Importacion @relation(fields: [importacionId], references: [id], onDelete: Cascade)

  @@index([numeroAC, fechaHora])
  @@index([importacionId])
  @@map("marcaciones_raw")
}

enum EstadoMarcacion {
  Entrada
  Salida

  @@map("estado_marcacion")
}

enum ExcepcionMarcacion {
  FOT
  Invalido
  Repetido

  @@map("excepcion_marcacion")
}

// ============================================
// MODELO: Asistencia Diaria
// ============================================
model AsistenciaDiaria {
  id                Int       @id @default(autoincrement())
  empleadoId        Int       @map("empleado_id")
  fecha             DateTime  @db.Date
  entrada1          DateTime? @db.Time @map("entrada_1")
  salida1           DateTime? @db.Time @map("salida_1")
  entrada2          DateTime? @db.Time @map("entrada_2")
  salida2           DateTime? @db.Time @map("salida_2")
  entrada3          DateTime? @db.Time @map("entrada_3")
  salida3           DateTime? @db.Time @map("salida_3")
  horasTrabajadas   Decimal   @default(0) @db.Decimal(5, 2) @map("horas_trabajadas")
  tieneErrores      Boolean   @default(false) @map("tiene_errores")
  tipoError         String?   @db.VarChar(100) @map("tipo_error")
  observaciones     String?   @db.Text
  marcacionesRaw    String?   @db.Text @map("marcaciones_raw")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  empleado          Empleado  @relation(fields: [empleadoId], references: [id], onDelete: Cascade)

  @@unique([empleadoId, fecha], name: "unique_empleado_fecha")
  @@index([fecha])
  @@index([empleadoId, fecha])
  @@map("asistencia_diaria")
}

// ============================================
// MODELO: Resumen Mensual
// ============================================
model ResumenMensual {
  id              Int       @id @default(autoincrement())
  empleadoId      Int       @map("empleado_id")
  año             Int
  mes             Int
  diasTrabajados  Int       @default(0) @map("dias_trabajados")
  totalHoras      Decimal   @default(0) @db.Decimal(7, 2) @map("total_horas")
  diasConErrores  Int       @default(0) @map("dias_con_errores")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  empleado        Empleado  @relation(fields: [empleadoId], references: [id], onDelete: Cascade)

  @@unique([empleadoId, año, mes], name: "unique_empleado_periodo")
  @@index([año, mes])
  @@map("resumen_mensual")
}

// ============================================
// MODELO: Informe
// ============================================
model Informe {
  id                  Int         @id @default(autoincrement())
  empleadoId          Int         @map("empleado_id")
  tipoInforme         TipoInforme @map("tipo_informe")
  fechaInicio         DateTime    @db.Date @map("fecha_inicio")
  fechaFin            DateTime    @db.Date @map("fecha_fin")
  archivoPath         String?     @db.VarChar(500) @map("archivo_path")
  totalDiasTrabajados Int?        @map("total_dias_trabajados")
  totalHoras          Decimal?    @db.Decimal(7, 2) @map("total_horas")
  createdAt           DateTime    @default(now()) @map("created_at")

  empleado            Empleado    @relation(fields: [empleadoId], references: [id], onDelete: Cascade)

  @@index([empleadoId, fechaInicio, fechaFin])
  @@map("informes")
}

enum TipoInforme {
  tolerante
  estricto

  @@map("tipo_informe")
}
```

### 4.4 Generar Prisma Client y crear tablas

```bash
npx prisma generate
npx prisma db push
```

### 4.5 Verificar tablas creadas

```bash
mysql -u asistencia_user -p asistencia_db -e "SHOW TABLES;"
```

Deberías ver 6 tablas:
- asistencia_diaria
- empleados
- importaciones
- informes
- marcaciones_raw
- resumen_mensual

✅ **Checkpoint**: Base de datos configurada con Prisma

---

## PASO 5: CREAR ESTRUCTURA DE CARPETAS

```bash
# Crear estructura completa
mkdir -p src/lib/{asistencia,excel,pdf,utils}
mkdir -p src/types
mkdir -p src/components/{ui,empleados,asistencia,importacion,informes}
mkdir -p src/app/{empleados,importar,informes,api/{importar,empleados,informes,estadisticas}}
mkdir -p public/informes
mkdir -p temp/uploads

# Crear archivos vacíos necesarios
touch src/lib/prisma.ts
touch src/lib/utils.ts
```

Estructura final:
```
sistema-asistencia/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── empleados/
│   │   │   └── page.tsx
│   │   ├── importar/
│   │   │   └── page.tsx
│   │   ├── informes/
│   │   │   └── page.tsx
│   │   └── api/
│   │       ├── importar/route.ts
│   │       ├── empleados/route.ts
│   │       ├── informes/route.ts
│   │       └── estadisticas/route.ts
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── utils.ts
│   │   ├── asistencia/
│   │   ├── excel/
│   │   └── pdf/
│   ├── types/
│   └── components/
├── prisma/
│   └── schema.prisma
├── public/
│   └── informes/
└── temp/
    └── uploads/
```

✅ **Checkpoint**: Estructura de carpetas creada

---

## PASO 6: ARCHIVOS DE CONFIGURACIÓN

### 6.1 `next.config.js`

Crea `next.config.js` en la raíz:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig
```

### 6.2 `tsconfig.json`

Reemplaza contenido de `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 6.3 `tailwind.config.ts`

Reemplaza contenido de `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
```

### 6.4 Instalar plugin de Tailwind

```bash
npm install tailwindcss-animate
```

### 6.5 `src/app/globals.css`

Reemplaza contenido de `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### 6.6 `.gitignore`

Agrega al final de `.gitignore`:

```
# Uploads y temporales
/temp
/public/informes/*.pdf

# Backups
/backups

# IDE
.vscode
.idea
*.swp
*.swo
```

✅ **Checkpoint**: Configuraciones básicas completadas

---

## PASO 7: TIPOS TYPESCRIPT

### 7.1 `src/types/marcacion.ts`

```typescript
export interface MarcacionExcel {
  'Nº AC.': string;
  'Nº': string;
  'Nombre': string;
  'Tiempo': string;
  'Estado': 'Entrada' | 'Salida';
  'Nuevo Estado'?: string;
  'Excepción'?: 'FOT' | 'Invalido' | 'Repetido';
  'Operación'?: string;
}

export interface MarcacionNormalizada {
  numeroAC: string;
  numeroEmpleado: string;
  nombre: string;
  fechaHora: Date;
  estado: 'Entrada' | 'Salida';
  excepcion: 'FOT' | 'Invalido' | 'Repetido';
  nuevoEstado?: string;
  operacion?: string;
}

export interface ParMarcacion {
  entrada: Date | null;
  salida: Date | null;
  horas: number;
  completo: boolean;
}

export interface ErrorMarcacion {
  tipo: 'entrada_sin_salida' | 'salida_sin_entrada' | 'repetido' | 'invalido' | 'secuencia_incorrecta';
  descripcion: string;
  hora: string;
  marcacion?: MarcacionNormalizada;
}

export interface AsistenciaDia {
  fecha: Date;
  pares: ParMarcacion[];
  horasTrabajadas: number;
  tieneErrores: boolean;
  errores: ErrorMarcacion[];
  observaciones: string;
}
```

### 7.2 `src/types/empleado.ts`

```typescript
export interface Empleado {
  id: number;
  numeroAC: string;
  numeroEmpleado?: string;
  nombre: string;
  departamento?: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmpleadoConEstadisticas extends Empleado {
  totalDiasTrabajados: number;
  totalHoras: number;
  diasConErrores: number;
}
```

### 7.3 `src/types/informe.ts`

```typescript
export interface Informe {
  id: number;
  empleadoId: number;
  tipoInforme: 'tolerante' | 'estricto';
  fechaInicio: Date;
  fechaFin: Date;
  archivoPath?: string;
  totalDiasTrabajados?: number;
  totalHoras?: number;
  createdAt: Date;
}

export interface GenerarInformeParams {
  empleadoId: number;
  fechaInicio: Date;
  fechaFin: Date;
  modo: 'tolerante' | 'estricto';
}
```

✅ **Checkpoint**: Tipos TypeScript definidos

---

## PASO 8: UTILIDADES

### 8.1 `src/lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

### 8.2 `src/lib/utils.ts`

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatearFecha(fecha: Date | string): string {
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha
  return format(d, 'dd/MM/yyyy')
}

export function formatearHora(hora: Date | string): string {
  const h = typeof hora === 'string' ? new Date(hora) : hora
  return format(h, 'HH:mm')
}

export function formatearHorasDecimal(horas: number): string {
  return horas.toFixed(2)
}

export function parsearFechaExcel(fechaString: string): Date | null {
  try {
    // Formato esperado: "14/5/2025 08:04" o "14/05/2025 08:04"
    const [fecha, hora] = fechaString.split(' ')
    const [dia, mes, año] = fecha.split('/')
    const [hh, mm] = hora.split(':')
    
    return new Date(
      parseInt(año),
      parseInt(mes) - 1,
      parseInt(dia),
      parseInt(hh),
      parseInt(mm)
    )
  } catch (error) {
    console.error('Error parseando fecha:', fechaString, error)
    return null
  }
}
```

✅ **Checkpoint**: Utilidades creadas

---

## PASO 9: LÓGICA DE EXCEL

### 9.1 `src/lib/excel/lector.ts`

```typescript
import * as XLSX from 'xlsx'
import { MarcacionExcel } from '@/types/marcacion'

export async function leerExcelMarcaciones(
  archivo: File
): Promise<MarcacionExcel[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        
        const json = XLSX.utils.sheet_to_json<MarcacionExcel>(sheet)
        
        resolve(json)
      } catch (error) {
        reject(new Error('Error al leer el archivo Excel: ' + (error as Error).message))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'))
    }
    
    reader.readAsBinaryString(archivo)
  })
}

export function validarEstructuraExcel(data: any[]): boolean {
  if (!data || data.length === 0) {
    throw new Error('El archivo Excel está vacío')
  }
  
  const primeraFila = data[0]
  const columnasRequeridas = ['Nº AC.', 'Nombre', 'Tiempo', 'Estado']
  
  for (const columna of columnasRequeridas) {
    if (!(columna in primeraFila)) {
      throw new Error(`Falta la columna requerida: ${columna}`)
    }
  }
  
  return true
}
```

### 9.2 `src/lib/excel/normalizador.ts`

```typescript
import { format } from 'date-fns'
import { MarcacionExcel, MarcacionNormalizada } from '@/types/marcacion'
import { parsearFechaExcel } from '@/lib/utils'

export function normalizarMarcacion(
  row: MarcacionExcel
): MarcacionNormalizada | null {
  try {
    const fechaHora = parsearFechaExcel(row['Tiempo'])
    
    if (!fechaHora) {
      console.warn('Fecha inválida:', row['Tiempo'])
      return null
    }
    
    return {
      numeroAC: String(row['Nº AC.']).trim(),
      numeroEmpleado: String(row['Nº'] || '').trim(),
      nombre: row['Nombre'].trim(),
      fechaHora,
      estado: row['Estado'],
      excepcion: row['Excepción'] || 'FOT',
      nuevoEstado: row['Nuevo Estado'],
      operacion: row['Operación']
    }
  } catch (error) {
    console.error('Error al normalizar marcación:', error, row)
    return null
  }
}

export function agruparPorEmpleado(
  marcaciones: MarcacionNormalizada[]
): Map<string, MarcacionNormalizada[]> {
  const grupos = new Map<string, MarcacionNormalizada[]>()
  
  for (const marcacion of marcaciones) {
    const key = marcacion.numeroAC
    
    if (!grupos.has(key)) {
      grupos.set(key, [])
    }
    
    grupos.get(key)!.push(marcacion)
  }
  
  return grupos
}

export function agruparPorFecha(
  marcaciones: MarcacionNormalizada[]
): Map<string, MarcacionNormalizada[]> {
  const grupos = new Map<string, MarcacionNormalizada[]>()
  
  for (const marcacion of marcaciones) {
    const key = format(marcacion.fechaHora, 'yyyy-MM-dd')
    
    if (!grupos.has(key)) {
      grupos.set(key, [])
    }
    
    grupos.get(key)!.push(marcacion)
  }
  
  return grupos
}
```

✅ **Checkpoint**: Lógica de Excel implementada

---

## PASO 10: MOTOR DE ASISTENCIA

### 10.1 `src/lib/asistencia/deteccion-errores.ts`

```typescript
import { format } from 'date-fns'
import { MarcacionNormalizada, ErrorMarcacion } from '@/types/marcacion'

export function detectarErroresDia(
  marcaciones: MarcacionNormalizada[]
): ErrorMarcacion[] {
  const errores: ErrorMarcacion[] = []
  
  // 1. Filtrar y reportar marcas inválidas
  const invalidas = marcaciones.filter(m => m.excepcion === 'Invalido')
  for (const m of invalidas) {
    errores.push({
      tipo: 'invalido',
      descripcion: 'Marcación marcada como inválida por el sistema del reloj',
      hora: format(m.fechaHora, 'HH:mm'),
      marcacion: m
    })
  }
  
  // 2. Filtrar y reportar marcas repetidas
  const repetidas = marcaciones.filter(m => m.excepcion === 'Repetido')
  for (const m of repetidas) {
    errores.push({
      tipo: 'repetido',
      descripcion: 'Marcación repetida',
      hora: format(m.fechaHora, 'HH:mm'),
      marcacion: m
    })
  }
  
  // 3. Trabajar solo con marcaciones válidas (FOT)
  const marcasValidas = marcaciones
    .filter(m => m.excepcion === 'FOT')
    .sort((a, b) => a.fechaHora.getTime() - b.fechaHora.getTime())
  
  // 4. Verificar secuencia Entrada-Salida
  let esperaSalida = false
  let ultimaEntrada: MarcacionNormalizada | null = null
  
  for (const marca of marcasValidas) {
    if (marca.estado === 'Entrada') {
      if (esperaSalida && ultimaEntrada) {
        errores.push({
          tipo: 'entrada_sin_salida',
          descripcion: `Entrada a las ${format(ultimaEntrada.fechaHora, 'HH:mm')} sin salida correspondiente`,
          hora: format(ultimaEntrada.fechaHora, 'HH:mm'),
          marcacion: ultimaEntrada
        })
      }
      esperaSalida = true
      ultimaEntrada = marca
    } else {
      if (!esperaSalida) {
        errores.push({
          tipo: 'salida_sin_entrada',
          descripcion: 'Salida sin entrada previa',
          hora: format(marca.fechaHora, 'HH:mm'),
          marcacion: marca
        })
      }
      esperaSalida = false
      ultimaEntrada = null
    }
  }
  
  // 5. Si quedó una entrada sin cerrar
  if (esperaSalida && ultimaEntrada) {
    errores.push({
      tipo: 'entrada_sin_salida',
      descripcion: `Última entrada a las ${format(ultimaEntrada.fechaHora, 'HH:mm')} sin salida`,
      hora: format(ultimaEntrada.fechaHora, 'HH:mm'),
      marcacion: ultimaEntrada
    })
  }
  
  return errores
}
```

### 10.2 `src/lib/asistencia/armado-pares.ts`

```typescript
import { MarcacionNormalizada, ParMarcacion } from '@/types/marcacion'

export function armarParesEntradaSalida(
  marcaciones: MarcacionNormalizada[]
): ParMarcacion[] {
  const pares: ParMarcacion[] = []
  
  const marcasValidas = marcaciones
    .filter(m => m.excepcion === 'FOT')
    .sort((a, b) => a.fechaHora.getTime() - b.fechaHora.getTime())
  
  let entradaActual: Date | null = null
  
  for (const marca of marcasValidas) {
    if (marca.estado === 'Entrada') {
      if (entradaActual !== null) {
        pares.push({
          entrada: entradaActual,
          salida: null,
          horas: 0,
          completo: false
        })
      }
      entradaActual = marca.fechaHora
    } else {
      if (entradaActual !== null) {
        const horas = calcularDiferenciaHoras(entradaActual, marca.fechaHora)
        pares.push({
          entrada: entradaActual,
          salida: marca.fechaHora,
          horas,
          completo: true
        })
        entradaActual = null
      } else {
        pares.push({
          entrada: null,
          salida: marca.fechaHora,
          horas: 0,
          completo: false
        })
      }
    }
  }
  
  if (entradaActual !== null) {
    pares.push({
      entrada: entradaActual,
      salida: null,
      horas: 0,
      completo: false
    })
  }
  
  return pares
}

function calcularDiferenciaHoras(entrada: Date, salida: Date): number {
  let diff = salida.getTime() - entrada.getTime()
  
  if (diff < 0) {
    diff += 24 * 60 * 60 * 1000
  }
  
  const horas = diff / (1000 * 60 * 60)
  return Math.round(horas * 100) / 100
}
```

### 10.3 `src/lib/asistencia/calculo-horas.ts`

```typescript
import { ParMarcacion, ErrorMarcacion } from '@/types/marcacion'

export function calcularHorasDia(
  pares: ParMarcacion[],
  modo: 'tolerante' | 'estricto',
  errores: ErrorMarcacion[]
): number {
  
  if (modo === 'estricto' && errores.length > 0) {
    return 0
  }
  
  let totalHoras = 0
  
  for (const par of pares) {
    if (par.completo) {
      totalHoras += par.horas
    } else if (modo === 'tolerante') {
      if (par.entrada !== null && par.salida === null) {
        totalHoras += 8
      } else if (par.entrada === null && par.salida !== null) {
        totalHoras += 8
      }
    }
  }
  
  return Math.round(totalHoras * 100) / 100
}
```

### 10.4 `src/lib/asistencia/motor-calculo.ts`

```typescript
import { format, startOfDay, parse } from 'date-fns'
import { prisma } from '@/lib/prisma'
import { MarcacionNormalizada, AsistenciaDia } from '@/types/marcacion'
import { agruparPorFecha } from '@/lib/excel/normalizador'
import { detectarErroresDia } from './deteccion-errores'
import { armarParesEntradaSalida } from './armado-pares'
import { calcularHorasDia } from './calculo-horas'

export async function procesarAsistenciaEmpleado(
  empleadoId: number,
  numeroAC: string,
  marcaciones: MarcacionNormalizada[],
  modo: 'tolerante' | 'estricto' = 'tolerante'
): Promise<AsistenciaDia[]> {
  
  const porFecha = agruparPorFecha(marcaciones)
  const resultados: AsistenciaDia[] = []
  
  for (const [fechaStr, marcasDia] of porFecha.entries()) {
    const errores = detectarErroresDia(marcasDia)
    const pares = armarParesEntradaSalida(marcasDia)
    const horas = calcularHorasDia(pares, modo, errores)
    
    let observaciones = ''
    if (errores.length > 0) {
      observaciones = errores.map(e => e.descripcion).join('; ')
    }
    
    const asistencia: AsistenciaDia = {
      fecha: parse(fechaStr, 'yyyy-MM-dd', new Date()),
      pares,
      horasTrabajadas: horas,
      tieneErrores: errores.length > 0,
      errores,
      observaciones
    }
    
    resultados.push(asistencia)
    await guardarAsistenciaDiaria(empleadoId, asistencia)
  }
  
  await actualizarResumenMensual(empleadoId, resultados)
  
  return resultados
}

async function guardarAsistenciaDiaria(
  empleadoId: number,
  asistencia: AsistenciaDia
): Promise<void> {
  const pares = asistencia.pares
  
  await prisma.asistenciaDiaria.upsert({
    where: {
      unique_empleado_fecha: {
        empleadoId,
        fecha: startOfDay(asistencia.fecha)
      }
    },
    create: {
      empleadoId,
      fecha: startOfDay(asistencia.fecha),
      entrada1: pares[0]?.entrada || null,
      salida1: pares[0]?.salida || null,
      entrada2: pares[1]?.entrada || null,
      salida2: pares[1]?.salida || null,
      entrada3: pares[2]?.entrada || null,
      salida3: pares[2]?.salida || null,
      horasTrabajadas: asistencia.horasTrabajadas,
      tieneErrores: asistencia.tieneErrores,
      tipoError: asistencia.errores.map(e => e.tipo).join(', '),
      observaciones: asistencia.observaciones,
      marcacionesRaw: JSON.stringify(pares)
    },
    update: {
      entrada1: pares[0]?.entrada || null,
      salida1: pares[0]?.salida || null,
      entrada2: pares[1]?.entrada || null,
      salida2: pares[1]?.salida || null,
      entrada3: pares[2]?.entrada || null,
      salida3: pares[2]?.salida || null,
      horasTrabajadas: asistencia.horasTrabajadas,
      tieneErrores: asistencia.tieneErrores,
      tipoError: asistencia.errores.map(e => e.tipo).join(', '),
      observaciones: asistencia.observaciones,
      marcacionesRaw: JSON.stringify(pares)
    }
  })
}

async function actualizarResumenMensual(
  empleadoId: number,
  asistencias: AsistenciaDia[]
): Promise<void> {
  const porMes = new Map<string, AsistenciaDia[]>()
  
  for (const asistencia of asistencias) {
    const key = format(asistencia.fecha, 'yyyy-MM')
    if (!porMes.has(key)) {
      porMes.set(key, [])
    }
    porMes.get(key)!.push(asistencia)
  }
  
  for (const [mesStr, dias] of porMes.entries()) {
    const [año, mes] = mesStr.split('-').map(Number)
    
    const diasTrabajados = dias.filter(d => d.horasTrabajadas > 0).length
    const totalHoras = dias.reduce((sum, d) => sum + d.horasTrabajadas, 0)
    const diasConErrores = dias.filter(d => d.tieneErrores).length
    
    await prisma.resumenMensual.upsert({
      where: {
        unique_empleado_periodo: {
          empleadoId,
          año,
          mes
        }
      },
      create: {
        empleadoId,
        año,
        mes,
        diasTrabajados,
        totalHoras,
        diasConErrores
      },
      update: {
        diasTrabajados,
        totalHoras,
        diasConErrores
      }
    })
  }
}
```

✅ **Checkpoint**: Motor de asistencia completo

---

## PASO 11: GENERADOR DE PDFs

### 11.1 `src/lib/pdf/generador-informes.ts`

```typescript
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { prisma } from '@/lib/prisma'
import { formatearFecha, formatearHora } from '@/lib/utils'
import { startOfDay } from 'date-fns'

interface GenerarInformeOptions {
  empleadoId: number
  fechaInicio: Date
  fechaFin: Date
  modo: 'tolerante' | 'estricto'
}

export async function generarInformePDF(
  options: GenerarInformeOptions
): Promise<{ buffer: ArrayBuffer; nombreArchivo: string }> {
  const { empleadoId, fechaInicio, fechaFin, modo } = options
  
  const empleado = await prisma.empleado.findUnique({
    where: { id: empleadoId }
  })
  
  if (!empleado) {
    throw new Error('Empleado no encontrado')
  }
  
  const asistencias = await prisma.asistenciaDiaria.findMany({
    where: {
      empleadoId,
      fecha: {
        gte: startOfDay(fechaInicio),
        lte: startOfDay(fechaFin)
      }
    },
    orderBy: { fecha: 'asc' }
  })
  
  let asistenciasFiltradas = asistencias
  if (modo === 'estricto') {
    asistenciasFiltradas = asistencias.map(a => {
      if (a.tieneErrores) {
        return { ...a, horasTrabajadas: 0 }
      }
      return a
    })
  }
  
  const diasTrabajados = asistenciasFiltradas.filter(a => 
    modo === 'estricto' ? !a.tieneErrores : Number(a.horasTrabajadas) > 0
  ).length
  
  const totalHoras = asistenciasFiltradas.reduce((sum, a) => 
    sum + (modo === 'estricto' && a.tieneErrores ? 0 : Number(a.horasTrabajadas)), 
    0
  )
  
  const doc = new jsPDF()
  
  // Encabezado
  doc.setFontSize(16)
  doc.text('INFORME DE ASISTENCIA', 105, 20, { align: 'center' })
  doc.setFontSize(12)
  doc.text(`Modo: ${modo === 'tolerante' ? 'TOLERANTE' : 'ESTRICTO'}`, 105, 28, { align: 'center' })
  
  doc.setFontSize(10)
  doc.text(`Empleado: ${empleado.nombre}`, 20, 40)
  doc.text(`Legajo: ${empleado.numeroAC}`, 20, 46)
  doc.text(`Período: ${formatearFecha(fechaInicio)} - ${formatearFecha(fechaFin)}`, 20, 52)
  
  // Tabla
  const tableData = asistenciasFiltradas.map(a => {
    const fila = [
      formatearFecha(a.fecha),
      a.entrada1 ? formatearHora(a.entrada1) : '-',
      a.salida1 ? formatearHora(a.salida1) : '-',
      a.entrada2 ? formatearHora(a.entrada2) : '-',
      a.salida2 ? formatearHora(a.salida2) : '-',
      a.entrada3 ? formatearHora(a.entrada3) : '-',
      a.salida3 ? formatearHora(a.salida3) : '-',
      (modo === 'estricto' && a.tieneErrores ? '0.00' : Number(a.horasTrabajadas).toFixed(2))
    ]
    
    if (modo === 'estricto') {
      fila.push(a.tieneErrores ? (a.tipoError || 'Error') : 'OK')
    }
    
    return fila
  })
  
  const headers = modo === 'estricto' 
    ? ['Fecha', 'E1', 'S1', 'E2', 'S2', 'E3', 'S3', 'Horas', 'Observaciones']
    : ['Fecha', 'E1', 'S1', 'E2', 'S2', 'E3', 'S3', 'Horas']
  
  autoTable(doc, {
    startY: 60,
    head: [headers],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 25 },
      7: { halign: 'right' }
    }
  })
  
  const finalY = (doc as any).lastAutoTable.finalY + 10
  doc.setFontSize(11)
  doc.setFont(undefined, 'bold')
  doc.text(`TOTAL DÍAS TRABAJADOS: ${diasTrabajados}`, 20, finalY)
  doc.text(`TOTAL HORAS: ${totalHoras.toFixed(2)}`, 20, finalY + 6)
  
  doc.setFontSize(8)
  doc.setFont(undefined, 'normal')
  doc.text(
    `Generado: ${new Date().toLocaleString('es-AR')}`,
    105,
    doc.internal.pageSize.height - 10,
    { align: 'center' }
  )
  
  const nombreArchivo = `informe_${empleado.numeroAC}_${formatearFecha(fechaInicio)}_${modo}.pdf`
  
  await prisma.informe.create({
    data: {
      empleadoId,
      tipoInforme: modo,
      fechaInicio: startOfDay(fechaInicio),
      fechaFin: startOfDay(fechaFin),
      archivoPath: `/informes/${nombreArchivo}`,
      totalDiasTrabajados: diasTrabajados,
      totalHoras
    }
  })
  
  return {
    buffer: doc.output('arraybuffer'),
    nombreArchivo
  }
}
```

✅ **Checkpoint**: Generador de PDFs implementado

---

## PASO 12: API ROUTES

### 12.1 `src/app/api/importar/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { leerExcelMarcaciones, validarEstructuraExcel } from '@/lib/excel/lector'
import { normalizarMarcacion, agruparPorEmpleado } from '@/lib/excel/normalizador'
import { procesarAsistenciaEmpleado } from '@/lib/asistencia/motor-calculo'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const archivoMarcaciones = formData.get('archivoMarcaciones') as File
    const fechaInicio = new Date(formData.get('fechaInicio') as string)
    const fechaFin = new Date(formData.get('fechaFin') as string)
    
    if (!archivoMarcaciones) {
      return NextResponse.json(
        { error: 'Archivo de marcaciones requerido' },
        { status: 400 }
      )
    }
    
    const datosExcel = await leerExcelMarcaciones(archivoMarcaciones)
    validarEstructuraExcel(datosExcel)
    
    const marcaciones = datosExcel
      .map(normalizarMarcacion)
      .filter((m): m is NonNullable<typeof m> => m !== null)
    
    const importacion = await prisma.importacion.create({
      data: {
        nombreArchivo: archivoMarcaciones.name,
        tipoArchivo: 'marcaciones',
        fechaInicio,
        fechaFin,
        totalRegistros: marcaciones.length,
        registrosValidos: marcaciones.filter(m => m.excepcion === 'FOT').length,
        registrosInvalidos: marcaciones.filter(m => m.excepcion !== 'FOT').length
      }
    })
    
    await prisma.marcacionRaw.createMany({
      data: marcaciones.map(m => ({
        numeroAC: m.numeroAC,
        nombre: m.nombre,
        fechaHora: m.fechaHora,
        estado: m.estado,
        excepcion: m.excepcion,
        nuevoEstado: m.nuevoEstado,
        operacion: m.operacion,
        importacionId: importacion.id
      }))
    })
    
    const porEmpleado = agruparPorEmpleado(marcaciones)
    
    for (const [numeroAC, marcasEmpleado] of porEmpleado.entries()) {
      const empleado = await prisma.empleado.upsert({
        where: { numeroAC },
        create: {
          numeroAC,
          numeroEmpleado: marcasEmpleado[0].numeroEmpleado,
          nombre: marcasEmpleado[0].nombre
        },
        update: {
          nombre: marcasEmpleado[0].nombre
        }
      })
      
      await procesarAsistenciaEmpleado(
        empleado.id,
        numeroAC,
        marcasEmpleado
      )
    }
    
    return NextResponse.json({
      success: true,
      importacion,
      mensaje: `Se procesaron ${marcaciones.length} marcaciones de ${porEmpleado.size} empleados`
    })
    
  } catch (error) {
    console.error('Error en importación:', error)
    return NextResponse.json(
      { error: (error as Error).message || 'Error al importar marcaciones' },
      { status: 500 }
    )
  }
}
```

### 12.2 `src/app/api/empleados/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const empleados = await prisma.empleado.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' }
    })
    
    return NextResponse.json(empleados)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener empleados' },
      { status: 500 }
    )
  }
}
```

### 12.3 `src/app/api/informes/generar/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { generarInformePDF } from '@/lib/pdf/generador-informes'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { empleadoId, fechaInicio, fechaFin, modo } = body
    
    const resultado = await generarInformePDF({
      empleadoId: parseInt(empleadoId),
      fechaInicio: new Date(fechaInicio),
      fechaFin: new Date(fechaFin),
      modo
    })
    
    const filePath = join(process.cwd(), 'public', 'informes', resultado.nombreArchivo)
    await writeFile(filePath, Buffer.from(resultado.buffer))
    
    return NextResponse.json({
      success: true,
      url: `/informes/${resultado.nombreArchivo}`,
      nombreArchivo: resultado.nombreArchivo
    })
    
  } catch (error) {
    console.error('Error generando informe:', error)
    return NextResponse.json(
      { error: (error as Error).message || 'Error al generar informe' },
      { status: 500 }
    )
  }
}
```

### 12.4 `src/app/api/estadisticas/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [
      totalEmpleados,
      totalMarcaciones,
      diasConErrores
    ] = await Promise.all([
      prisma.empleado.count({ where: { activo: true } }),
      prisma.marcacionRaw.count(),
      prisma.asistenciaDiaria.count({ where: { tieneErrores: true } })
    ])
    
    return NextResponse.json({
      totalEmpleados,
      totalMarcaciones,
      diasConErrores
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}
```

✅ **Checkpoint**: API Routes creadas

---

## PASO 13: COMPONENTES UI

### 13.1 Instalar shadcn/ui

```bash
npx shadcn-ui@latest init
```

Responde:
- Style: Default
- Base color: Slate
- CSS variables: Yes

```bash
npx shadcn-ui@latest add button card input label select table toast
```

### 13.2 `src/components/importacion/upload-excel.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export function UploadExcel() {
  const [archivoMarcaciones, setArchivoMarcaciones] = useState<File | null>(null)
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!archivoMarcaciones || !fechaInicio || !fechaFin) {
      alert('Por favor complete todos los campos requeridos')
      return
    }
    
    setLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('archivoMarcaciones', archivoMarcaciones)
      formData.append('fechaInicio', fechaInicio)
      formData.append('fechaFin', fechaFin)
      
      const response = await fetch('/api/importar', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al importar')
      }
      
      setResultado(data)
      alert('Importación exitosa!')
      
      setArchivoMarcaciones(null)
      setFechaInicio('')
      setFechaFin('')
      
    } catch (error) {
      console.error('Error:', error)
      alert('Error al importar: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Importar Marcaciones</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="archivo">Archivo de Marcaciones *</Label>
          <Input
            id="archivo"
            type="file"
            accept=".xls,.xlsx"
            onChange={(e) => setArchivoMarcaciones(e.target.files?.[0] || null)}
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="inicio">Fecha Inicio *</Label>
            <Input
              id="inicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="fin">Fecha Fin *</Label>
            <Input
              id="fin"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              required
            />
          </div>
        </div>
        
        <Button 
          type="submit" 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Procesando...' : 'Importar Marcaciones'}
        </Button>
      </form>
      
      {resultado && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">
            Importación Exitosa
          </h3>
          <p className="text-sm text-green-700">
            {resultado.mensaje}
          </p>
        </div>
      )}
    </Card>
  )
}
```

### 13.3 `src/components/informes/generador-pdf.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'

interface Empleado {
  id: number
  numeroAC: string
  nombre: string
}

export function GeneradorPDF() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [empleadoId, setEmpleadoId] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [modo, setModo] = useState<'tolerante' | 'estricto'>('tolerante')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/empleados')
      .then(res => res.json())
      .then(setEmpleados)
  }, [])

  const handleGenerar = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/informes/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empleadoId,
          fechaInicio,
          fechaFin,
          modo
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      window.open(data.url, '_blank')
      alert('Informe generado exitosamente!')

    } catch (error) {
      alert('Error: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Generar Informe PDF</h2>

      <form onSubmit={handleGenerar} className="space-y-4">
        <div>
          <Label htmlFor="empleado">Empleado *</Label>
          <Select value={empleadoId} onValueChange={setEmpleadoId} required>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar empleado" />
            </SelectTrigger>
            <SelectContent>
              {empleados.map(emp => (
                <SelectItem key={emp.id} value={emp.id.toString()}>
                  {emp.nombre} ({emp.numeroAC})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="inicio">Fecha Inicio *</Label>
            <Input
              id="inicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="fin">Fecha Fin *</Label>
            <Input
              id="fin"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="modo">Modo de Informe *</Label>
          <Select value={modo} onValueChange={(v: any) => setModo(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tolerante">Tolerante</SelectItem>
              <SelectItem value="estricto">Estricto</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-1">
            {modo === 'tolerante' 
              ? 'Intenta calcular horas incluso con errores' 
              : 'Solo cuenta días sin errores'}
          </p>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Generando...' : 'Generar PDF'}
        </Button>
      </form>
    </Card>
  )
}
```

✅ **Checkpoint**: Componentes UI creados

---

## PASO 14: PÁGINAS

### 14.1 `src/app/layout.tsx`

```typescript
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema de Asistencia",
  description: "Control de asistencia de empleados",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <nav className="bg-slate-800 text-white p-4">
          <div className="container mx-auto flex gap-6">
            <Link href="/" className="hover:text-slate-300">Dashboard</Link>
            <Link href="/empleados" className="hover:text-slate-300">Empleados</Link>
            <Link href="/importar" className="hover:text-slate-300">Importar</Link>
            <Link href="/informes" className="hover:text-slate-300">Informes</Link>
          </div>
        </nav>
        <main className="container mx-auto py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
```

### 14.2 `src/app/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'

export default function Home() {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetch('/api/estadisticas')
      .then(res => res.json())
      .then(setStats)
  }, [])

  if (!stats) return <div>Cargando...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Empleados Activos</h2>
          <p className="text-4xl font-bold text-blue-600">{stats.totalEmpleados}</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Total Marcaciones</h2>
          <p className="text-4xl font-bold text-green-600">{stats.totalMarcaciones}</p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Días con Errores</h2>
          <p className="text-4xl font-bold text-red-600">{stats.diasConErrores}</p>
        </Card>
      </div>
    </div>
  )
}
```

### 14.3 `src/app/empleados/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/empleados')
      .then(res => res.json())
      .then(setEmpleados)
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Empleados</h1>

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Legajo</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {empleados.map(emp => (
              <TableRow key={emp.id}>
                <TableCell>{emp.numeroAC}</TableCell>
                <TableCell>{emp.nombre}</TableCell>
                <TableCell>{emp.departamento || '-'}</TableCell>
                <TableCell>
                  <span className={emp.activo ? 'text-green-600' : 'text-red-600'}>
                    {emp.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
```

### 14.4 `src/app/importar/page.tsx`

```typescript
import { UploadExcel } from '@/components/importacion/upload-excel'

export default function ImportarPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Importar Marcaciones</h1>
      <UploadExcel />
    </div>
  )
}
```

### 14.5 `src/app/informes/page.tsx`

```typescript
import { GeneradorPDF } from '@/components/informes/generador-pdf'

export default function InformesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Generar Informes</h1>
      <GeneradorPDF />
    </div>
  )
}
```

✅ **Checkpoint**: Páginas creadas

---

## PASO 15: EJECUTAR EL SISTEMA

### 15.1 Verificar instalación

```bash
npm list --depth=0
npx prisma studio
```

### 15.2 Iniciar servidor

```bash
npm run dev
```

Abre el navegador en: **http://localhost:3000**

Deberías ver:
- ✅ Dashboard con estadísticas
- ✅ Menú de navegación funcionando
- ✅ Sin errores en consola

✅ **Checkpoint**: Sistema funcionando

---

## PASO 16: PRUEBAS

### 16.1 Crear empleado de prueba

Abre Prisma Studio:
```bash
npx prisma studio
```

1. Ve a tabla `empleados`
2. Crea un registro:
   - numeroAC: "12345678"
   - nombre: "PÉREZ, JUAN"
   - activo: true

### 16.2 Probar importación

1. Ve a http://localhost:3000/importar
2. Sube uno de tus archivos Excel de ejemplo
3. Selecciona rango de fechas
4. Click en "Importar"
5. Verifica que se procese correctamente

### 16.3 Verificar datos

En Prisma Studio, verifica:
- ✅ Tabla `marcaciones_raw` tiene datos
- ✅ Tabla `asistencia_diaria` tiene registros procesados
- ✅ Tabla `resumen_mensual` tiene totales

### 16.4 Generar informe

1. Ve a http://localhost:3000/informes
2. Selecciona el empleado
3. Selecciona rango de fechas
4. Elige modo (tolerante o estricto)
5. Click en "Generar PDF"
6. Verifica que se descargue el PDF

✅ **Checkpoint**: Pruebas completadas

---

## TROUBLESHOOTING

### Error: "Can't connect to MySQL"

```bash
# Verificar MySQL
sudo systemctl status mysql  # Linux
brew services list           # Mac

# Reiniciar
sudo systemctl restart mysql # Linux
brew services restart mysql  # Mac

# Verificar conexión
mysql -u asistencia_user -p asistencia_db
```

### Error: "Prisma Client not generated"

```bash
npx prisma generate
```

### Error: "Module not found"

```bash
rm -rf node_modules package-lock.json
npm install
```

### Error al leer Excel

- Verifica que el archivo sea .xls o .xlsx
- Verifica que tenga las columnas correctas
- Intenta con un archivo más pequeño primero

### PDFs no se generan

```bash
# Crear directorio si no existe
mkdir -p public/informes

# Verificar permisos
chmod 755 public/informes
```

### Puerto 3000 ocupado

```bash
# Usar otro puerto
npm run dev -- -p 3001
```

### Ver logs detallados

```bash
# En .env, agregar:
PRISMA_DEBUG=true
LOG_LEVEL=debug

# Reiniciar servidor
npm run dev
```

---

## ✅ CHECKLIST FINAL

Verifica que todo funcione:

- [ ] MySQL corriendo y base de datos creada
- [ ] Proyecto Next.js instalado y configurado
- [ ] Prisma conectado y tablas creadas
- [ ] Servidor corriendo en http://localhost:3000
- [ ] Dashboard muestra estadísticas
- [ ] Puede listar empleados
- [ ] Puede importar archivo Excel
- [ ] Datos se procesan y guardan correctamente
- [ ] Puede generar informe PDF
- [ ] PDF se descarga correctamente

---

## 🎉 ¡FELICITACIONES!

Si completaste todos los pasos, ahora tienes un sistema completo y funcional de control de asistencia.

**Tiempo total: 2-3 horas**

**Próximos pasos sugeridos:**

1. Agregar autenticación de usuarios
2. Implementar edición manual de marcaciones
3. Agregar más gráficos y estadísticas
4. Implementar notificaciones por email
5. Exportar datos a Excel
6. Agregar respaldos automáticos
7. Implementar roles y permisos
8. Mejorar UI/UX con más componentes

---

## 📚 RECURSOS ADICIONALES

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

**Creado para:** Gobierno de San Juan, Argentina  
**Desarrollado por:** [Tu nombre]  
**Fecha:** Noviembre 2025  
**Versión:** 1.0.0
