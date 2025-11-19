# Troubleshooting: Login no funciona en Vercel

**Problema:** Login funciona en localhost pero NO en Vercel
**Estado:** Diagnosticando

---

## 🔍 Checklist de Diagnóstico

### 1. Variables de Entorno en Vercel

**¿Qué verificar?**

Ve a: **Vercel Dashboard > Tu Proyecto > Settings > Environment Variables**

Debes tener exactamente estas variables:

```env
DATABASE_URL=postgresql://postgres.jmxlkjcfzwfsduthiyzm:System%402025@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL=postgresql://postgres.jmxlkjcfzwfsduthiyzm:System%402025@aws-0-us-west-2.pooler.supabase.com:5432/postgres

NEXTAUTH_URL=https://tu-proyecto.vercel.app

NEXTAUTH_SECRET=hX/N5Io2qeV/pgbVBYdEa/9BaAp1Deo8sgz3/8w+cDQ=

NODE_ENV=production
```

**⚠️ ERRORES COMUNES:**

❌ `NEXTAUTH_URL` apunta a localhost
❌ `NEXTAUTH_SECRET` sigue siendo "your-secret-key-here"
❌ Contraseña mal codificada (debe ser `System%402025` no `System@2025`)
❌ Variables no están en todas las environments (Production, Preview, Development)

---

### 2. NEXTAUTH_URL Incorrecto

**Problema más común:** `NEXTAUTH_URL` apunta a localhost en lugar de tu URL de Vercel

**✅ Correcto:**
```
NEXTAUTH_URL=https://systemtime-marianbenitez.vercel.app
```
O la URL que te dio Vercel.

**❌ Incorrecto:**
```
NEXTAUTH_URL=http://localhost:3000
```

**Cómo arreglarlo:**
1. Ve a Vercel Dashboard > Settings > Environment Variables
2. Edita `NEXTAUTH_URL`
3. Cambia a tu URL de Vercel (https://...)
4. **IMPORTANTE:** Selecciona los 3 environments: Production, Preview, Development
5. Save
6. Ve a Deployments > Click en el último > "Redeploy"

---

### 3. Verificar Conexión a Supabase

**Crear endpoint de health check:**

Ya creaste `/api/health/route.ts` - vamos a verificar que funcione:

**Prueba:**
```
https://tu-proyecto.vercel.app/api/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-11-19T..."
}
```

**Si da error:**
- Problema con DATABASE_URL
- Supabase bloqueando conexiones desde Vercel
- Prisma Client no generado correctamente

---

### 4. Verificar Build de Prisma

**Problema:** Prisma Client no se genera en el build de Vercel

**Solución:** Agregar script de build

**Archivo:** `package.json`

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build",
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

**Vercel usa automáticamente `vercel-build` si existe.**

---

### 5. Logs de Vercel

**Dónde ver los errores:**

1. Ve a Vercel Dashboard
2. Click en tu proyecto
3. Ve a **Deployments**
4. Click en el deployment actual
5. Ve a **Runtime Logs** o **Build Logs**

**Busca estos errores:**

**Error común 1: Prisma Client not found**
```
Error: @prisma/client did not initialize yet
```

**Solución:**
- Agregar `prisma generate` al script de build
- Ver sección #4

**Error común 2: DATABASE_URL not found**
```
Invalid prisma.user.findUnique() invocation
Error validating datasource: the URL must start with protocol postgresql://
```

**Solución:**
- Variable de entorno mal configurada
- Ver sección #1

**Error común 3: NextAuth callback error**
```
[next-auth][error][CALLBACK_CREDENTIALS_HANDLER_ERROR]
```

**Solución:**
- NEXTAUTH_URL incorrecto
- NEXTAUTH_SECRET no configurado
- Ver sección #2

---

## 🔧 Soluciones Paso a Paso

### Solución 1: Actualizar Variables de Entorno

**NEXTAUTH_SECRET** ya lo tienes: `hX/N5Io2qeV/pgbVBYdEa/9BaAp1Deo8sgz3/8w+cDQ=`

**Pasos:**

1. **Ve a Vercel:**
   ```
   https://vercel.com/marianbenitez/systemtime/settings/environment-variables
   ```
   (ajusta la URL según tu proyecto)

2. **Verifica/Agrega estas variables:**

   | Variable | Valor | Environments |
   |----------|-------|--------------|
   | `DATABASE_URL` | `postgresql://postgres.jmxlkjcfzwfsduthiyzm:System%402025@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true` | Production, Preview, Development |
   | `DIRECT_URL` | `postgresql://postgres.jmxlkjcfzwfsduthiyzm:System%402025@aws-0-us-west-2.pooler.supabase.com:5432/postgres` | Production, Preview, Development |
   | `NEXTAUTH_URL` | `https://TU-PROYECTO.vercel.app` | Production, Preview, Development |
   | `NEXTAUTH_SECRET` | `hX/N5Io2qeV/pgbVBYdEa/9BaAp1Deo8sgz3/8w+cDQ=` | Production, Preview, Development |
   | `NODE_ENV` | `production` | Production only |

3. **Guardar cambios**

4. **Redeploy:**
   - Ve a Deployments
   - Click en el último deployment
   - Click "Redeploy" (sin cambios de código)

---

### Solución 2: Actualizar package.json

**Archivo:** `/home/marianob/proyectos/systemtime/package.json`

Asegúrate de tener:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && prisma migrate deploy && next build",
    "start": "next start",
    "lint": "eslint",
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

**Si lo cambias:**
```bash
git add package.json
git commit -m "Fix: Add Prisma generate to build"
git push origin main
```

Vercel detectará el cambio y hará redeploy automáticamente.

---

### Solución 3: Verificar Prisma Output

**Problema:** Prisma Client en ubicación incorrecta

**Tu schema.prisma tiene:**
```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}
```

**Para Vercel, es mejor usar la ubicación por defecto:**

```prisma
generator client {
  provider = "prisma-client-js"
  // output   = "../src/generated/prisma"  // Comentar o remover
}
```

**Si cambias esto, necesitas actualizar TODOS los imports:**
```typescript
// Antes:
import { PrismaClient } from '../src/generated/prisma'

// Después:
import { PrismaClient } from '@prisma/client'
```

**⚠️ Esto requiere cambiar muchos archivos. Solo hazlo si las otras soluciones no funcionan.**

---

## 🧪 Tests de Verificación

### Test 1: Health Check
```bash
curl https://tu-proyecto.vercel.app/api/health
```

**Respuesta esperada:** Status 200, `{"status":"ok"}`

---

### Test 2: NextAuth Endpoint
```bash
curl https://tu-proyecto.vercel.app/api/auth/signin
```

**Respuesta esperada:** HTML de la página de login

---

### Test 3: Database Connection
```bash
curl https://tu-proyecto.vercel.app/api/test-db
```

Primero crea este endpoint:

**Archivo:** `src/app/api/test-db/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.$connect()
    const userCount = await prisma.user.count()

    return NextResponse.json({
      status: 'connected',
      userCount,
      database: 'supabase',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
```

---

## 📊 Checklist Final

Antes de probar de nuevo:

- [ ] `NEXTAUTH_URL` apunta a URL de Vercel (no localhost)
- [ ] `NEXTAUTH_SECRET` configurado correctamente
- [ ] `DATABASE_URL` tiene contraseña URL-encoded (`%40` para `@`)
- [ ] `DIRECT_URL` configurado
- [ ] Variables en los 3 environments (Production, Preview, Development)
- [ ] Script `vercel-build` en package.json
- [ ] Redeployment realizado después de cambios
- [ ] `/api/health` responde OK
- [ ] Logs de Vercel no muestran errores

---

## 🔍 Información que Necesito

Para ayudarte mejor, dime:

1. **¿Cuál es la URL de tu proyecto en Vercel?**
   (ej: https://systemtime-abc123.vercel.app)

2. **¿Qué error exacto ves cuando intentas hacer login?**
   - ¿Mensaje de error?
   - ¿Se queda cargando?
   - ¿Redirige a algún lado?

3. **¿Los logs de Vercel muestran algún error?**
   Ve a: Deployments > [tu deployment] > Runtime Logs

4. **¿El endpoint `/api/health` funciona?**
   Prueba: `https://tu-proyecto.vercel.app/api/health`

---

**Con esta información podré darte una solución exacta.**
