# Análisis de Archivos del Sistema Biométrico

**Fecha de análisis:** 2025-11-18
**Archivos analizados:**
- `Ac Reg del 01-05 al 31--05.xls` (Sin errores marcados)
- `Marcaciones del 01-05 al 31--05 (1).xls` (Con detección de errores)

---

## 📊 Resumen Ejecutivo

### Datos Generales
- **Total de registros:** 3,217 marcaciones
- **Total de empleados:** 161 empleados únicos
- **Promedio de marcaciones:** ~20 marcaciones por empleado
- **Período:** Mayo 2025 (01/05 al 31/05)

### Distribución de Marcaciones
- **Entradas:** 1,646 (51.1%)
- **Salidas:** 1,571 (48.9%)

### Errores Detectados
- **FOT (Normal):** 2,775 registros (86.3%)
- **Inválido:** 299 registros (9.3%)
- **Repetido:** 143 registros (4.4%)

---

## 📁 Estructura de los Archivos

### Archivo 1: "Ac Reg del 01-05 al 31--05.xls" (SIN ERRORES)

**Columnas:**
1. `Departamento` - Escuela/Departamento (ej: "Perez Hernandez")
2. `Nombre` - Nombre completo formato "APELLIDO, NOMBRE"
3. `AC Nº` - DNI del empleado (número único)
4. `Día/Hora` - Timestamp completo (ej: "12/5/2025 17:05:26")
5. `Estado` - "Entrada" o "Salida"
6. `Equipo` - ID del equipo biométrico
7. `Número ID` - Legajo del empleado
8. `Modo Marc.` - Modo de marcación (ej: "FP" = huella digital)
9. `Tarjeta` - Número de tarjeta (vacío si usa huella)

**Características:**
- ✅ Incluye información del departamento
- ✅ Timestamp con segundos
- ❌ NO incluye detección de excepciones
- ❌ NO incluye "Nuevo Estado"

---

### Archivo 2: "Marcaciones del 01-05 al 31--05 (1).xls" (CON ERRORES)

**Columnas:**
1. `Nº AC.` - DNI del empleado (número único) ⭐
2. `Nº` - Legajo del empleado ⭐
3. `Nombre` - Nombre completo formato "APELLIDO, NOMBRE" ⭐
4. `Tiempo` - Timestamp (ej: "12/5/2025 17:05") ⭐
5. `Estado` - "Entrada" o "Salida" ⭐
6. `Nuevo Estado` - Estado corregido (ej: "Ent Hrs Ext", "Sal Hrs Ext")
7. `Excepción` - Tipo de error: "FOT", "Invalido", "Repetido" ⭐
8. `Operación` - Operación realizada (generalmente vacío)

**⭐ = Columnas requeridas para el sistema**

**Características:**
- ✅ Incluye detección de excepciones/errores
- ✅ Formato más compacto
- ✅ Identifica marcaciones inválidas
- ✅ Identifica marcaciones repetidas
- ❌ NO incluye información del departamento
- ❌ Timestamp SIN segundos

---

## 👥 Formato de Nombres

Se identificaron **dos formatos** de nombres en los archivos:

### Formato 1: Con coma (CORRECTO)
```
"APELLIDO, NOMBRE"
Ejemplo: "MONTAÑO, JULIO CESAR"
```

### Formato 2: Sin coma (PROBLEMÁTICO)
```
"APELLIDO NOMBRE"
Ejemplo: "OLIVERA  ESTELA MABEL"
```

**⚠️ IMPORTANTE:** El sistema debe manejar ambos formatos para separar correctamente apellido y nombre.

---

## 📋 Mapeo de Campos para la Base de Datos

### Tabla: `empleados`

| Campo BD | Columna Excel | Transformación |
|----------|---------------|----------------|
| `numeroAC` | `Nº AC.` | DNI (string único) |
| `numeroId` | `Nº` | Legajo (string) |
| `apellido` | `Nombre` | Parte antes de la coma |
| `nombre` | `Nombre` | Parte después de la coma |
| `departamento` | N/A | NULL (no disponible en archivo con errores) |
| `activo` | N/A | true (por defecto) |

**Ejemplo de extracción:**
```javascript
const nombreCompleto = "MONTAÑO, JULIO CESAR"
const partes = nombreCompleto.split(',').map(s => s.trim())
const apellido = partes[0] || nombreCompleto  // "MONTAÑO"
const nombre = partes[1] || ''                // "JULIO CESAR"
```

---

### Tabla: `marcaciones_raw`

| Campo BD | Columna Excel | Transformación |
|----------|---------------|----------------|
| `numeroAC` | `Nº AC.` | String (DNI) |
| `nombre` | `Nombre` | Nombre completo |
| `fechaHora` | `Tiempo` | DateTime parseado |
| `estado` | `Estado` | Enum: "Entrada" o "Salida" |
| `excepcion` | `Excepción` | Enum: "FOT", "Invalido", "Repetido" |
| `nuevoEstado` | `Nuevo Estado` | String (opcional) |
| `operacion` | `Operación` | String (opcional) |

**Formato de fecha/hora:**
```
Entrada: "14/5/2025 08:04"
Formato: "D/M/YYYY HH:mm"
```

---

## 🔍 Ejemplos de Datos Reales

### Empleado Completo
```json
{
  "numeroAC": "13917693",
  "numeroId": "4",
  "nombreCompleto": "MONTAÑO, JULIO CESAR",
  "apellido": "MONTAÑO",
  "nombre": "JULIO CESAR",
  "departamento": null,
  "totalMarcaciones": 34,
  "entradas": 18,
  "salidas": 16,
  "errores": {
    "FOT": 30,
    "Invalido": 2,
    "Repetido": 2
  }
}
```

### Marcaciones de un Día (19/5/2025)
```json
[
  {
    "hora": "08:06",
    "estado": "Entrada",
    "excepcion": "FOT",
    "nuevoEstado": "Ent Hrs Ext"
  },
  {
    "hora": "13:01",
    "estado": "Entrada",  // ⚠️ Debería ser Salida
    "excepcion": "FOT",
    "nuevoEstado": "Sal Hrs Ext"
  },
  {
    "hora": "14:29",
    "estado": "Entrada",
    "excepcion": "FOT",
    "nuevoEstado": "Ent Hrs Ext"
  },
  {
    "hora": "16:59",
    "estado": "Salida",
    "excepcion": "FOT",
    "nuevoEstado": "Sal Hrs Ext"
  }
]
```

**⚠️ OBSERVACIÓN:** El sistema biométrico a veces marca "Entrada" cuando debería ser "Salida". El campo `Nuevo Estado` intenta corregir esto.

---

## 🚨 Tipos de Errores Detectados

### 1. FOT (Normal) - 86.3%
- **Descripción:** Marcaciones normales/válidas
- **Acción:** Procesar normalmente
- **Ejemplo:**
  ```
  "14/5/2025 08:04" - Entrada [FOT] Ent Hrs Ext
  ```

### 2. Invalido - 9.3%
- **Descripción:** Marcaciones sin entrada/salida correspondiente
- **Acción:** Detectar como error tipo `entrada_sin_salida` o `salida_sin_entrada`
- **Ejemplo:**
  ```
  "12/5/2025 17:05" - Salida [Invalido]  // Sin entrada previa
  ```

### 3. Repetido - 4.4%
- **Descripción:** Marcación duplicada en el mismo minuto
- **Acción:** Detectar como error tipo `repetido`, procesar solo una vez
- **Ejemplo:**
  ```
  "16/5/2025 08:01" - Entrada [Repetido]
  "16/5/2025 08:01" - Entrada [FOT]      // Duplicada
  ```

---

## 🔧 Recomendaciones para la Importación

### 1. Archivo Recomendado
✅ **Usar:** `Marcaciones del 01-05 al 31--05 (1).xls`
**Razón:** Incluye detección de excepciones que ayuda a identificar errores.

### 2. Validaciones Necesarias
- ✅ Verificar que `Nº AC.` existe y es válido (DNI)
- ✅ Validar formato de fecha/hora: `D/M/YYYY HH:mm`
- ✅ Verificar que `Estado` sea "Entrada" o "Salida"
- ✅ Manejar ambos formatos de nombre (con y sin coma)
- ✅ Crear empleado si no existe en la BD

### 3. Procesamiento Recomendado
1. **Importar empleados** (extraer únicos del archivo)
2. **Guardar marcaciones raw** en `marcaciones_raw`
3. **Normalizar marcaciones** (agrupar por día y empleado)
4. **Detectar errores** usando el motor de detección
5. **Armar pares entrada/salida** (hasta 3 pares por día)
6. **Calcular horas** trabajadas
7. **Guardar en** `asistencia_diaria`
8. **Generar** `resumen_mensual`

---

## 📝 Notas Adicionales

### Campo "Nuevo Estado"
El campo "Nuevo Estado" parece corregir errores del sistema biométrico:
- `"Ent Hrs Ext"` = Entrada en horas extras
- `"Sal Hrs Ext"` = Salida en horas extras
- Puede indicar la **intención real** cuando `Estado` es incorrecto

### Casos Especiales
- **Empleados sin legajo:** Algunos tienen `Nº` vacío o compartido
- **Nombres truncados:** Algunos nombres están cortados (ej: "MARIA ALEJANDR")
- **Departamentos:** Solo disponibles en el archivo "Ac Reg"
- **Múltiples marcaciones:** Algunos días tienen 3-4 entradas/salidas

---

## 🎯 Próximos Pasos

1. ✅ Actualizar `lector.ts` para manejar ambos formatos de archivo
2. ✅ Implementar separación de apellido/nombre en `normalizador.ts`
3. ✅ Verificar que `deteccion-errores.ts` maneja los 3 tipos de excepción
4. ✅ Probar importación con archivos reales
5. ✅ Validar cálculo de horas con casos reales
6. ✅ Generar informes PDF de prueba

---

**Generado automáticamente por Claude Code**
**Fecha:** 2025-11-18
