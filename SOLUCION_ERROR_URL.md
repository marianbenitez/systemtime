# Solución: Error "Failed to construct 'URL': Invalid URL"

## ❌ Error

```
TypeError: Failed to construct 'URL': Invalid URL
    at b (a7fdd676c39e43f2.js:2:471)
    at async y (13431f7c860f7e4f.js:1:8632)
```

Este error ocurre cuando NextAuth intenta construir una URL pero no tiene una URL válida configurada.

## 🔍 Causas Posibles

1. **`NEXTAUTH_URL` no está configurada en Vercel**
2. **`NEXTAUTH_URL` está vacía o es inválida**
3. **NextAuth no puede detectar la URL del host automáticamente**

## ✅ Solución Aplicada

### 1. Eliminado acceso a `NEXTAUTH_URL` en el cliente

El código del cliente intentaba acceder a `process.env.NEXTAUTH_URL`, pero las variables de entorno del servidor no están disponibles en el cliente.

**Cambio en `src/app/auth/login/page.tsx`:**
- ❌ Eliminado: `nextAuthUrl: process.env.NEXTAUTH_URL || 'NOT SET'`
- ✅ Ahora solo se registra información disponible en el cliente

### 2. Configuración mejorada de NextAuth

**Cambio en `src/lib/auth.ts`:**
- ✅ Agregada compatibilidad entre `NEXTAUTH_URL` y `AUTH_URL`
- ✅ NextAuth v5 usa `AUTH_URL`, pero también acepta `NEXTAUTH_URL` para compatibilidad

## 🔧 Pasos para Resolver en Vercel

### Paso 1: Verificar Variables de Entorno

Ve a **Vercel Dashboard** → **Tu Proyecto** → **Settings** → **Environment Variables**

Asegúrate de tener:

```bash
NEXTAUTH_URL=https://systemtime.vercel.app
```

**⚠️ IMPORTANTE:**
- ✅ Debe ser la URL completa con `https://`
- ✅ NO debe tener trailing slash (`/`)
- ✅ Debe coincidir exactamente con tu dominio en Vercel
- ✅ Debe estar habilitada para **Production**, **Preview**, y **Development**

### Paso 2: Verificar el Valor Correcto

Tu URL de Vercel puede ser:
- `https://systemtime.vercel.app`
- `https://systemtime-tu-usuario.vercel.app`
- `https://tu-dominio-personalizado.com`

**Cómo verificar:**
1. Ve a tu proyecto en Vercel
2. En la página principal verás la URL de producción
3. Copia esa URL exactamente (con `https://`)

### Paso 3: Configurar AUTH_URL (Opcional pero Recomendado)

Para NextAuth v5, también puedes configurar:

```bash
AUTH_URL=https://systemtime.vercel.app
```

Esto es opcional si ya tienes `NEXTAUTH_URL` configurada, pero ayuda a asegurar compatibilidad.

### Paso 4: Redeploy

Después de cambiar las variables:

1. Ve a **Deployments**
2. Click en los **3 puntos** (...) del último deployment
3. Click en **Redeploy**
4. Espera 2-3 minutos

### Paso 5: Verificar

1. Abre tu app: `https://systemtime.vercel.app`
2. Intenta hacer login
3. El error debería desaparecer

## 🧪 Verificar la Configuración

### Test 1: Endpoint de Diagnóstico

```bash
curl https://systemtime.vercel.app/api/test-auth
```

**Respuesta esperada:**
```json
{
  "status": "success",
  "hasNextAuthUrl": true,
  "nextAuthUrl": "https://systemtime.vercel.app",
  "recommendations": [
    "✅ NEXTAUTH_URL configurado correctamente"
  ]
}
```

### Test 2: Verificar en el Navegador

1. Abre las **DevTools** (F12)
2. Ve a la pestaña **Console**
3. Intenta hacer login
4. No deberías ver el error "Failed to construct 'URL'"

## 📝 Checklist

Antes de considerar resuelto:

- [ ] `NEXTAUTH_URL` configurada en Vercel con la URL correcta
- [ ] URL incluye `https://` y NO tiene trailing slash
- [ ] Variable habilitada para Production, Preview, Development
- [ ] Redeploy realizado después de cambiar variables
- [ ] `/api/test-auth` muestra `hasNextAuthUrl: true`
- [ ] El error no aparece en la consola del navegador
- [ ] El login funciona correctamente

## 🐛 Si el Error Persiste

### 1. Verificar Logs de Vercel

1. Ve a **Deployments** → Último deployment
2. Click en **View Function Logs**
3. Busca errores relacionados con "URL" o "NEXTAUTH"

### 2. Verificar Variables en Runtime

Crea un endpoint temporal para verificar:

```typescript
// src/app/api/debug-env/route.ts
export async function GET() {
  return Response.json({
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    AUTH_URL: process.env.AUTH_URL,
    NODE_ENV: process.env.NODE_ENV,
  })
}
```

Luego accede a: `https://systemtime.vercel.app/api/debug-env`

### 3. Limpiar Cache

1. En Vercel, haz un **Redeploy** sin cache
2. En el navegador, limpia la cache (Ctrl+Shift+Delete)
3. Intenta de nuevo

## 📚 Referencias

- [NextAuth.js - Environment Variables](https://next-auth.js.org/configuration/options#environment-variables)
- [Vercel - Environment Variables](https://vercel.com/docs/environment-variables)

---

**Última actualización**: 25 Dic 2025
**Estado**: Solución aplicada en código, requiere configuración en Vercel

