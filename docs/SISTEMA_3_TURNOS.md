# Sistema de Cálculo de 3 Turnos con Detección de Errores

## 🎯 Objetivo

Procesar marcaciones de entrada/salida del reloj biométrico, detectando automáticamente errores y calculando las horas trabajadas considerando hasta **3 turnos diarios** por empleado.

---

## 📊 Análisis de Datos Reales (Mayo 2025)

### Estadísticas del Archivo CON ERRORES:
- **Total marcaciones**: 3,217
- **Total empleados**: 161
- **Promedio**: 19.98 marcaciones/empleado/mes

### Distribución de Excepciones:
- ✅ **FOT (válidas)**: 2,775 (86.26%)
- ❌ **Inválido**: 299 (9.29%)
- ⚠️ **Repetido**: 143 (4.45%)

---

## 🔄 Flujo de Procesamiento

### 1. Importación Dual
```
Archivo SIN ERRORES (Ac Reg del...)
    ↓
Extrae: Departamentos/Escuelas por DNI
    ↓
Archivo CON ERRORES (Marcaciones del...)
    ↓
Extrae: Marcaciones con análisis de excepciones
    ↓
FUSIÓN: Datos completos (Departamento + Excepciones)
```

### 2. Detección de Errores (5 tipos)

#### A. Errores del Reloj Biométrico
1. **Inválido** (9.29% de casos)
   - Marcación rechazada por el reloj
   - Ejemplo: Huella no reconocida, tarjeta defectuosa
   - Campo `Excepción: "Invalido"` en Excel

2. **Repetido** (4.45% de casos)
   - Marcación duplicada en el mismo momento
   - Campo `Excepción: "Repetido"` en Excel

#### B. Errores de Secuencia (Detectados por el Sistema)
3. **Entrada sin Salida**
   - Empleado marcó entrada pero no salida
   - Detectado al analizar la secuencia cronológica

4. **Salida sin Entrada**
   - Empleado marcó salida sin entrada previa
   - Detectado al verificar pares

5. **Secuencia Incorrecta**
   - Múltiples entradas sin salidas intermedias
   - Detectado durante el armado de pares

---

## 🔧 Proceso de Cálculo

### Paso 1: Filtrado de Marcaciones
```typescript
// Solo se procesan marcaciones válidas (FOT)
const marcasValidas = marcaciones
  .filter(m => m.excepcion === 'FOT')
  .sort((a, b) => a.fechaHora.getTime() - b.fechaHora.getTime())
```

### Paso 2: Armado de Pares Entrada/Salida
```typescript
// Algoritmo de armado de pares
Para cada marcación válida en orden cronológico:
  Si es ENTRADA:
    - Si hay entrada pendiente → Crear par incompleto (entrada sin salida)
    - Registrar nueva entrada pendiente

  Si es SALIDA:
    - Si hay entrada pendiente → Crear par completo y calcular horas
    - Si NO hay entrada → Crear par incompleto (salida sin entrada)
```

### Paso 3: Cálculo de Horas por Turno
```typescript
function calcularDiferenciaHoras(entrada: Date, salida: Date): number {
  let diff = salida.getTime() - entrada.getTime()

  // Si la diferencia es negativa, la salida es al día siguiente
  if (diff < 0) {
    diff += 24 * 60 * 60 * 1000 // Sumar 24 horas
  }

  const horas = diff / (1000 * 60 * 60)
  return Math.round(horas * 100) / 100 // 2 decimales
}
```

### Paso 4: Almacenamiento de 3 Turnos
```sql
asistencia_diaria {
  fecha: Date

  -- Turno 1
  entrada1: DateTime?
  salida1: DateTime?

  -- Turno 2
  entrada2: DateTime?
  salida2: DateTime?

  -- Turno 3
  entrada3: DateTime?
  salida3: DateTime?

  horasTrabajadas: Decimal
  tieneErrores: Boolean
  tipoError: String
  observaciones: String
}
```

---

## 📈 Modos de Cálculo

### Modo TOLERANTE (Recomendado para auditorías)
- **Objetivo**: Intentar calcular horas incluso con errores
- **Comportamiento**:
  - Si falta entrada → Asume inicio de jornada (ej: 8:00 AM)
  - Si falta salida → Asume fin de jornada (ej: 8 horas)
  - Útil para ver asistencia general

### Modo ESTRICTO (Recomendado para nómina)
- **Objetivo**: Solo contar días sin errores
- **Comportamiento**:
  - Si hay cualquier error → 0 horas
  - Solo cuenta pares completos y válidos
  - Garantiza precisión en cálculos de pago

---

## 🎯 Ejemplo Real de Procesamiento

### Empleado: MONTAÑO, JULIO CESAR (DNI: 13917693)

#### Datos del Archivo SIN ERRORES:
```
Departamento: Perez Hernandez
Número ID: 4
```

#### Marcaciones del Archivo CON ERRORES (12/05/2025):
```
08:04 - Entrada - FOT        ✅
12:05 - Salida  - FOT        ✅
13:15 - Entrada - FOT        ✅
17:05 - Salida  - Invalido   ❌
```

#### Procesamiento:
1. **Marcaciones válidas (FOT)**:
   - 08:04 Entrada
   - 12:05 Salida
   - 13:15 Entrada

2. **Marcación inválida (descartada)**:
   - 17:05 Salida (Invalido)

3. **Pares armados**:
   - **Turno 1**: 08:04 → 12:05 (4.02 horas) ✅ Completo
   - **Turno 2**: 13:15 → null (entrada sin salida) ⚠️ Incompleto

4. **Resultado**:
   - **Modo Tolerante**: 12.02 horas (4.02 + 8.00 estimadas)
   - **Modo Estricto**: 0 horas (día con errores)
   - **Errores detectados**:
     - 1 marcación inválida (17:05)
     - 1 entrada sin salida (13:15)

---

## 💾 Estructura de Datos Guardada

### AsistenciaDiaria (12/05/2025)
```json
{
  "empleadoId": 123,
  "fecha": "2025-05-12T00:00:00Z",
  "entrada1": "2025-05-12T08:04:00Z",
  "salida1": "2025-05-12T12:05:00Z",
  "entrada2": "2025-05-12T13:15:00Z",
  "salida2": null,
  "entrada3": null,
  "salida3": null,
  "horasTrabajadas": 4.02,
  "tieneErrores": true,
  "tipoError": "invalido, entrada_sin_salida",
  "observaciones": "Marcación marcada como inválida (17:05); Entrada a las 13:15 sin salida",
  "marcacionesRaw": "[{\"entrada\":\"2025-05-12T08:04:00Z\",\"salida\":\"2025-05-12T12:05:00Z\",\"horas\":4.02,\"completo\":true},{\"entrada\":\"2025-05-12T13:15:00Z\",\"salida\":null,\"horas\":0,\"completo\":false}]"
}
```

---

## 🔍 Casos de Uso del Sistema

### Caso 1: Jornada Normal (1 turno)
```
08:00 Entrada - FOT
17:00 Salida  - FOT

Resultado:
- Turno 1: 08:00 → 17:00 (9 horas)
- Total: 9 horas
- Errores: Ninguno
```

### Caso 2: Jornada Partida (2 turnos)
```
08:00 Entrada - FOT
12:00 Salida  - FOT
14:00 Entrada - FOT
18:00 Salida  - FOT

Resultado:
- Turno 1: 08:00 → 12:00 (4 horas)
- Turno 2: 14:00 → 18:00 (4 horas)
- Total: 8 horas
- Errores: Ninguno
```

### Caso 3: Triple Turno (3 turnos)
```
06:00 Entrada - FOT
14:00 Salida  - FOT
15:00 Entrada - FOT
23:00 Salida  - FOT
00:00 Entrada - FOT (día siguiente)
08:00 Salida  - FOT (día siguiente)

Resultado Día 1:
- Turno 1: 06:00 → 14:00 (8 horas)
- Turno 2: 15:00 → 23:00 (8 horas)
- Total: 16 horas
- Errores: Ninguno

Resultado Día 2:
- Turno 1: 00:00 → 08:00 (8 horas)
- Total: 8 horas
```

### Caso 4: Con Errores Múltiples
```
08:00 Entrada - FOT
08:01 Entrada - Repetido  ❌
12:00 Salida  - FOT
14:00 Entrada - FOT
18:00 Salida  - Invalido  ❌

Resultado:
- Turno 1: 08:00 → 12:00 (4 horas)
- Turno 2: 14:00 → null (entrada sin salida)
- Total Tolerante: 12 horas (4 + 8 estimadas)
- Total Estricto: 0 horas
- Errores: repetido, invalido, entrada_sin_salida
```

---

## 🎨 Visualización en Informes PDF

### Encabezado
```
INFORME DE ASISTENCIA
Modo: TOLERANTE / ESTRICTO

Empleado: MONTAÑO, JULIO CESAR
DNI: 13917693
Legajo: 4
Escuela: Perez Hernandez
Período: 01/05/2025 - 31/05/2025
```

### Tabla de Asistencia
```
Fecha      | E1    | S1    | E2    | S2    | E3    | S3    | Horas | Observaciones
-----------|-------|-------|-------|-------|-------|-------|-------|---------------
12/05/2025 | 08:04 | 12:05 | 13:15 | -     | -     | -     | 4.02  | Error
14/05/2025 | 08:04 | 17:30 | -     | -     | -     | -     | 9.43  | OK
16/05/2025 | 08:01 | 12:30 | 14:00 | 18:15 | -     | -     | 8.68  | OK
```

### Resumen
```
TOTAL DÍAS TRABAJADOS: 20
TOTAL HORAS: 163.50
```

---

## 🚀 Uso del Sistema

### Opción 1: Importación Dual (RECOMENDADO)
```
1. Ve a Dashboard → Importación Dual
2. Selecciona archivo SIN ERRORES (Ac Reg del...)
3. Selecciona archivo CON ERRORES (Marcaciones del...)
4. Ingresa fechas del período
5. Haz clic en "Importar Ambos Archivos"
```

**Ventajas**:
- Datos completos (departamento + excepciones)
- Una sola importación
- Sin duplicados
- Procesamiento optimizado

### Opción 2: Importación Individual
```
1. Ve a Dashboard → Importar Marcaciones
2. Selecciona UN archivo (cualquier formato)
3. El sistema detecta automáticamente el formato
4. Procesa según el tipo detectado
```

**Limitaciones**:
- Si importas solo SIN ERRORES → No detecta excepciones
- Si importas solo CON ERRORES → No tiene departamentos

---

## 📊 Monitoreo y Reportes

### Resumen Mensual (Auto-calculado)
```sql
resumen_mensual {
  empleadoId: 123
  año: 2025
  mes: 5
  diasTrabajados: 20
  totalHoras: 163.50
  diasConErrores: 5
}
```

### Generación de Informes
- **Tolerante**: Para auditorías y revisión general
- **Estricto**: Para cálculos de nómina precisos
- **Formato**: PDF con tabla detallada día por día

---

## ⚙️ Configuración Técnica

### Archivos Clave del Motor:
- `src/lib/asistencia/motor-calculo.ts` - Orquestador principal
- `src/lib/asistencia/deteccion-errores.ts` - Detecta 5 tipos de errores
- `src/lib/asistencia/armado-pares.ts` - Arma pares entrada/salida
- `src/lib/asistencia/calculo-horas.ts` - Calcula horas (tolerante/estricto)

### Base de Datos:
- `empleados` - Datos maestros (DNI, Legajo, Nombre, Escuela)
- `marcaciones_raw` - Marcaciones crudas del Excel
- `asistencia_diaria` - Asistencia procesada (3 turnos)
- `resumen_mensual` - Totales mensuales

---

## 🎯 Mejores Prácticas

1. **Importación Mensual**:
   - Usa siempre Importación Dual
   - Verifica que ambos archivos sean del mismo período
   - Revisa las estadísticas después de importar

2. **Generación de Informes**:
   - Modo Tolerante: Para revisión y auditoría
   - Modo Estricto: Para cálculos de pago

3. **Revisión de Errores**:
   - Revisa empleados con alto % de errores
   - Verifica patrones de marcaciones inválidas
   - Identifica problemas de hardware del reloj

4. **Mantenimiento**:
   - Limpia marcaciones antiguas periódicamente
   - Verifica que departamentos estén actualizados
   - Audita empleados activos vs inactivos

---

## 📝 Conclusión

El sistema de 3 turnos con detección automática de errores permite:

✅ Procesar marcaciones complejas con múltiples entradas/salidas
✅ Detectar automáticamente 5 tipos de errores
✅ Calcular horas con 2 modos (tolerante/estricto)
✅ Generar informes PDF detallados
✅ Mantener trazabilidad completa (marcaciones raw + procesadas)
✅ Soportar escenarios reales de turnos nocturnos y guardias

**Resultado**: Sistema robusto y preciso para control de asistencia con relojes biométricos.
