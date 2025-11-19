# 🔄 Solución para 307 Temporary Redirect en Dashboard

## 🐛 Problema

Después de hacer login exitoso, al acceder al dashboard se recibe un **307 Temporary Redirect**.

```
✅ Login exitoso
🚀 Redirigiendo a /dashboard
→ GET /dashboard → 307 Temporary Redirect
```

---

## 🔍 Causa del 307

El **307 Temporary Redirect** es una respuesta HTTP que indica que el recurso solicitado ha sido **temporalmente** movido a otra URL. En el contexto de NextAuth + Next.js, esto puede ocurrir por varias razones:

### Causas Comunes:

1. **NextAuth validando sesión**
   - NextAuth verifica que la sesión sea válida antes de mostrar la página
   - Si la sesión no existe o expiró, redirige al login
   - El 307 puede ser parte de este proceso de validación

2. **Middleware de NextAuth**
   - Aunque no hay un archivo `middleware.ts` personalizado
   - NextAuth puede tener su propio middleware interno
   - Verifica autenticación antes de servir rutas protegidas

3. **Server Components sin sesión**
   - Si el dashboard es un Server Component
   - Y intenta acceder a la sesión del servidor
   - Puede causar redirecciones mientras valida

4. **Rutas API de NextAuth**
   - NextAuth usa rutas como `/api/auth/session`
   - Estas pueden devolver 307 durante la validación

---

## ✅ Logs Agregados para Diagnosticar

Se agregaron logs adicionales en:

### 1. Dashboard Layout (`src/app/dashboard/layout.tsx`)
```typescript
🏗️ [DASHBOARD-LAYOUT] Layout montado
📍 [DASHBOARD-LAYOUT] Location: ...
```

### 2. Hook useCurrentUser (`src/lib/hooks/use-current-user.ts`)
```typescript
👥 [USE-CURRENT-USER] Hook ejecutado
📊 [USE-CURRENT-USER] Status: loading | authenticated | unauthenticated
👤 [USE-CURRENT-USER] Session: { user: ... }
✅ [USE-CURRENT-USER] Authenticated: true/false
```

---

## 🧪 Cómo Interpretar los Logs

### Escenario 1: Sesión válida, sin problemas

```
✅ [LOGIN] Login exitoso!
🚀 [LOGIN] Redirigiendo a /dashboard...
📍 [LOGIN] Location actual: /dashboard

🏗️ [DASHBOARD-LAYOUT] Layout montado
📍 [DASHBOARD-LAYOUT] Location: https://.../dashboard

👥 [USE-CURRENT-USER] Hook ejecutado
📊 [USE-CURRENT-USER] Status: loading
→ (espera unos ms)
📊 [USE-CURRENT-USER] Status: authenticated
👤 [USE-CURRENT-USER] Session: { user: { id, email, name, role } }
✅ [USE-CURRENT-USER] Authenticated: true

🏠 [DASHBOARD] Componente montado
👤 [DASHBOARD] Usuario: { ... }
```

### Escenario 2: 307 por sesión no encontrada

```
✅ [LOGIN] Login exitoso!
🚀 [LOGIN] Redirigiendo a /dashboard...

👥 [USE-CURRENT-USER] Hook ejecutado
📊 [USE-CURRENT-USER] Status: loading
→ (espera más tiempo)
📊 [USE-CURRENT-USER] Status: unauthenticated  ← PROBLEMA
👤 [USE-CURRENT-USER] Session: null  ← SIN SESIÓN
✅ [USE-CURRENT-USER] Authenticated: false

→ 307 Redirect de vuelta a /auth/login
```

**Causa:** La sesión no se creó correctamente o expiró.

**Solución:** Verificar que el JWT callback esté guardando el token correctamente.

### Escenario 3: 307 por NEXTAUTH_URL incorrecta

```
✅ [LOGIN] Login exitoso!
🚀 [REDIRECT] URL final de redirección: http://localhost:3000/dashboard
← Pero Vercel está en https://app.vercel.app

→ GET http://localhost:3000/dashboard → 307
→ Redirige a https://app.vercel.app/auth/login
```

**Causa:** `NEXTAUTH_URL` en variables de entorno de Vercel apunta a localhost en lugar de la URL de producción.

**Solución:** Actualizar `NEXTAUTH_URL` en Vercel a la URL correcta de producción.

---

## 🔧 Soluciones Propuestas

### Solución 1: Verificar NEXTAUTH_URL en Vercel

**Variables de entorno correctas:**

```env
# ❌ INCORRECTO (en Vercel)
NEXTAUTH_URL=http://localhost:3000

# ✅ CORRECTO (en Vercel)
NEXTAUTH_URL=https://tu-app.vercel.app
```

**Pasos:**
1. Ir a Vercel Dashboard → Settings → Environment Variables
2. Verificar que `NEXTAUTH_URL` sea la URL de producción
3. NO debe ser `localhost`
4. Debe coincidir exactamente con la URL de tu app
5. Redeploy después de cambiar

### Solución 2: Agregar Configuración Explícita de Sesión

Si el problema persiste, agregar validación de sesión en el layout del dashboard:

```typescript
// src/app/dashboard/layout.tsx
"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    console.log("🔐 [DASHBOARD-LAYOUT] Verificando sesión...")
    console.log("📊 [DASHBOARD-LAYOUT] Status:", status)

    if (status === "loading") {
      console.log("⏳ [DASHBOARD-LAYOUT] Cargando sesión...")
      return
    }

    if (status === "unauthenticated") {
      console.error("❌ [DASHBOARD-LAYOUT] Sin sesión, redirigiendo a login")
      router.push("/auth/login")
      return
    }

    console.log("✅ [DASHBOARD-LAYOUT] Sesión válida")
  }, [status, router])

  if (status === "loading") {
    return <div>Cargando...</div>
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className="h-screen flex flex-col">
      {/* ... resto del layout ... */}
    </div>
  )
}
```

### Solución 3: Usar Middleware de NextAuth

Crear un archivo `middleware.ts` en la raíz del proyecto para proteger rutas:

```typescript
// middleware.ts
export { auth as middleware } from "@/lib/auth"

export const config = {
  matcher: ["/dashboard/:path*"]
}
```

Esto hace que NextAuth maneje automáticamente la autenticación de las rutas del dashboard.

### Solución 4: Verificar Cookies en Vercel

El problema podría ser que las cookies de sesión no se están guardando en Vercel.

**Causas:**
- Dominio incorrecto en cookies
- SameSite policy bloqueando cookies
- Cookies expirando demasiado rápido

**Solución:**
Agregar configuración de cookies en `src/lib/auth.ts`:

```typescript
export const { handlers, auth, signIn, signOut } = NextAuth({
  // ... resto de config
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true
      }
    }
  }
})
```

---

## 📊 Checklist de Depuración

Cuando pruebes en Vercel, verifica en orden:

- [ ] 1. **¿El login fue exitoso?**
  - Buscar: `✅ [LOGIN] Login exitoso!`

- [ ] 2. **¿Se creó el JWT token?**
  - Buscar: `🎫 [JWT] Callback ejecutado`
  - Buscar: `📦 [JWT] Token final: { id, role, email }`

- [ ] 3. **¿Se ejecutó el redirect callback?**
  - Buscar: `🚀 [REDIRECT] Callback ejecutado`
  - Verificar: `🎯 [REDIRECT] URL final de redirección:`

- [ ] 4. **¿La URL de redirección es correcta?**
  - Comparar URL final con URL de Vercel
  - NO debe ser localhost
  - Debe ser https://tu-app.vercel.app/dashboard

- [ ] 5. **¿Se montó el layout del dashboard?**
  - Buscar: `🏗️ [DASHBOARD-LAYOUT] Layout montado`

- [ ] 6. **¿La sesión está disponible?**
  - Buscar: `📊 [USE-CURRENT-USER] Status: authenticated`
  - NO debe ser `unauthenticated`
  - Session debe tener usuario: `👤 [USE-CURRENT-USER] Session: { user: ... }`

- [ ] 7. **¿Se montó la página del dashboard?**
  - Buscar: `🏠 [DASHBOARD] Componente montado`

Si cualquiera de estos pasos falla, ahí está el problema.

---

## 🎯 Próximos Pasos

1. **Hacer commit de los nuevos logs:**
   ```bash
   git add .
   git commit -m "Agregar logs adicionales para depurar 307 redirect

   - Logs en dashboard layout
   - Logs en useCurrentUser hook
   - Tracking completo del estado de sesión"

   git push
   ```

2. **Verificar variables de entorno en Vercel:**
   - Ir a Vercel Dashboard
   - Verificar `NEXTAUTH_URL`
   - Asegurar que sea la URL de producción

3. **Probar login en Vercel:**
   - Abrir DevTools
   - Hacer login
   - Copiar TODOS los logs
   - Seguir el checklist de arriba

4. **Analizar dónde falla:**
   - ¿Status es `unauthenticated`?
   - ¿URL de redirect es localhost?
   - ¿Session es null?

5. **Aplicar solución correspondiente**

---

## 📝 Resumen

**Problema:** 307 Redirect en dashboard después de login

**Causa probable:**
1. `NEXTAUTH_URL` incorrecta en Vercel (apuntando a localhost)
2. Sesión no se crea correctamente
3. Cookies no se guardan en producción

**Logs agregados:**
- ✅ Dashboard Layout
- ✅ useCurrentUser Hook

**Siguiente acción:**
- Verificar logs en Vercel
- Confirmar `NEXTAUTH_URL`
- Aplicar solución según diagnóstico

---

*Creado: 19/11/2025*
*Propósito: Resolver 307 redirect en dashboard de Vercel*
