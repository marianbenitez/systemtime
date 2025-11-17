# Sistema de Control de Asistencia Biométrica

## ✅ Implementación Completada

Se ha implementado exitosamente el **Sistema de Control de Asistencia Biométrica** en tu aplicación Next.js. Este sistema procesa archivos Excel exportados desde relojes biométricos, detecta automáticamente errores de marcación y genera informes en PDF.

## 🎯 Características Implementadas

### 1. Importación de Marcaciones Biométricas
- **Ruta**: `/dashboard/marcaciones`
- **Funcionalidad**: Importa archivos Excel desde relojes biométricos
- **Detección automática de 5 tipos de errores**:
  1. Entrada sin salida
  2. Salida sin entrada
  3. Marcaciones repetidas
  4. Marcaciones inválidas
  5. Secuencia incorrecta
- **Procesamiento automático**: Crea empleados automáticamente si no existen
- **Validación de datos**: Verifica estructura del Excel y normaliza fechas

### 2. Gestión de Empleados Biométricos
- **Ruta**: `/dashboard/empleados-biometrico`
- **Funcionalidad**:
  - Lista todos los empleados registrados desde el sistema biométrico
  - Muestra información: Legajo (Nº AC), Nombre, Departamento, Estado
  - Se crean automáticamente al importar marcaciones

### 3. Generación de Informes PDF
- **Ruta**: `/dashboard/informes`
- **Dos modos de cálculo**:

  **Modo Tolerante**:
  - Calcula horas incluso con errores
  - Asume 8 horas cuando falta entrada o salida
  - Ideal para auditorías generales

  **Modo Estricto**:
  - Solo cuenta días sin errores
  - Días con problemas aparecen con 0 horas
  - Ideal para cálculos de pago precisos

### 4. Dashboard con Estadísticas
- **Ruta**: `/dashboard`
- **Estadísticas mostradas** (solo para ADMIN/SUPERADMIN):
  - Total de empleados activos
  - Total de marcaciones procesadas
  - Días con errores detectados

## 📊 Estructura de Base de Datos

Se agregaron las siguientes tablas a la base de datos:

1. **empleados**: Empleados del sistema biométrico
2. **importaciones**: Registro de importaciones de archivos
3. **marcaciones_raw**: Marcaciones brutas del reloj
4. **asistencia_diaria**: Asistencias procesadas por día
5. **resumen_mensual**: Resúmenes mensuales por empleado
6. **informes**: Registro de informes generados

## 🔧 Arquitectura Técnica

### Backend (API Routes)
- `/api/marcaciones/importar` - Procesa archivos Excel
- `/api/empleados` - Lista empleados biométricos
- `/api/informes/generar` - Genera PDFs
- `/api/estadisticas` - Obtiene estadísticas del sistema

### Motor de Cálculo (`src/lib/asistencia/`)
- **deteccion-errores.ts**: Detecta 5 tipos de errores
- **armado-pares.ts**: Arma pares entrada-salida
- **calculo-horas.ts**: Calcula horas trabajadas (tolerante/estricto)
- **motor-calculo.ts**: Orquesta todo el proceso

### Procesamiento de Excel (`src/lib/excel/`)
- **lector.ts**: Lee archivos Excel con xlsx
- **normalizador.ts**: Normaliza y agrupa marcaciones

### Generador de PDFs (`src/lib/pdf/`)
- **generador-informes.ts**: Crea PDFs con jsPDF y autoTable

## 📝 Formato del Archivo Excel

El sistema espera archivos Excel con las siguientes columnas:

| Columna | Requerido | Descripción |
|---------|-----------|-------------|
| Nº AC. | ✅ | Legajo del empleado |
| Nº | ⚠️ | Número de empleado (opcional) |
| Nombre | ✅ | Nombre completo |
| Tiempo | ✅ | Fecha y hora (formato: "14/5/2025 08:04") |
| Estado | ✅ | "Entrada" o "Salida" |
| Excepción | ⚠️ | "FOT", "Invalido" o "Repetido" |
| Nuevo Estado | ⚠️ | Estado nuevo (opcional) |
| Operación | ⚠️ | Operación realizada (opcional) |

## 🚀 Cómo Usar el Sistema

### Paso 1: Importar Marcaciones
1. Ve a `/dashboard/marcaciones`
2. Sube el archivo Excel del reloj biométrico
3. Selecciona el rango de fechas
4. Click en "Importar Marcaciones"
5. El sistema procesará automáticamente:
   - Creará empleados si no existen
   - Detectará errores de marcación
   - Calculará horas trabajadas
   - Generará resúmenes mensuales

### Paso 2: Revisar Empleados
1. Ve a `/dashboard/empleados-biometrico`
2. Verifica que los empleados se hayan creado correctamente
3. Los empleados se activan automáticamente

### Paso 3: Generar Informe
1. Ve a `/dashboard/informes`
2. Selecciona el empleado
3. Define el rango de fechas
4. Elige el modo (Tolerante o Estricto)
5. Click en "Generar PDF"
6. El PDF se abrirá automáticamente en una nueva pestaña

## 🔐 Permisos y Roles

El sistema biométrico está disponible para:
- ✅ **SUPERADMIN**: Acceso completo
- ✅ **ADMIN**: Acceso completo
- ❌ **USER**: Sin acceso

## 📁 Estructura de Archivos Creados

```
src/
├── types/
│   ├── marcacion.ts          # Tipos para marcaciones
│   ├── empleado.ts           # Tipos para empleados
│   └── informe.ts            # Tipos para informes
├── lib/
│   ├── asistencia/
│   │   ├── deteccion-errores.ts
│   │   ├── armado-pares.ts
│   │   ├── calculo-horas.ts
│   │   └── motor-calculo.ts
│   ├── excel/
│   │   ├── lector.ts
│   │   └── normalizador.ts
│   └── pdf/
│       └── generador-informes.ts
├── components/
│   ├── marcaciones/
│   │   └── upload-excel.tsx
│   └── informes/
│       └── generador-pdf.tsx
└── app/
    ├── api/
    │   ├── marcaciones/importar/route.ts
    │   ├── empleados/route.ts
    │   ├── informes/generar/route.ts
    │   └── estadisticas/route.ts
    └── dashboard/
        ├── marcaciones/page.tsx
        ├── empleados-biometrico/page.tsx
        └── informes/page.tsx
```

## 🧪 Próximos Pasos

Para probar el sistema:

1. **Inicia el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

2. **Accede al dashboard**:
   - Abre http://localhost:3000
   - Inicia sesión con un usuario ADMIN o SUPERADMIN

3. **Prueba la importación**:
   - Ve a "Importar Marcaciones"
   - Sube un archivo Excel de prueba
   - Verifica que se procese correctamente

4. **Genera un informe**:
   - Ve a "Generar Informes"
   - Selecciona un empleado y rango de fechas
   - Descarga el PDF

## 📦 Dependencias Instaladas

```json
{
  "jspdf": "^2.5.2",
  "jspdf-autotable": "^3.8.3",
  "date-fns": "^4.1.0",
  "xlsx": "^0.18.5"
}
```

## 🐛 Troubleshooting

### Error al leer Excel
- Verifica que el archivo tenga las columnas requeridas
- Asegúrate de que las fechas estén en formato: "DD/M/YYYY HH:mm"

### PDFs no se generan
- Verifica que la carpeta `public/informes` tenga permisos de escritura
- Revisa los logs en la consola del servidor

### Empleados no se crean
- Verifica que el campo "Nº AC." esté presente y sea único
- Revisa que el nombre del empleado no esté vacío

## 📚 Referencias

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [xlsx Documentation](https://github.com/SheetJS/sheetjs)

---

**Sistema desarrollado para**: Gobierno de San Juan, Argentina
**Versión**: 1.0.0
**Fecha**: Noviembre 2024
