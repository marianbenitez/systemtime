# Pasos para Verificar y Solucionar Login en Vercel

**Problema**: Login funciona en localhost pero NO en Vercel
**Estado**: Desplegado en Vercel, variables configuradas, necesita diagnóstico

---

## Paso 1: Verificar Variables de Entorno en Vercel

Ve a tu proyecto en Vercel Dashboard:
1. Abre: https://vercel.com/dashboard
2. Selecciona el proyecto "systemtime"
3. Ve a: **Settings** → **Environment Variables**

### Checklist de Variables Requeridas:

**✅ Verifica que TODAS estas variables estén configuradas:**

```
DATABASE_URL
DIRECT_URL
NEXTAUTH_URL
NEXTAUTH_SECRET
NODE_ENV
```

### Valores Correctos:

#### DATABASE_URL (con pooler para serverless)
```
postgresql://postgres.jmxlkjcfzwfsduthiyzm:System%402025@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```

#### DIRECT_URL (para migraciones)
```
postgresql://postgres.jmxlkjcfzwfsduthiyzm:System%402025@aws-0-us-west-2.pooler.supabase.com:5432/postgres
```

#### NEXTAUTH_URL
**🚨 CRÍTICO - Esto probablemente es el problema:**
```
NO debe ser: http://localhost:3000
DEBE ser:    https://tu-proyecto.vercel.app
```

Reemplaza con tu URL real de Vercel. Ejemplo:
- `https://systemtime.vercel.app`
- `https://systemtime-marianbenitez.vercel.app`

#### NEXTAUTH_SECRET
```
hX/N5Io2qeV/pgbVBYdEa/9BaAp1Deo8sgz3/8w+cDQ=
```

#### NODE_ENV
```
production
```

### Importante:
- Cada variable debe estar habilitada para: **Production**, **Preview**, y **Development**
- Después de cambiar variables, debes **Redeploy** el proyecto

---

## Paso 2: Test de Conexión con Supabase

Después de que Vercel redespliega (toma ~2 minutos):

### Accede al endpoint de diagnóstico:

```
https://tu-proyecto.vercel.app/api/test-db
```

Reemplaza `tu-proyecto.vercel.app` con tu URL real.

### Respuestas Posibles:

#### ✅ Si funciona:
Verás un JSON con:
```json
{
  "status": "connected",
  "message": "✅ Conexión exitosa a Supabase",
  "database": {
    "name": "postgres",
    "user": "postgres.jmxlkjcfzwfsduthiyzm",
    "version": "PostgreSQL 15.x"
  },
  "counts": {
    "users": 3,
    "empleados": 0,
    "marcaciones": 0
  },
  "environment": {
    "nodeEnv": "production",
    "hasDirectUrl": true,
    "hasDatabaseUrl": true,
    "hasNextAuthUrl": true,
    "hasNextAuthSecret": true
  }
}
```

**Esto significa**: La conexión con Supabase funciona. El problema es solo NEXTAUTH_URL o NEXTAUTH_SECRET.

#### ❌ Si falla:
Verás un error con detalles. Comparte ese error conmigo.

---

## Paso 3: Verificar Logs de Vercel

Si el test-db funciona pero el login no:

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Ve a: **Deployments** → Selecciona el último deployment
4. Haz clic en: **Functions** → **Logs** o **Runtime Logs**
5. Intenta hacer login
6. Copia los errores que aparezcan

---

## Paso 4: Soluciones Comunes

### Solución 1: Actualizar NEXTAUTH_URL (Más probable)

Si NEXTAUTH_URL está en `http://localhost:3000`:

1. Ve a Vercel → Settings → Environment Variables
2. Edita `NEXTAUTH_URL`
3. Cambia a tu URL de Vercel: `https://tu-proyecto.vercel.app`
4. Guarda
5. Ve a **Deployments**
6. Haz clic en el botón "⋯" del último deployment
7. Selecciona **Redeploy**

### Solución 2: Verificar NEXTAUTH_SECRET

Si no existe o está vacío:

1. Ve a Vercel → Settings → Environment Variables
2. Agrega `NEXTAUTH_SECRET` con valor:
```
hX/N5Io2qeV/pgbVBYdEa/9BaAp1Deo8sgz3/8w+cDQ=
```
3. Asegúrate de marcar: Production, Preview, Development
4. Redeploy

### Solución 3: Verificar Password Encoding

Si DATABASE_URL tiene `System@2025` en lugar de `System%402025`:

1. Edita DATABASE_URL en Vercel
2. Asegúrate que el `@` esté codificado como `%40`:
```
System%402025
```
3. Redeploy

### Solución 4: Prisma Client no generado

Si ves error "Cannot find module '@prisma/client'":

1. Ve al archivo `package.json` en tu proyecto
2. Verifica que exista el script `postinstall`:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```
3. Si no existe, agrégalo
4. Commit y push
5. Vercel regenerará el cliente automáticamente

---

## Paso 5: Información a Compartir

Si después de estos pasos sigue sin funcionar, comparte:

1. **URL de tu proyecto en Vercel**
   Ejemplo: `https://systemtime-xyz.vercel.app`

2. **Respuesta del endpoint /api/test-db**
   Copia todo el JSON que devuelve

3. **Logs de Vercel**
   El error específico que aparece al intentar login

4. **Confirmación de variables**
   - NEXTAUTH_URL: ¿tiene localhost o la URL de Vercel?
   - NEXTAUTH_SECRET: ¿está configurado?
   - DATABASE_URL: ¿tiene System%402025 o System@2025?

---

## Resumen de Acciones Inmediatas

**Haz esto ahora:**

1. ✅ Abre Vercel Dashboard
2. ✅ Ve a Settings → Environment Variables
3. ✅ Cambia `NEXTAUTH_URL` de localhost a tu URL de Vercel
4. ✅ Verifica que `NEXTAUTH_SECRET` existe y tiene el valor correcto
5. ✅ Verifica que `DATABASE_URL` tiene `System%402025` (no `System@2025`)
6. ✅ Redeploy el proyecto
7. ✅ Espera 2 minutos
8. ✅ Prueba `https://tu-proyecto.vercel.app/api/test-db`
9. ✅ Intenta hacer login
10. ✅ Si falla, comparte la URL y los logs

---

**El problema más común (90% de los casos):**
`NEXTAUTH_URL` apuntando a `localhost` en lugar de la URL de producción de Vercel.

**La solución más rápida:**
Cambiar `NEXTAUTH_URL` a tu URL real de Vercel y redeploy.
