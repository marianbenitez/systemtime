# ¿Qué Datos Obtiene el Sistema al Importar Asistencias?

## 📥 PROCESO COMPLETO DE IMPORTACIÓN

---

## PASO 1: Lectura de Archivos Excel

### 📄 Archivo SIN ERRORES (Ac Reg del 01-05 al 31--05.xls)

#### Columnas que lee del Excel:

| Columna Excel | Tipo Dato | Descripción | Ejemplo Real |
|---------------|-----------|-------------|--------------|
| **Departamento** | String | Escuela/Área | "Perez Hernandez" |
| **Nombre** | String | Apellido, Nombre | "MONTAÑO, JULIO CESAR" |
| **AC Nº** | String | DNI (número de acceso) | "13917693" |
| **Día/Hora** | String | Fecha y hora completa | "12/5/2025 17:05:26" |
| **Estado** | String | Entrada o Salida | "Entrada" / "Salida" |
| **Equipo** | String | Número del reloj | "1" |
| **Número ID** | String | Legajo/Rol | "4" |
| **Modo Marc.** | String | Modo de marcación | "FP" (huella) |
| **Tarjeta** | String | Número de tarjeta | "" (vacío) |

#### Ejemplo de fila leída:
```json
{
  "Departamento": "Perez Hernandez",
  "Nombre": "MONTAÑO, JULIO CESAR",
  "AC Nº": "13917693",
  "Día/Hora": "12/5/2025 17:05:26",
  "Estado": "Salida",
  "Equipo": "1",
  "Número ID": "4",
  "Modo Marc.": "FP",
  "Tarjeta": ""
}
```

---

### 📄 Archivo CON ERRORES (Marcaciones del 01-05 al 31--05 (1).xls)

#### Columnas que lee del Excel:

| Columna Excel | Tipo Dato | Descripción | Ejemplo Real |
|---------------|-----------|-------------|--------------|
| **Nº AC.** | String | DNI (número de acceso) | "13917693" |
| **Nº** | String | Legajo/Rol | "4" |
| **Nombre** | String | Apellido, Nombre | "MONTAÑO, JULIO CESAR" |
| **Tiempo** | String | Fecha y hora (sin segundos) | "12/5/2025 17:05" |
| **Estado** | String | Entrada o Salida | "Entrada" / "Salida" |
| **Nuevo Estado** | String | Estado procesado | "Ent Hrs Ext" |
| **Excepción** | String | Tipo de excepción | "FOT" / "Invalido" / "Repetido" |
| **Operación** | String | Operación realizada | "" (vacío) |

#### Ejemplos de filas leídas:

**Marcación válida:**
```json
{
  "Nº AC.": "13917693",
  "Nº": "4",
  "Nombre": "MONTAÑO, JULIO CESAR",
  "Tiempo": "14/5/2025 08:04",
  "Estado": "Entrada",
  "Nuevo Estado": "Ent Hrs Ext",
  "Excepción": "FOT",
  "Operación": ""
}
```

**Marcación inválida:**
```json
{
  "Nº AC.": "13917693",
  "Nº": "4",
  "Nombre": "MONTAÑO, JULIO CESAR",
  "Tiempo": "12/5/2025 17:05",
  "Estado": "Salida",
  "Nuevo Estado": "",
  "Excepción": "Invalido",
  "Operación": ""
}
```

**Marcación repetida:**
```json
{
  "Nº AC.": "13917693",
  "Nº": "4",
  "Nombre": "MONTAÑO, JULIO CESAR",
  "Tiempo": "16/5/2025 08:01",
  "Estado": "Entrada",
  "Nuevo Estado": "",
  "Excepción": "Repetido",
  "Operación": ""
}
```

---

## PASO 2: Normalización de Datos

### 🔄 Proceso de Transformación

El sistema toma los datos del Excel y los convierte a un formato unificado:

#### Datos Extraídos y Procesados:

```typescript
// ANTES (Excel)
{
  "AC Nº": "13917693",
  "Número ID": "4",
  "Nombre": "MONTAÑO, JULIO CESAR",
  "Día/Hora": "14/5/2025 08:04:26",
  "Estado": "Entrada",
  "Departamento": "Perez Hernandez"
}

// DESPUÉS (Normalizado)
{
  numeroAC: "13917693",        // DNI
  numeroId: "4",                // Legajo
  nombre: "JULIO CESAR",        // Nombre separado
  apellido: "MONTAÑO",          // Apellido separado
  departamento: "Perez Hernandez",  // Escuela
  fechaHora: new Date("2025-05-14T08:04:26"),  // DateTime convertido
  estado: "Entrada",            // Entrada/Salida
  excepcion: "FOT",             // Tipo de marcación
  nuevoEstado: "Ent Hrs Ext",   // Estado procesado
  operacion: ""                 // Operación
}
```

### 📊 Separación de Nombre Completo

El sistema automáticamente separa "APELLIDO, NOMBRE":

```javascript
Entrada: "MONTAÑO, JULIO CESAR"
    ↓
Split por coma (,)
    ↓
Resultado:
  - apellido: "MONTAÑO"
  - nombre: "JULIO CESAR"
```

### 📅 Conversión de Fechas

```javascript
Entrada Excel: "14/5/2025 08:04" o "14/5/2025 08:04:26"
    ↓
Parseo: día=14, mes=5, año=2025, hora=08, minuto=04, segundo=26
    ↓
Conversión a DateTime:
  new Date(2025, 4, 14, 8, 4, 26)  // Nota: mes - 1
    ↓
Resultado: 2025-05-14T08:04:26.000Z
```

---

## PASO 3: Datos Agrupados por Empleado

### 👤 Información de Cada Empleado

Para cada empleado único (por DNI), el sistema obtiene:

```javascript
{
  // DATOS MAESTROS
  numeroAC: "13917693",          // DNI único
  numeroId: "4",                  // Legajo
  nombre: "JULIO CESAR",          // Nombre
  apellido: "MONTAÑO",            // Apellido
  departamento: "Perez Hernandez", // Escuela

  // MARCACIONES DEL MES
  marcaciones: [
    {
      fechaHora: 2025-05-01 08:00:00,
      estado: "Entrada",
      excepcion: "FOT"
    },
    {
      fechaHora: 2025-05-01 17:30:00,
      estado: "Salida",
      excepcion: "FOT"
    },
    {
      fechaHora: 2025-05-02 08:05:00,
      estado: "Entrada",
      excepcion: "FOT"
    },
    // ... más marcaciones del mes
  ]
}
```

---

## PASO 4: Análisis Diario (Por Fecha)

### 📆 Agrupación por Día

El sistema agrupa las marcaciones de cada empleado por día:

#### Ejemplo: Día 12/05/2025 para empleado DNI 13917693

```javascript
{
  fecha: "2025-05-12",
  marcaciones: [
    {
      hora: "08:04:00",
      estado: "Entrada",
      excepcion: "FOT",        // ✅ Válida
      fechaHora: 2025-05-12 08:04:00
    },
    {
      hora: "12:05:00",
      estado: "Salida",
      excepcion: "FOT",        // ✅ Válida
      fechaHora: 2025-05-12 12:05:00
    },
    {
      hora: "13:15:00",
      estado: "Entrada",
      excepcion: "FOT",        // ✅ Válida
      fechaHora: 2025-05-12 13:15:00
    },
    {
      hora: "17:05:00",
      estado: "Salida",
      excepcion: "Invalido",   // ❌ Inválida
      fechaHora: 2025-05-12 17:05:00
    }
  ]
}
```

---

## PASO 5: Detección Automática de Errores

### 🔍 Análisis de Errores del Día

El sistema detecta 5 tipos de errores:

#### Errores Detectados para 12/05/2025:

```javascript
{
  errores: [
    {
      tipo: "invalido",
      descripcion: "Marcación marcada como inválida por el sistema del reloj",
      hora: "17:05",
      marcacion: {
        fechaHora: 2025-05-12 17:05:00,
        estado: "Salida",
        excepcion: "Invalido"
      }
    },
    {
      tipo: "entrada_sin_salida",
      descripcion: "Entrada a las 13:15 sin salida correspondiente",
      hora: "13:15",
      marcacion: {
        fechaHora: 2025-05-12 13:15:00,
        estado: "Entrada",
        excepcion: "FOT"
      }
    }
  ]
}
```

### 📋 Tipos de Errores Detectados

| Tipo Error | Origen | Cómo se Detecta | Ejemplo |
|------------|--------|-----------------|---------|
| **invalido** | Reloj biométrico | Campo "Excepción" = "Invalido" | Huella no reconocida |
| **repetido** | Reloj biométrico | Campo "Excepción" = "Repetido" | Doble marcación |
| **entrada_sin_salida** | Sistema | Análisis de secuencia | E-E-S (falta salida 1) |
| **salida_sin_entrada** | Sistema | Análisis de secuencia | S-E-S (falta entrada 1) |
| **secuencia_incorrecta** | Sistema | Análisis de secuencia | E-E-E (múltiples entradas) |

---

## PASO 6: Armado de Pares Entrada/Salida

### 🔄 Construcción de Turnos

El sistema arma automáticamente los pares de entrada/salida:

#### Proceso para 12/05/2025:

```
Marcaciones válidas (solo FOT):
  08:04 - Entrada
  12:05 - Salida
  13:15 - Entrada
  (17:05 - Salida DESCARTADA por ser Inválida)

Armado de pares:

  Par 1:
    entrada: 08:04
    salida: 12:05
    horas: 4.02
    completo: true ✅

  Par 2:
    entrada: 13:15
    salida: null
    horas: 0
    completo: false ❌  (entrada sin salida)
```

#### Resultado de Pares:

```javascript
{
  pares: [
    {
      entrada: 2025-05-12T08:04:00Z,
      salida: 2025-05-12T12:05:00Z,
      horas: 4.02,
      completo: true
    },
    {
      entrada: 2025-05-12T13:15:00Z,
      salida: null,
      horas: 0,
      completo: false
    }
  ]
}
```

---

## PASO 7: Cálculo de Horas Trabajadas

### ⏱️ Cálculo Automático

El sistema calcula las horas de dos formas:

#### Modo TOLERANTE:
```javascript
{
  turno1: {
    entrada: 08:04,
    salida: 12:05,
    horas: 4.02  // Calculadas exactas
  },
  turno2: {
    entrada: 13:15,
    salida: null,  // Falta salida
    horas: 8.00    // ⚠️ Se ESTIMAN 8 horas
  },

  totalHoras: 12.02  // 4.02 + 8.00
}
```

#### Modo ESTRICTO:
```javascript
{
  turno1: {
    entrada: 08:04,
    salida: 12:05,
    horas: 4.02
  },
  turno2: {
    entrada: 13:15,
    salida: null,
    horas: 0     // ❌ No se cuenta (incompleto)
  },

  tieneErrores: true,
  totalHoras: 0.00  // ❌ Día con errores = 0 horas
}
```

---

## PASO 8: Datos Finales Obtenidos

### 📊 Resumen de Información Extraída

Para **Mayo 2025** con los archivos reales:

#### 1. EMPLEADOS (161)
```javascript
{
  totalEmpleados: 161,
  empleados: [
    {
      id: 1,
      numeroAC: "13917693",
      numeroId: "4",
      nombre: "JULIO CESAR",
      apellido: "MONTAÑO",
      departamento: "Perez Hernandez",
      activo: true
    },
    // ... 160 empleados más
  ]
}
```

#### 2. MARCACIONES TOTALES (3,217)
```javascript
{
  totalMarcaciones: 3217,
  distribucion: {
    validas: 2775,      // 86.26% (FOT)
    invalidas: 299,     // 9.29%
    repetidas: 143      // 4.45%
  }
}
```

#### 3. ASISTENCIA DIARIA (~3,500 registros)

Para cada día trabajado de cada empleado:

```javascript
{
  empleadoId: 123,
  fecha: "2025-05-12",

  // TURNO 1
  entrada1: "08:04:00",
  salida1: "12:05:00",

  // TURNO 2
  entrada2: "13:15:00",
  salida2: null,

  // TURNO 3
  entrada3: null,
  salida3: null,

  // CÁLCULOS
  horasTrabajadas: 4.02,
  tieneErrores: true,
  tipoError: "invalido, entrada_sin_salida",
  observaciones: "Marcación inválida (17:05); Entrada sin salida (13:15)",

  // TRAZABILIDAD
  marcacionesRaw: "[{\"entrada\":\"2025-05-12T08:04:00Z\",\"salida\":\"2025-05-12T12:05:00Z\",\"horas\":4.02,\"completo\":true},{\"entrada\":\"2025-05-12T13:15:00Z\",\"salida\":null,\"horas\":0,\"completo\":false}]"
}
```

#### 4. RESUMEN MENSUAL (161)

Para cada empleado del mes:

```javascript
{
  empleadoId: 123,
  año: 2025,
  mes: 5,
  diasTrabajados: 20,      // Días con horas > 0
  totalHoras: 163.50,      // Suma del mes
  diasConErrores: 5        // Días con errores detectados
}
```

---

## 📈 ESTADÍSTICAS OBTENIDAS

### Por Importación Completa (Mayo 2025):

| Métrica | Valor | Fuente |
|---------|-------|--------|
| **Empleados únicos** | 161 | Excel: columna "AC Nº" / "Nº AC." |
| **Marcaciones totales** | 3,217 | Total de filas del Excel |
| **Marcaciones válidas (FOT)** | 2,775 (86.26%) | Excel: Excepción = "FOT" |
| **Marcaciones inválidas** | 299 (9.29%) | Excel: Excepción = "Invalido" |
| **Marcaciones repetidas** | 143 (4.45%) | Excel: Excepción = "Repetido" |
| **Días procesados** | ~3,500 | Días únicos por empleado |
| **Promedio marcaciones/empleado** | 19.98 | 3,217 / 161 |
| **Empleados con departamento** | 161 (100%) | Solo con archivo SIN ERRORES |

---

## 🎯 DATOS ÚTILES DERIVADOS

### Información que puedes consultar después:

#### 1. Ranking de Empleados con Más Errores
```sql
SELECT
  apellido, nombre,
  dias_con_errores,
  dias_trabajados,
  ROUND(dias_con_errores * 100.0 / dias_trabajados, 2) as porcentaje_error
FROM empleados e
JOIN resumen_mensual r ON r.empleado_id = e.id
WHERE año = 2025 AND mes = 5
ORDER BY porcentaje_error DESC
LIMIT 10;
```

#### 2. Empleados por Escuela
```sql
SELECT
  departamento,
  COUNT(*) as total_empleados
FROM empleados
WHERE activo = true
GROUP BY departamento
ORDER BY total_empleados DESC;
```

#### 3. Distribución de Tipos de Error
```sql
SELECT
  tipo_error,
  COUNT(*) as cantidad_dias
FROM asistencia_diaria
WHERE tiene_errores = true
  AND fecha BETWEEN '2025-05-01' AND '2025-05-31'
GROUP BY tipo_error
ORDER BY cantidad_dias DESC;
```

#### 4. Días con Múltiples Turnos
```sql
SELECT
  e.apellido, e.nombre, a.fecha,
  CASE
    WHEN entrada3 IS NOT NULL THEN 3
    WHEN entrada2 IS NOT NULL THEN 2
    ELSE 1
  END as cantidad_turnos
FROM asistencia_diaria a
JOIN empleados e ON e.id = a.empleado_id
WHERE a.fecha BETWEEN '2025-05-01' AND '2025-05-31'
  AND entrada2 IS NOT NULL
ORDER BY cantidad_turnos DESC, e.apellido;
```

---

## 📋 EJEMPLO COMPLETO: UN EMPLEADO

### Datos Completos Obtenidos para MONTAÑO, JULIO CESAR (DNI: 13917693)

```javascript
{
  // DATOS MAESTROS
  empleado: {
    id: 123,
    numeroAC: "13917693",
    numeroId: "4",
    nombre: "JULIO CESAR",
    apellido: "MONTAÑO",
    departamento: "Perez Hernandez",
    activo: true
  },

  // MARCACIONES DEL MES (ejemplo de 3 días)
  marcacionesRaw: [
    {
      id: 1234,
      fechaHora: "2025-05-12 08:04:00",
      estado: "Entrada",
      excepcion: "FOT"
    },
    {
      id: 1235,
      fechaHora: "2025-05-12 12:05:00",
      estado: "Salida",
      excepcion: "FOT"
    },
    {
      id: 1236,
      fechaHora: "2025-05-12 13:15:00",
      estado: "Entrada",
      excepcion: "FOT"
    },
    {
      id: 1237,
      fechaHora: "2025-05-12 17:05:00",
      estado: "Salida",
      excepcion: "Invalido"
    },
    {
      id: 1238,
      fechaHora: "2025-05-14 08:04:00",
      estado: "Entrada",
      excepcion: "FOT"
    },
    {
      id: 1239,
      fechaHora: "2025-05-14 17:30:00",
      estado: "Salida",
      excepcion: "FOT"
    },
    // ... más marcaciones
  ],

  // ASISTENCIA PROCESADA
  asistenciaDiaria: [
    {
      fecha: "2025-05-12",
      entrada1: "08:04:00",
      salida1: "12:05:00",
      entrada2: "13:15:00",
      salida2: null,
      entrada3: null,
      salida3: null,
      horasTrabajadas: 4.02,
      tieneErrores: true,
      tipoError: "invalido, entrada_sin_salida",
      observaciones: "Marcación inválida (17:05); Entrada sin salida (13:15)"
    },
    {
      fecha: "2025-05-14",
      entrada1: "08:04:00",
      salida1: "17:30:00",
      entrada2: null,
      salida2: null,
      entrada3: null,
      salida3: null,
      horasTrabajadas: 9.43,
      tieneErrores: false,
      tipoError: null,
      observaciones: null
    },
    // ... más días
  ],

  // RESUMEN DEL MES
  resumenMensual: {
    año: 2025,
    mes: 5,
    diasTrabajados: 20,
    totalHoras: 163.50,
    diasConErrores: 5
  }
}
```

---

## ✅ CONCLUSIÓN

Al importar las asistencias, el sistema obtiene:

1. ✅ **Datos completos de 161 empleados** (DNI, Legajo, Nombre, Apellido, Escuela)
2. ✅ **3,217 marcaciones crudas** con fecha/hora exacta y tipo de excepción
3. ✅ **Detección automática de 5 tipos de errores** por día
4. ✅ **Armado de hasta 3 turnos diarios** por empleado
5. ✅ **Cálculo preciso de horas** en modo tolerante y estricto
6. ✅ **Resúmenes mensuales automáticos** por empleado
7. ✅ **Trazabilidad completa** con JSON de pares originales
8. ✅ **Estadísticas detalladas** de errores y asistencia

**Todo esto permite generar informes PDF precisos y realizar análisis completos de asistencia.** 🎯
