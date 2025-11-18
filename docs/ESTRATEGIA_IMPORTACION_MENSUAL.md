# Estrategia de Importación Mensual - Ambos Archivos

## 🔄 ESCENARIO ACTUAL

Cada mes se generan **DOS archivos** del mismo período:

1. **Archivo SIN ERRORES** (`Ac Reg del...`)
   - ✅ Incluye campo `Departamento` (Escuela)
   - ✅ Todas las marcaciones son válidas (FOT)
   - ✅ Fecha/hora con segundos

2. **Archivo CON ERRORES** (`Marcaciones del...`)
   - ✅ Incluye excepciones (Invalido, Repetido, FOT)
   - ❌ NO incluye departamento
   - ⚠️ Mismo contenido pero con análisis de errores

---

## 🎯 ESTRATEGIA RECOMENDADA

### **Opción 1: IMPORTAR SOLO ARCHIVO SIN ERRORES** (RECOMENDADO ✅)

#### Razones:
1. **Incluye departamento** - Información completa del empleado
2. **Datos más precisos** - Fecha/hora con segundos
3. **Mismas marcaciones** - 3,217 registros en ambos
4. **Menos procesamiento** - No hay errores que manejar

#### Implementación:
```bash
Subir: Ac Reg del 01-05 al 31--05.xls
Resultado:
  - 161 empleados creados/actualizados
  - Con campo departamento poblado
  - Todas las marcaciones procesadas
  - Sin excepciones registradas
```

---

### **Opción 2: IMPORTAR AMBOS ARCHIVOS SECUENCIALMENTE**

#### Caso de Uso:
Si necesitas **departamento + análisis de errores** en la misma importación.

#### Orden Sugerido:

**1️⃣ PRIMERO: Archivo SIN ERRORES**
```
Resultado:
- Crea empleados con departamento
- Procesa todas las marcaciones
- Genera asistencias diarias
```

**2️⃣ SEGUNDO: Archivo CON ERRORES**
```
Resultado:
- Actualiza empleados (sin sobrescribir departamento)
- Reemplaza marcaciones anteriores (mismo período)
- Actualiza excepciones detectadas
```

#### ⚠️ PROBLEMA POTENCIAL:
El sistema **sobrescribirá** las marcaciones del mismo período:

```typescript
// En importar/route.ts línea 34-43
await prisma.importacion.create({
  data: {
    fechaInicio,  // Mismo período
    fechaFin,     // Mismo período
    ...
  }
})
```

Si importas ambos archivos del **mismo mes**, la segunda importación:
- ✅ NO borra los empleados (upsert)
- ❌ CREA nueva importación separada
- ❌ DUPLICA marcaciones raw
- ❌ REPROCESA asistencias diarias (puede sobrescribir)

---

## 🔧 SOLUCIÓN: ESTRATEGIA DE FUSIÓN

### **Opción 3: FUSIONAR DATOS ANTES DE IMPORTAR** (MEJOR SOLUCIÓN 🏆)

Crear un proceso que:

1. **Lee ambos archivos**
2. **Fusiona la información**:
   ```
   Formato Final = {
     DNI, Legajo, Nombre, Apellido: de cualquiera (son iguales)
     Departamento: del archivo SIN ERRORES
     Marcaciones: del archivo CON ERRORES (para análisis)
     Excepciones: del archivo CON ERRORES
   }
   ```
3. **Importa una vez** con datos completos

---

## 📊 ANÁLISIS DE DATOS POR ESTRATEGIA

### Si importas SOLO SIN ERRORES:
```
Empleados:
  ✅ numeroAC (DNI): 13917693
  ✅ numeroId (Legajo): 4
  ✅ apellido: MONTAÑO
  ✅ nombre: JULIO CESAR
  ✅ departamento: Perez Hernandez

Marcaciones:
  ✅ 3,217 marcaciones
  ⚠️ excepcion: FOT (todas)
  ❌ Sin detección de errores (Invalido, Repetido)
```

### Si importas SOLO CON ERRORES:
```
Empleados:
  ✅ numeroAC (DNI): 13917693
  ✅ numeroId (Legajo): 4
  ✅ apellido: MONTAÑO
  ✅ nombre: JULIO CESAR
  ❌ departamento: null

Marcaciones:
  ✅ 3,217 marcaciones
  ✅ excepcion: FOT (86%), Invalido (9%), Repetido (4%)
  ✅ Detección de errores completa
```

### Si importas AMBOS (secuencial):
```
Primera importación (SIN ERRORES):
  - Empleados con departamento
  - Marcaciones sin errores

Segunda importación (CON ERRORES):
  - Empleados actualizados (departamento preservado ✅)
  - Nueva tabla importaciones
  - Duplicación de marcaciones raw (⚠️)
  - Asistencias diarias recalculadas
```

---

## 💡 RECOMENDACIONES POR CASO DE USO

### **CASO 1: Solo necesitas asistencias básicas**
```
✅ Importa: Archivo SIN ERRORES
Ventaja: Incluye departamento
```

### **CASO 2: Necesitas análisis de errores detallado**
```
✅ Importa: Archivo CON ERRORES
Desventaja: Sin departamento
Solución: Cargar departamentos por separado
```

### **CASO 3: Necesitas TODO (departamento + errores)**
```
🏆 MEJOR OPCIÓN: Implementar fusión de archivos

Script sugerido:
1. Leer ambos archivos
2. Crear diccionario de departamentos del archivo SIN ERRORES
3. Enriquecer datos del archivo CON ERRORES con departamentos
4. Importar una vez con datos completos
```

---

## 🔨 IMPLEMENTACIÓN SUGERIDA

### Crear API de Fusión:

```typescript
POST /api/marcaciones/importar-dual

Parámetros:
- archivoSinErrores: File (Ac Reg del...)
- archivoConErrores: File (Marcaciones del...)
- fechaInicio: Date
- fechaFin: Date

Proceso:
1. Leer archivo SIN ERRORES → Extraer departamentos por DNI
2. Leer archivo CON ERRORES → Obtener marcaciones con errores
3. Fusionar: Enriquecer marcaciones con departamentos
4. Importar todo en una sola operación

Resultado:
- Empleados completos (DNI, Legajo, Nombre, Apellido, Departamento)
- Marcaciones con análisis de errores
- Una sola importación en BD
```

---

## ⚡ DECISIÓN RÁPIDA

**Para el mes actual (Mayo 2025):**

```bash
# Si quieres datos completos HOY:
1. Importa primero: Ac Reg del 01-05 al 31--05.xls
   → Crea empleados con departamento

2. Importa segundo: Marcaciones del 01-05 al 31--05 (1).xls
   → Actualiza con análisis de errores
   → Departamento se preserva (no se sobrescribe con undefined)
```

**Para el próximo mes:**

```bash
# Implementar endpoint de fusión
POST /api/marcaciones/importar-dual
  - Sube ambos archivos
  - Sistema fusiona automáticamente
  - Una sola importación con datos completos
```

---

## 🎯 CONCLUSIÓN

El sistema actual **SÍ soporta importar ambos archivos**, pero:

- ⚠️ Crea importaciones duplicadas
- ⚠️ Puede duplicar marcaciones raw
- ✅ Preserva departamentos correctamente
- ✅ Última importación determina excepciones

**MEJOR PRÁCTICA:**
1. **Corto plazo:** Importa primero SIN ERRORES, luego CON ERRORES
2. **Largo plazo:** Implementa endpoint de fusión para importación dual

