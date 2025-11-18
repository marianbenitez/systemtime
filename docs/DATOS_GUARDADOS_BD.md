# Datos Guardados en la Base de Datos

## 📊 Resumen de Tablas del Sistema Biométrico

Cuando importas los archivos Excel, los datos se distribuyen en **5 tablas principales**:

```
Excel Files
    ↓
┌─────────────────────────────────────────────────┐
│ 1. EMPLEADOS (empleados)                        │
│ 2. IMPORTACIONES (importaciones)                │
│ 3. MARCACIONES RAW (marcaciones_raw)            │
│ 4. ASISTENCIA DIARIA (asistencia_diaria)        │
│ 5. RESUMEN MENSUAL (resumen_mensual)            │
└─────────────────────────────────────────────────┘
```

---

## 1️⃣ EMPLEADOS (empleados)

### Datos que se guardan:

| Campo | Tipo | Descripción | Origen | Ejemplo |
|-------|------|-------------|---------|---------|
| `id` | INT | ID autoincremental | Auto | 123 |
| `numero_ac` | VARCHAR(20) | **DNI del empleado** | Excel: "Nº AC." / "AC Nº" | "13917693" |
| `numero_id` | VARCHAR(10) | **Legajo/Rol** | Excel: "Nº" / "Número ID" | "4" |
| `nombre` | VARCHAR(150) | **Nombre** | Excel: "Nombre" (después de la coma) | "JULIO CESAR" |
| `apellido` | VARCHAR(150) | **Apellido** | Excel: "Nombre" (antes de la coma) | "MONTAÑO" |
| `departamento` | VARCHAR(100) | **Escuela/Departamento** | Excel SIN ERRORES: "Departamento" | "Perez Hernandez" |
| `activo` | BOOLEAN | Estado activo | Por defecto | true |
| `created_at` | DATETIME | Fecha creación | Auto | 2025-05-18 12:00:00 |
| `updated_at` | DATETIME | Fecha actualización | Auto | 2025-05-18 12:00:00 |

### Ejemplo de registro guardado:

```sql
INSERT INTO empleados (
  id, numero_ac, numero_id, nombre, apellido, departamento, activo
) VALUES (
  123,                    -- id
  '13917693',            -- numero_ac (DNI)
  '4',                   -- numero_id (Legajo)
  'JULIO CESAR',         -- nombre
  'MONTAÑO',             -- apellido
  'Perez Hernandez',     -- departamento (Escuela)
  true                   -- activo
);
```

### 📝 Notas importantes:
- Se usa **UPSERT**: Si el DNI ya existe, actualiza los datos
- El campo `departamento` solo se llena con archivo SIN ERRORES
- El campo `numero_id` viene del Excel (Legajo/Rol del empleado)
- Se separa automáticamente "MONTAÑO, JULIO CESAR" en `apellido` y `nombre`

---

## 2️⃣ IMPORTACIONES (importaciones)

### Datos que se guardan:

| Campo | Tipo | Descripción | Ejemplo Dual |
|-------|------|-------------|--------------|
| `id` | INT | ID autoincremental | 45 |
| `nombre_archivo` | VARCHAR(255) | Nombre del/los archivo(s) | "DUAL: Ac Reg del... + Marcaciones del..." |
| `tipo_archivo` | ENUM | Tipo de importación | "marcaciones" |
| `fecha_inicio` | DATE | Fecha inicio período | 2025-05-01 |
| `fecha_fin` | DATE | Fecha fin período | 2025-05-31 |
| `total_registros` | INT | Total marcaciones | 3217 |
| `registros_validos` | INT | Marcaciones FOT | 2775 |
| `registros_invalidos` | INT | Inválidos + Repetidos | 442 |
| `usuario` | VARCHAR(100) | Usuario que importó | NULL |
| `created_at` | DATETIME | Fecha importación | 2025-05-18 12:00:00 |

### Ejemplo de registro guardado:

```sql
INSERT INTO importaciones (
  nombre_archivo, tipo_archivo, fecha_inicio, fecha_fin,
  total_registros, registros_validos, registros_invalidos
) VALUES (
  'DUAL: Ac Reg del 01-05 al 31--05.xls + Marcaciones del 01-05 al 31--05 (1).xls',
  'marcaciones',
  '2025-05-01',
  '2025-05-31',
  3217,  -- Total
  2775,  -- Válidas (FOT)
  442    -- Inválidas + Repetidas
);
```

---

## 3️⃣ MARCACIONES RAW (marcaciones_raw)

### Datos que se guardan (TODAS las marcaciones del Excel):

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `id` | INT | ID autoincremental | 1234 |
| `numero_ac` | VARCHAR(20) | DNI del empleado | "13917693" |
| `nombre` | VARCHAR(255) | Nombre completo | "MONTAÑO, JULIO CESAR" |
| `fecha_hora` | DATETIME | Fecha y hora exacta | 2025-05-14 08:04:00 |
| `estado` | ENUM | Entrada o Salida | "Entrada" |
| `excepcion` | ENUM | Tipo de excepción | "FOT" / "Invalido" / "Repetido" |
| `nuevo_estado` | VARCHAR(50) | Estado nuevo (si existe) | "Ent Hrs Ext" |
| `operacion` | VARCHAR(50) | Operación realizada | "" |
| `importacion_id` | INT | ID de la importación | 45 |
| `created_at` | DATETIME | Fecha registro | 2025-05-18 12:00:00 |

### Ejemplos de registros guardados:

```sql
-- Marcación válida (FOT)
INSERT INTO marcaciones_raw (
  numero_ac, nombre, fecha_hora, estado, excepcion, nuevo_estado, importacion_id
) VALUES (
  '13917693',
  'MONTAÑO, JULIO CESAR',
  '2025-05-14 08:04:00',
  'Entrada',
  'FOT',              -- ✅ Válida
  'Ent Hrs Ext',
  45
);

-- Marcación inválida
INSERT INTO marcaciones_raw (
  numero_ac, nombre, fecha_hora, estado, excepcion, importacion_id
) VALUES (
  '13917693',
  'MONTAÑO, JULIO CESAR',
  '2025-05-12 17:05:00',
  'Salida',
  'Invalido',         -- ❌ Inválida (rechazada por el reloj)
  45
);

-- Marcación repetida
INSERT INTO marcaciones_raw (
  numero_ac, nombre, fecha_hora, estado, excepcion, importacion_id
) VALUES (
  '13917693',
  'MONTAÑO, JULIO CESAR',
  '2025-05-16 08:01:00',
  'Entrada',
  'Repetido',         -- ⚠️ Duplicada
  45
);
```

### 📝 Notas importantes:
- Se guardan **TODAS** las marcaciones, incluso las inválidas
- El campo `excepcion` indica si es válida (FOT), inválida o repetida
- Se mantiene trazabilidad completa con `importacion_id`
- Para Mayo 2025: **3,217 registros** en esta tabla

---

## 4️⃣ ASISTENCIA DIARIA (asistencia_diaria)

### Datos que se guardan (PROCESADOS del análisis):

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `id` | INT | ID autoincremental | 567 |
| `empleado_id` | INT | ID del empleado | 123 |
| `fecha` | DATE | Fecha del día | 2025-05-14 |
| **Turno 1** | | | |
| `entrada_1` | DATETIME | Entrada turno 1 | 2025-05-14 08:04:00 |
| `salida_1` | DATETIME | Salida turno 1 | 2025-05-14 12:05:00 |
| **Turno 2** | | | |
| `entrada_2` | DATETIME | Entrada turno 2 | 2025-05-14 13:15:00 |
| `salida_2` | DATETIME | Salida turno 2 | NULL (error) |
| **Turno 3** | | | |
| `entrada_3` | DATETIME | Entrada turno 3 | NULL |
| `salida_3` | DATETIME | Salida turno 3 | NULL |
| **Cálculos** | | | |
| `horas_trabajadas` | DECIMAL(5,2) | Total horas día | 4.02 |
| `tiene_errores` | BOOLEAN | ¿Día con errores? | true |
| `tipo_error` | VARCHAR(100) | Tipos de error | "invalido, entrada_sin_salida" |
| `observaciones` | TEXT | Detalle de errores | "Marcación inválida (17:05); Entrada sin salida (13:15)" |
| `marcaciones_raw` | TEXT | JSON de pares | (ver abajo) |
| `created_at` | DATETIME | Fecha creación | 2025-05-18 12:00:00 |
| `updated_at` | DATETIME | Fecha actualización | 2025-05-18 12:00:00 |

### Ejemplo de registro guardado (Día con errores):

```sql
INSERT INTO asistencia_diaria (
  empleado_id, fecha,
  entrada_1, salida_1,
  entrada_2, salida_2,
  entrada_3, salida_3,
  horas_trabajadas, tiene_errores, tipo_error, observaciones,
  marcaciones_raw
) VALUES (
  123,                          -- empleado_id
  '2025-05-12',                -- fecha
  '2025-05-12 08:04:00',       -- entrada_1
  '2025-05-12 12:05:00',       -- salida_1 ✅ Par completo
  '2025-05-12 13:15:00',       -- entrada_2
  NULL,                         -- salida_2 ❌ Sin salida (error)
  NULL,                         -- entrada_3
  NULL,                         -- salida_3
  4.02,                         -- horas_trabajadas (solo turno 1)
  true,                         -- tiene_errores
  'invalido, entrada_sin_salida',  -- tipo_error
  'Marcación inválida (17:05); Entrada sin salida (13:15)',  -- observaciones
  '[
    {"entrada":"2025-05-12T08:04:00Z","salida":"2025-05-12T12:05:00Z","horas":4.02,"completo":true},
    {"entrada":"2025-05-12T13:15:00Z","salida":null,"horas":0,"completo":false}
  ]'                            -- marcaciones_raw (JSON)
);
```

### Ejemplo de registro guardado (Día sin errores):

```sql
INSERT INTO asistencia_diaria (
  empleado_id, fecha,
  entrada_1, salida_1,
  entrada_2, salida_2,
  horas_trabajadas, tiene_errores
) VALUES (
  123,
  '2025-05-14',
  '2025-05-14 08:04:00',
  '2025-05-14 17:30:00',       -- ✅ Par completo
  NULL,                         -- Sin turno 2
  NULL,
  9.43,                         -- horas_trabajadas
  false                         -- Sin errores
);
```

### 📝 Notas importantes:
- **1 registro por empleado por día** (unique constraint)
- Soporta hasta **3 turnos** (entrada/salida 1, 2, 3)
- `horas_trabajadas` es la suma de todos los turnos completos
- `marcaciones_raw` guarda el JSON con todos los pares (para trazabilidad)
- Para Mayo 2025 con 161 empleados: **~3,000-4,000 registros** aprox

---

## 5️⃣ RESUMEN MENSUAL (resumen_mensual)

### Datos que se guardan (AUTO-CALCULADOS):

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `id` | INT | ID autoincremental | 89 |
| `empleado_id` | INT | ID del empleado | 123 |
| `año` | INT | Año | 2025 |
| `mes` | INT | Mes (1-12) | 5 |
| `dias_trabajados` | INT | Días con horas > 0 | 20 |
| `total_horas` | DECIMAL(7,2) | Suma total horas | 163.50 |
| `dias_con_errores` | INT | Días con errores | 5 |
| `created_at` | DATETIME | Fecha creación | 2025-05-18 12:00:00 |
| `updated_at` | DATETIME | Fecha actualización | 2025-05-18 12:00:00 |

### Ejemplo de registro guardado:

```sql
INSERT INTO resumen_mensual (
  empleado_id, año, mes,
  dias_trabajados, total_horas, dias_con_errores
) VALUES (
  123,      -- empleado_id
  2025,     -- año
  5,        -- mes (Mayo)
  20,       -- dias_trabajados
  163.50,   -- total_horas del mes
  5         -- dias_con_errores
);
```

### 📝 Notas importantes:
- **1 registro por empleado por mes** (unique constraint)
- Se calcula **automáticamente** al importar
- `dias_trabajados` cuenta días donde `horas_trabajadas > 0`
- `dias_con_errores` cuenta días donde `tiene_errores = true`
- Para Mayo 2025 con 161 empleados: **161 registros**

---

## 📊 RESUMEN TOTAL DE DATOS GUARDADOS

### Para una importación de Mayo 2025 (archivos reales):

| Tabla | Cantidad de Registros | Descripción |
|-------|----------------------|-------------|
| **empleados** | 161 | Empleados únicos |
| **importaciones** | 1 | Una importación dual |
| **marcaciones_raw** | 3,217 | Todas las marcaciones del Excel |
| **asistencia_diaria** | ~3,500 | 1 por empleado por día trabajado |
| **resumen_mensual** | 161 | 1 por empleado (Mayo 2025) |
| **TOTAL** | **~7,040 registros** | |

---

## 🔄 Flujo de Datos Completo

```
EXCEL FILES
    ↓
┌────────────────────────────────────────────┐
│ Ac Reg del...  +  Marcaciones del...       │
│ (SIN ERRORES)     (CON ERRORES)            │
└────────────────────────────────────────────┘
    ↓
    FUSIÓN EN MEMORIA
    ↓
┌────────────────────────────────────────────┐
│ 1. IMPORTACIONES (1 registro)              │
│    - Metadatos de la importación           │
└────────────────────────────────────────────┘
    ↓
┌────────────────────────────────────────────┐
│ 2. MARCACIONES_RAW (3,217 registros)       │
│    - Copia exacta del Excel                │
│    - Con excepciones (FOT/Invalido/Rep)    │
└────────────────────────────────────────────┘
    ↓
    PROCESAMIENTO (Motor de 3 turnos)
    ↓
┌────────────────────────────────────────────┐
│ 3. EMPLEADOS (161 registros)               │
│    - Datos maestros + Departamento         │
└────────────────────────────────────────────┘
    ↓
┌────────────────────────────────────────────┐
│ 4. ASISTENCIA_DIARIA (~3,500 registros)    │
│    - Pares entrada/salida (3 turnos)       │
│    - Horas calculadas                      │
│    - Errores detectados                    │
└────────────────────────────────────────────┘
    ↓
    AUTO-AGREGACIÓN
    ↓
┌────────────────────────────────────────────┐
│ 5. RESUMEN_MENSUAL (161 registros)         │
│    - Totales mensuales por empleado        │
└────────────────────────────────────────────┘
```

---

## 🔍 Consultas SQL Útiles

### Ver todos los datos de un empleado:

```sql
-- Datos maestros
SELECT * FROM empleados WHERE numero_ac = '13917693';

-- Marcaciones raw del mes
SELECT fecha_hora, estado, excepcion
FROM marcaciones_raw
WHERE numero_ac = '13917693'
  AND fecha_hora BETWEEN '2025-05-01' AND '2025-05-31'
ORDER BY fecha_hora;

-- Asistencia procesada
SELECT fecha, entrada_1, salida_1, entrada_2, salida_2,
       horas_trabajadas, tiene_errores, observaciones
FROM asistencia_diaria
WHERE empleado_id = (SELECT id FROM empleados WHERE numero_ac = '13917693')
  AND fecha BETWEEN '2025-05-01' AND '2025-05-31'
ORDER BY fecha;

-- Resumen mensual
SELECT año, mes, dias_trabajados, total_horas, dias_con_errores
FROM resumen_mensual
WHERE empleado_id = (SELECT id FROM empleados WHERE numero_ac = '13917693')
  AND año = 2025 AND mes = 5;
```

### Ver estadísticas de una importación:

```sql
SELECT
  i.nombre_archivo,
  i.fecha_inicio,
  i.fecha_fin,
  i.total_registros,
  i.registros_validos,
  i.registros_invalidos,
  COUNT(m.id) as marcaciones_guardadas
FROM importaciones i
LEFT JOIN marcaciones_raw m ON m.importacion_id = i.id
WHERE i.id = 45
GROUP BY i.id;
```

### Ver empleados con más errores:

```sql
SELECT
  e.numero_ac,
  e.apellido,
  e.nombre,
  COUNT(a.id) as total_dias,
  SUM(CASE WHEN a.tiene_errores THEN 1 ELSE 0 END) as dias_con_errores,
  ROUND(SUM(CASE WHEN a.tiene_errores THEN 1 ELSE 0 END) * 100.0 / COUNT(a.id), 2) as porcentaje_errores
FROM empleados e
JOIN asistencia_diaria a ON a.empleado_id = e.id
WHERE a.fecha BETWEEN '2025-05-01' AND '2025-05-31'
GROUP BY e.id
ORDER BY porcentaje_errores DESC
LIMIT 10;
```

---

## 💾 Tamaño Estimado en Disco

Para una importación mensual típica (161 empleados, 3,217 marcaciones):

| Tabla | Registros | Tamaño aprox/registro | Total |
|-------|-----------|----------------------|-------|
| empleados | 161 | 500 bytes | ~80 KB |
| importaciones | 1 | 500 bytes | ~0.5 KB |
| marcaciones_raw | 3,217 | 200 bytes | ~643 KB |
| asistencia_diaria | 3,500 | 400 bytes | ~1.4 MB |
| resumen_mensual | 161 | 100 bytes | ~16 KB |
| **TOTAL** | **7,040** | | **~2.1 MB** |

**Proyección anual** (12 meses): ~25 MB

---

## ✅ Conclusión

El sistema guarda:

1. **Datos crudos completos** (marcaciones_raw) para auditoría
2. **Datos procesados** (asistencia_diaria) con cálculo de 3 turnos
3. **Resúmenes agregados** (resumen_mensual) para reportes rápidos
4. **Trazabilidad total** con IDs de importación
5. **Detección automática** de 5 tipos de errores
6. **Optimización de consultas** con índices en campos clave

Todo esto permite generar informes precisos en modo tolerante o estricto. 🎯
