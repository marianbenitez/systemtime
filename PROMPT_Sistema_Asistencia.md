# PROMPT: Sistema de Control de Asistencia - Next.js + MySQL

## Contexto General

Necesito que desarrolles un sistema completo de control de asistencia de empleados que procese marcaciones de relojes biométricos, calcule automáticamente horas trabajadas y genere informes en PDF. El sistema debe ser robusto, escalable y fácil de usar.

## Stack Tecnológico Requerido

- **Frontend**: Next.js 14+ (App Router)
- **Backend**: Next.js API Routes
- **Base de Datos**: MySQL 8.0+
- **ORM**: Prisma
- **Lenguaje**: TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Manejo de Excel**: SheetJS (xlsx)
- **Generación de PDF**: jsPDF o PDFKit
- **Manejo de Fechas**: date-fns
- **Validación**: Zod

## Arquitectura del Sistema

### Flujo de Datos

```
[Excel del Reloj] 
    ↓
[Carga y Validación]
    ↓
[Limpieza de Datos] (filtra inválidos/repetidos)
    ↓
[Motor de Cálculo de Asistencia]
    ↓
[Base de Datos MySQL]
    ↓
[Generador de Informes PDF]
```

### Estructura de Base de Datos (MySQL)

```sql
-- Tabla de empleados
CREATE TABLE empleados (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero_ac VARCHAR(20) UNIQUE NOT NULL,
    numero_empleado VARCHAR(10),
    nombre VARCHAR(255) NOT NULL,
    departamento VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_numero_ac (numero_ac)
);

-- Tabla de marcaciones crudas (importadas desde Excel)
CREATE TABLE marcaciones_raw (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero_ac VARCHAR(20) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    fecha_hora DATETIME NOT NULL,
    estado ENUM('Entrada', 'Salida') NOT NULL,
    excepcion ENUM('FOT', 'Invalido', 'Repetido') DEFAULT 'FOT',
    nuevo_estado VARCHAR(50),
    operacion VARCHAR(50),
    importacion_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (importacion_id) REFERENCES importaciones(id) ON DELETE CASCADE,
    INDEX idx_numero_ac_fecha (numero_ac, fecha_hora),
    INDEX idx_importacion (importacion_id)
);

-- Tabla de importaciones (control de cargas)
CREATE TABLE importaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre_archivo VARCHAR(255) NOT NULL,
    tipo_archivo ENUM('marcaciones', 'invalidos') NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    total_registros INT NOT NULL,
    registros_validos INT NOT NULL,
    registros_invalidos INT NOT NULL,
    usuario VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_fecha_rango (fecha_inicio, fecha_fin)
);

-- Tabla de asistencia procesada (día por día)
CREATE TABLE asistencia_diaria (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empleado_id INT NOT NULL,
    fecha DATE NOT NULL,
    entrada_1 TIME,
    salida_1 TIME,
    entrada_2 TIME,
    salida_2 TIME,
    entrada_3 TIME,
    salida_3 TIME,
    horas_trabajadas DECIMAL(5,2) DEFAULT 0,
    tiene_errores BOOLEAN DEFAULT false,
    tipo_error VARCHAR(100),
    observaciones TEXT,
    marcaciones_raw TEXT, -- JSON con todas las marcas del día
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE,
    UNIQUE KEY unique_empleado_fecha (empleado_id, fecha),
    INDEX idx_fecha (fecha),
    INDEX idx_empleado_fecha (empleado_id, fecha)
);

-- Tabla de resúmenes mensuales
CREATE TABLE resumen_mensual (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empleado_id INT NOT NULL,
    año INT NOT NULL,
    mes INT NOT NULL,
    dias_trabajados INT DEFAULT 0,
    total_horas DECIMAL(7,2) DEFAULT 0,
    dias_con_errores INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE,
    UNIQUE KEY unique_empleado_periodo (empleado_id, año, mes),
    INDEX idx_periodo (año, mes)
);

-- Tabla de informes generados
CREATE TABLE informes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empleado_id INT NOT NULL,
    tipo_informe ENUM('tolerante', 'estricto') NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    archivo_path VARCHAR(500),
    total_dias_trabajados INT,
    total_horas DECIMAL(7,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE,
    INDEX idx_empleado_periodo (empleado_id, fecha_inicio, fecha_fin)
);
```

## Lógica de Negocio Principal

### 1. Motor de Cálculo de Asistencia

El motor debe procesar las marcaciones siguiendo estas reglas:

#### Agrupación y Ordenamiento
```typescript
// Pseudo-código de la lógica principal
function procesarAsistencia(marcaciones, modoToleranteOEstricto) {
  // 1. Agrupar por empleado
  const porEmpleado = agruparPorEmpleado(marcaciones);
  
  for (const empleado of porEmpleado) {
    // 2. Agrupar por fecha
    const porFecha = agruparPorFecha(empleado.marcaciones);
    
    for (const dia of porFecha) {
      // 3. Ordenar marcas por hora
      const marcasOrdenadas = ordenarPorHora(dia.marcaciones);
      
      // 4. Armar pares Entrada → Salida
      const pares = armarParesEntradaSalida(marcasOrdenadas);
      
      // 5. Detectar errores
      const errores = detectarErrores(pares, marcasOrdenadas);
      
      // 6. Calcular horas según modo
      let horasTrabajadas = 0;
      let diaValido = true;
      
      if (modoToleranteOEstricto === 'estricto' && errores.length > 0) {
        // En modo estricto, si hay errores, el día NO cuenta
        diaValido = false;
        horasTrabajadas = 0;
      } else {
        // En modo tolerante, intentar calcular las horas
        horasTrabajadas = calcularHoras(pares, modoToleranteOEstricto);
      }
      
      // 7. Guardar en asistencia_diaria
      guardarAsistenciaDiaria({
        empleadoId: empleado.id,
        fecha: dia.fecha,
        pares: pares,
        horas: horasTrabajadas,
        tieneErrores: errores.length > 0,
        tipoError: errores.join(', '),
        diaValido: diaValido
      });
    }
  }
}
```

#### Detección de Errores

Los errores a detectar son:

1. **Entrada sin salida**: Hay una marcación de entrada pero no su correspondiente salida
2. **Salida sin entrada**: Hay una marcación de salida sin entrada previa
3. **Marcas repetidas**: Dos o más marcas del mismo tipo consecutivas
4. **Marcas inválidas**: Marcas con flag "Invalido" en el Excel
5. **Secuencia incorrecta**: No se puede formar pares válidos E→S

```typescript
interface ErrorMarcacion {
  tipo: 'entrada_sin_salida' | 'salida_sin_entrada' | 'repetido' | 'invalido' | 'secuencia_incorrecta';
  descripcion: string;
  hora: string;
}

function detectarErrores(marcaciones: Marcacion[]): ErrorMarcacion[] {
  const errores: ErrorMarcacion[] = [];
  
  // Filtrar marcas inválidas o repetidas
  const invalidas = marcaciones.filter(m => m.excepcion === 'Invalido');
  const repetidas = marcaciones.filter(m => m.excepcion === 'Repetido');
  
  errores.push(...invalidas.map(m => ({
    tipo: 'invalido',
    descripcion: 'Marcación inválida',
    hora: m.hora
  })));
  
  // Verificar pares Entrada-Salida
  let esperaSalida = false;
  
  for (const marca of marcaciones.filter(m => m.excepcion === 'FOT')) {
    if (marca.estado === 'Entrada') {
      if (esperaSalida) {
        errores.push({
          tipo: 'entrada_sin_salida',
          descripcion: 'Entrada consecutiva sin salida previa',
          hora: marca.hora
        });
      }
      esperaSalida = true;
    } else { // Salida
      if (!esperaSalida) {
        errores.push({
          tipo: 'salida_sin_entrada',
          descripcion: 'Salida sin entrada previa',
          hora: marca.hora
        });
      }
      esperaSalida = false;
    }
  }
  
  if (esperaSalida) {
    errores.push({
      tipo: 'entrada_sin_salida',
      descripcion: 'Última entrada sin salida',
      hora: 'fin del día'
    });
  }
  
  return errores;
}
```

#### Armado de Pares Entrada-Salida

```typescript
interface ParMarcacion {
  entrada: Date | null;
  salida: Date | null;
  horas: number;
}

function armarParesEntradaSalida(marcaciones: Marcacion[]): ParMarcacion[] {
  const pares: ParMarcacion[] = [];
  const marcasValidas = marcaciones.filter(m => m.excepcion === 'FOT');
  
  let entradaActual: Date | null = null;
  
  for (const marca of marcasValidas) {
    if (marca.estado === 'Entrada') {
      // Si ya había una entrada pendiente, cerrarla con null
      if (entradaActual !== null) {
        pares.push({
          entrada: entradaActual,
          salida: null,
          horas: 0
        });
      }
      entradaActual = marca.fechaHora;
    } else { // Salida
      if (entradaActual !== null) {
        const horas = calcularDiferenciaHoras(entradaActual, marca.fechaHora);
        pares.push({
          entrada: entradaActual,
          salida: marca.fechaHora,
          horas: horas
        });
        entradaActual = null;
      } else {
        // Salida sin entrada previa
        pares.push({
          entrada: null,
          salida: marca.fechaHora,
          horas: 0
        });
      }
    }
  }
  
  // Si queda una entrada sin cerrar
  if (entradaActual !== null) {
    pares.push({
      entrada: entradaActual,
      salida: null,
      horas: 0
    });
  }
  
  return pares;
}

function calcularDiferenciaHoras(entrada: Date, salida: Date): number {
  const diff = salida.getTime() - entrada.getTime();
  const horas = diff / (1000 * 60 * 60);
  
  // Manejar turnos que cruzan medianoche
  if (horas < 0) {
    // Sumar 24 horas
    return horas + 24;
  }
  
  return Math.round(horas * 100) / 100; // Redondear a 2 decimales
}
```

#### Cálculo de Horas - Modo Tolerante vs Estricto

```typescript
function calcularHorasDia(
  pares: ParMarcacion[], 
  modo: 'tolerante' | 'estricto'
): number {
  
  if (modo === 'estricto') {
    // En modo estricto, si algún par está incompleto, retornar 0
    const tieneParIncompleto = pares.some(p => p.entrada === null || p.salida === null);
    if (tieneParIncompleto) {
      return 0;
    }
    
    // Sumar todas las horas de pares completos
    return pares.reduce((total, par) => total + par.horas, 0);
  } else {
    // Modo tolerante: intentar estimar las horas faltantes
    let totalHoras = 0;
    
    for (const par of pares) {
      if (par.entrada !== null && par.salida !== null) {
        // Par completo, sumar normalmente
        totalHoras += par.horas;
      } else if (par.entrada !== null && par.salida === null) {
        // Entrada sin salida: estimar 8 horas desde la entrada
        // O usar la hora de fin del turno esperado
        const horasEstimadas = 8; // Configurable
        totalHoras += horasEstimadas;
      } else if (par.entrada === null && par.salida !== null) {
        // Salida sin entrada: estimar que entró 8 horas antes
        const horasEstimadas = 8;
        totalHoras += horasEstimadas;
      }
    }
    
    return Math.round(totalHoras * 100) / 100;
  }
}
```

### 2. Importación desde Excel

```typescript
interface ImportarExcelOptions {
  archivoMarcaciones: File;
  archivoInvalidos?: File; // Opcional
  fechaInicio: Date;
  fechaFin: Date;
}

async function importarDesdeExcel(options: ImportarExcelOptions) {
  const { archivoMarcaciones, archivoInvalidos, fechaInicio, fechaFin } = options;
  
  // 1. Leer archivo de marcaciones
  const marcaciones = await leerExcel(archivoMarcaciones);
  
  // Estructura esperada del Excel:
  // Nº AC. | Nº | Nombre | Tiempo | Estado | Nuevo Estado | Excepción | Operación
  
  const marcacionesNormalizadas = marcaciones.map(row => ({
    numeroAC: row['Nº AC.'],
    numeroEmpleado: row['Nº'],
    nombre: row['Nombre'],
    fechaHora: parsearFechaHora(row['Tiempo']), // Formato: "14/5/2025 08:04"
    estado: row['Estado'], // "Entrada" o "Salida"
    excepcion: row['Excepción'] || 'FOT', // "FOT", "Invalido", "Repetido"
    nuevoEstado: row['Nuevo Estado'],
    operacion: row['Operación']
  }));
  
  // 2. Si hay archivo de inválidos, usarlo para limpiar
  let marcacionesLimpias = marcacionesNormalizadas;
  
  if (archivoInvalidos) {
    const invalidos = await leerExcel(archivoInvalidos);
    // Estructura: Departamento | Nombre | AC Nº | Día/Hora | Estado | Equipo | Número ID | Modo Marc. | Tarjeta
    
    const registrosInvalidos = new Set(
      invalidos.map(inv => `${inv['AC Nº']}_${inv['Día/Hora']}`)
    );
    
    // Filtrar marcaciones que estén en la lista de inválidos
    marcacionesLimpias = marcacionesNormalizadas.filter(m => {
      const key = `${m.numeroAC}_${formatearFechaHora(m.fechaHora)}`;
      return !registrosInvalidos.has(key);
    });
  }
  
  // 3. Crear registro de importación
  const importacion = await db.importaciones.create({
    nombreArchivo: archivoMarcaciones.name,
    tipoArchivo: 'marcaciones',
    fechaInicio,
    fechaFin,
    totalRegistros: marcacionesNormalizadas.length,
    registrosValidos: marcacionesLimpias.filter(m => m.excepcion === 'FOT').length,
    registrosInvalidos: marcacionesLimpias.filter(m => m.excepcion !== 'FOT').length,
    usuario: getUserFromSession()
  });
  
  // 4. Insertar marcaciones en la base de datos
  await db.marcacionesRaw.createMany({
    data: marcacionesLimpias.map(m => ({
      numeroAC: m.numeroAC,
      nombre: m.nombre,
      fechaHora: m.fechaHora,
      estado: m.estado,
      excepcion: m.excepcion,
      nuevoEstado: m.nuevoEstado,
      operacion: m.operacion,
      importacionId: importacion.id
    }))
  });
  
  // 5. Crear/actualizar empleados
  for (const m of marcacionesLimpias) {
    await db.empleados.upsert({
      where: { numeroAC: m.numeroAC },
      create: {
        numeroAC: m.numeroAC,
        numeroEmpleado: m.numeroEmpleado,
        nombre: m.nombre
      },
      update: {
        nombre: m.nombre // Actualizar por si cambió
      }
    });
  }
  
  // 6. Procesar asistencia
  await procesarAsistenciaDeImportacion(importacion.id);
  
  return importacion;
}
```

### 3. Generación de Informes PDF

```typescript
interface GenerarInformeOptions {
  empleadoId: number;
  fechaInicio: Date;
  fechaFin: Date;
  modo: 'tolerante' | 'estricto';
}

async function generarInformePDF(options: GenerarInformeOptions): Promise<Buffer> {
  const { empleadoId, fechaInicio, fechaFin, modo } = options;
  
  // 1. Obtener datos del empleado
  const empleado = await db.empleados.findUnique({
    where: { id: empleadoId }
  });
  
  // 2. Obtener asistencia del período
  const asistencias = await db.asistenciaDiaria.findMany({
    where: {
      empleadoId,
      fecha: {
        gte: fechaInicio,
        lte: fechaFin
      }
    },
    orderBy: { fecha: 'asc' }
  });
  
  // 3. Filtrar según modo
  let asistenciasFiltradas = asistencias;
  if (modo === 'estricto') {
    // En modo estricto, solo mostrar días sin errores
    asistenciasFiltradas = asistencias.map(a => {
      if (a.tieneErrores) {
        return { ...a, horasTrabajadas: 0 };
      }
      return a;
    });
  }
  
  // 4. Calcular totales
  const diasTrabajados = asistenciasFiltradas.filter(a => 
    modo === 'estricto' ? !a.tieneErrores : a.horasTrabajadas > 0
  ).length;
  
  const totalHoras = asistenciasFiltradas.reduce((sum, a) => 
    sum + (modo === 'estricto' && a.tieneErrores ? 0 : a.horasTrabajadas), 
    0
  );
  
  // 5. Crear PDF
  const doc = new jsPDF();
  
  // Encabezado
  doc.setFontSize(16);
  doc.text('INFORME DE ASISTENCIA', 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`Modo: ${modo === 'tolerante' ? 'TOLERANTE' : 'ESTRICTO'}`, 105, 28, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Empleado: ${empleado.nombre}`, 20, 40);
  doc.text(`Legajo: ${empleado.numeroAC}`, 20, 46);
  doc.text(`Período: ${formatearFecha(fechaInicio)} - ${formatearFecha(fechaFin)}`, 20, 52);
  
  // Tabla de asistencia
  const tableData = asistenciasFiltradas.map(a => {
    const fila = [
      formatearFecha(a.fecha),
      a.entrada1 ? formatearHora(a.entrada1) : '-',
      a.salida1 ? formatearHora(a.salida1) : '-',
      a.entrada2 ? formatearHora(a.entrada2) : '-',
      a.salida2 ? formatearHora(a.salida2) : '-',
      a.entrada3 ? formatearHora(a.entrada3) : '-',
      a.salida3 ? formatearHora(a.salida3) : '-',
      (modo === 'estricto' && a.tieneErrores ? '0.00' : a.horasTrabajadas.toFixed(2))
    ];
    
    if (modo === 'estricto') {
      fila.push(a.tieneErrores ? a.tipoError : 'OK');
    }
    
    return fila;
  });
  
  const headers = modo === 'estricto' 
    ? ['Fecha', 'E1', 'S1', 'E2', 'S2', 'E3', 'S3', 'Horas', 'Observaciones']
    : ['Fecha', 'E1', 'S1', 'E2', 'S2', 'E3', 'S3', 'Horas'];
  
  doc.autoTable({
    startY: 60,
    head: [headers],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 25 }, // Fecha
      7: { halign: 'right' } // Horas
    }
  });
  
  // Totales
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text(`TOTAL DÍAS TRABAJADOS: ${diasTrabajados}`, 20, finalY);
  doc.text(`TOTAL HORAS: ${totalHoras.toFixed(2)}`, 20, finalY + 6);
  
  // Pie de página
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text(
    `Generado: ${new Date().toLocaleString('es-AR')}`,
    105,
    doc.internal.pageSize.height - 10,
    { align: 'center' }
  );
  
  // 6. Guardar registro del informe
  const informePath = `informes/${empleado.numeroAC}_${formatearFecha(fechaInicio)}_${formatearFecha(fechaFin)}_${modo}.pdf`;
  
  await db.informes.create({
    data: {
      empleadoId,
      tipoInforme: modo,
      fechaInicio,
      fechaFin,
      archivoPath: informePath,
      totalDiasTrabajados: diasTrabajados,
      totalHoras
    }
  });
  
  return doc.output('arraybuffer');
}
```

## Estructura del Proyecto Next.js

```
proyecto-asistencia/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Dashboard principal
│   │   ├── empleados/
│   │   │   ├── page.tsx               # Lista de empleados
│   │   │   └── [id]/
│   │   │       └── page.tsx           # Detalle empleado + asistencia
│   │   ├── importar/
│   │   │   └── page.tsx               # Importar archivos Excel
│   │   ├── informes/
│   │   │   └── page.tsx               # Generar y ver informes
│   │   └── api/
│   │       ├── importar/
│   │       │   └── route.ts           # POST para importar Excel
│   │       ├── procesar-asistencia/
│   │       │   └── route.ts           # POST para procesar marcaciones
│   │       ├── informes/
│   │       │   ├── generar/
│   │       │   │   └── route.ts       # POST para generar PDF
│   │       │   └── [id]/
│   │       │       └── route.ts       # GET para descargar PDF
│   │       ├── empleados/
│   │       │   ├── route.ts           # GET lista, POST crear
│   │       │   └── [id]/
│   │       │       ├── route.ts       # GET, PUT, DELETE
│   │       │       └── asistencia/
│   │       │           └── route.ts   # GET asistencia del empleado
│   │       └── estadisticas/
│   │           └── route.ts           # GET estadísticas generales
│   ├── lib/
│   │   ├── prisma.ts                  # Cliente de Prisma
│   │   ├── asistencia/
│   │   │   ├── motor-calculo.ts       # Motor principal de cálculo
│   │   │   ├── deteccion-errores.ts   # Funciones de detección de errores
│   │   │   ├── armado-pares.ts        # Armado de pares E→S
│   │   │   └── calculo-horas.ts       # Cálculo de horas
│   │   ├── excel/
│   │   │   ├── lector.ts              # Leer archivos Excel
│   │   │   └── normalizador.ts        # Normalizar datos del Excel
│   │   ├── pdf/
│   │   │   └── generador-informes.ts  # Generar PDFs
│   │   └── utils/
│   │       ├── fechas.ts              # Utilidades de fechas
│   │       └── validaciones.ts        # Validaciones con Zod
│   ├── components/
│   │   ├── ui/                        # Componentes shadcn/ui
│   │   ├── empleados/
│   │   │   ├── lista-empleados.tsx
│   │   │   └── detalle-empleado.tsx
│   │   ├── asistencia/
│   │   │   ├── tabla-asistencia.tsx
│   │   │   └── resumen-mensual.tsx
│   │   ├── importacion/
│   │   │   ├── upload-excel.tsx
│   │   │   └── resultado-importacion.tsx
│   │   └── informes/
│   │       ├── generador-pdf.tsx
│   │       └── lista-informes.tsx
│   ├── types/
│   │   ├── empleado.ts
│   │   ├── marcacion.ts
│   │   ├── asistencia.ts
│   │   └── informe.ts
│   └── hooks/
│       ├── use-empleados.ts
│       ├── use-asistencia.ts
│       └── use-informes.ts
├── prisma/
│   ├── schema.prisma                  # Esquema de Prisma
│   └── migrations/                    # Migraciones
├── public/
│   └── uploads/                       # Archivos temporales
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── next.config.js
```

## Funcionalidades Clave a Implementar

### 1. Dashboard Principal
- Resumen de empleados activos
- Total de marcaciones del mes actual
- Días con errores pendientes de revisión
- Últimas importaciones realizadas
- Gráficos de asistencia general

### 2. Gestión de Empleados
- Lista con búsqueda y filtros
- Creación/edición manual de empleados
- Visualización de asistencia histórica por empleado
- Estadísticas individuales (promedio de horas, días trabajados)

### 3. Importación de Archivos
- Drag & drop de archivos Excel
- Validación de estructura del archivo
- Vista previa de datos a importar
- Opción de importar archivo de inválidos
- Progreso de procesamiento
- Resumen post-importación (registros procesados, errores encontrados)

### 4. Procesamiento de Asistencia
- Botón para reprocesar período específico
- Selección de modo (tolerante/estricto)
- Vista de marcaciones problemáticas
- Corrección manual de marcaciones

### 5. Generación de Informes
- Selector de empleado y rango de fechas
- Opción de modo (tolerante/estricto)
- Vista previa antes de generar PDF
- Descarga de PDF
- Historial de informes generados
- Generación masiva (todos los empleados)

### 6. Visualización de Asistencia
- Calendario mensual con días trabajados
- Detalle diario de entradas/salidas
- Indicadores visuales de errores
- Tooltips con información detallada

## Consideraciones Técnicas Importantes

### Manejo de Zonas Horarias
```typescript
// Siempre trabajar en hora local de Argentina (GMT-3)
import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz';

const timezone = 'America/Argentina/Buenos_Aires';

function parsearFechaExcel(fechaString: string): Date {
  // Formato esperado: "14/5/2025 08:04"
  const [fecha, hora] = fechaString.split(' ');
  const [dia, mes, año] = fecha.split('/');
  const [hh, mm] = hora.split(':');
  
  return new Date(
    parseInt(año),
    parseInt(mes) - 1,
    parseInt(dia),
    parseInt(hh),
    parseInt(mm)
  );
}
```

### Turnos que Cruzan Medianoche
```typescript
function calcularHorasConMedianoche(entrada: Date, salida: Date): number {
  const diff = salida.getTime() - entrada.getTime();
  let horas = diff / (1000 * 60 * 60);
  
  // Si la diferencia es negativa, el turno cruzó medianoche
  if (horas < 0) {
    horas += 24;
  }
  
  return horas;
}
```

### Optimización de Consultas
```typescript
// Usar índices compuestos para consultas frecuentes
// Paginar resultados grandes
// Cachear resúmenes mensuales

async function obtenerAsistenciaConPaginacion(
  empleadoId: number,
  page: number = 1,
  pageSize: number = 30
) {
  const skip = (page - 1) * pageSize;
  
  const [asistencias, total] = await Promise.all([
    db.asistenciaDiaria.findMany({
      where: { empleadoId },
      skip,
      take: pageSize,
      orderBy: { fecha: 'desc' }
    }),
    db.asistenciaDiaria.count({
      where: { empleadoId }
    })
  ]);
  
  return {
    data: asistencias,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  };
}
```

### Manejo de Errores y Validaciones
```typescript
import { z } from 'zod';

const ImportacionSchema = z.object({
  archivoMarcaciones: z.instanceof(File),
  archivoInvalidos: z.instanceof(File).optional(),
  fechaInicio: z.date(),
  fechaFin: z.date(),
}).refine(data => data.fechaFin >= data.fechaInicio, {
  message: "La fecha fin debe ser posterior a la fecha inicio"
});

const GenerarInformeSchema = z.object({
  empleadoId: z.number().positive(),
  fechaInicio: z.date(),
  fechaFin: z.date(),
  modo: z.enum(['tolerante', 'estricto'])
});
```

## Variables de Entorno (.env)

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/asistencia_db"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Upload
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=".xls,.xlsx"

# PDF
PDF_OUTPUT_DIR="/public/informes"

# Session (si usas autenticación)
NEXTAUTH_SECRET="tu-secret-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

## Tests Recomendados

```typescript
// Ejemplos de tests unitarios importantes

describe('Motor de Cálculo de Asistencia', () => {
  test('debe armar correctamente pares Entrada-Salida', () => {
    const marcaciones = [
      { estado: 'Entrada', hora: '08:00' },
      { estado: 'Salida', hora: '12:00' },
      { estado: 'Entrada', hora: '13:00' },
      { estado: 'Salida', hora: '17:00' }
    ];
    
    const pares = armarPares(marcaciones);
    
    expect(pares).toHaveLength(2);
    expect(pares[0].horas).toBe(4);
    expect(pares[1].horas).toBe(4);
  });
  
  test('debe detectar entrada sin salida', () => {
    const marcaciones = [
      { estado: 'Entrada', hora: '08:00' },
      { estado: 'Entrada', hora: '13:00' }
    ];
    
    const errores = detectarErrores(marcaciones);
    
    expect(errores).toContainEqual(
      expect.objectContaining({ tipo: 'entrada_sin_salida' })
    );
  });
  
  test('modo estricto debe retornar 0 horas si hay errores', () => {
    const pares = [
      { entrada: new Date(), salida: null, horas: 0 }
    ];
    
    const horas = calcularHoras(pares, 'estricto');
    
    expect(horas).toBe(0);
  });
  
  test('debe manejar turnos que cruzan medianoche', () => {
    const entrada = new Date('2025-05-01 22:00:00');
    const salida = new Date('2025-05-02 06:00:00');
    
    const horas = calcularDiferencia(entrada, salida);
    
    expect(horas).toBe(8);
  });
});
```

## Requisitos No Funcionales

1. **Performance**:
   - Importación de 10,000 registros en menos de 30 segundos
   - Generación de PDF en menos de 5 segundos
   - Respuesta de UI en menos de 200ms

2. **Seguridad**:
   - Validación de tipos de archivo (solo Excel)
   - Sanitización de datos de entrada
   - Control de tamaño de archivos
   - Protección contra SQL injection (Prisma)

3. **Usabilidad**:
   - Interfaz intuitiva y responsiva
   - Mensajes de error claros
   - Indicadores de progreso
   - Tooltips explicativos

4. **Mantenibilidad**:
   - Código TypeScript tipado
   - Separación de responsabilidades
   - Funciones reutilizables
   - Documentación inline

## Entregables Esperados

1. Código fuente completo del proyecto Next.js
2. Base de datos MySQL con esquema completo
3. README con instrucciones de instalación y uso
4. Archivo .env.example con todas las variables
5. Scripts de migración de Prisma
6. Componentes UI funcionales y estilizados
7. API endpoints documentados
8. Funciones de procesamiento probadas
9. Generador de PDFs funcionando

## Criterios de Éxito

El sistema debe ser capaz de:

✅ Importar archivos Excel del reloj biométrico  
✅ Limpiar y normalizar marcaciones  
✅ Detectar todos los tipos de errores definidos  
✅ Calcular horas correctamente en ambos modos  
✅ Generar PDFs legibles y profesionales  
✅ Manejar múltiples turnos en el mismo día  
✅ Soportar turnos que cruzan medianoche  
✅ Proporcionar estadísticas útiles  
✅ Ser fácil de usar por personal no técnico  
✅ Procesar grandes volúmenes de datos eficientemente  

---

## NOTA FINAL IMPORTANTE

Este sistema es crítico para el control de asistencia de empleados gubernamentales. Debe ser:
- **Preciso**: Los cálculos de horas deben ser exactos
- **Confiable**: No debe perder datos ni fallar silenciosamente
- **Auditable**: Debe registrar todas las operaciones importantes
- **Transparente**: Los cálculos deben ser verificables

Prioriza la corrección sobre la velocidad. Es mejor que el sistema tarde un poco más pero que los resultados sean correctos y auditables.
