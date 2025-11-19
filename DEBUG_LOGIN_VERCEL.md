# 🔍 Depuración de Login para Vercel

## 📋 Objetivo

Este documento explica los logs de depuración agregados para diagnosticar por qué el login no redirige al dashboard en Vercel después de autenticarse correctamente.

---

## 🛠️ Logs Agregados

### 1. Página de Login (`src/app/auth/login/page.tsx`)

Se agregaron logs detallados en el proceso de login del cliente:

**Logs incluidos:**
- 🔐 `[LOGIN] Iniciando proceso de login...` - Inicio del proceso
- 📧 `[LOGIN] Email:` - Email ingresado
- 🌍 `[LOGIN] Environment:` - Información del entorno (hostname, href, origin)
- 📊 `[LOGIN] SignIn result completo:` - Resultado completo de signIn
- ❌ `[LOGIN] Error en signIn:` - Si hay error
- ✅ `[LOGIN] Login exitoso!` - Si login es exitoso
- 🔄 `[LOGIN] Estado del resultado:` - Estado detallado (ok, status, url, error)
- 🚀 `[LOGIN] Redirigiendo a /dashboard...` - Antes de redirección
- ⏱️ `[LOGIN] Timeout alcanzado - verificando redirección...` - Después de 1 segundo
- 📍 `[LOGIN] Location actual:` - URL actual después de timeout
- 💥 `[LOGIN] Excepción capturada:` - Si hay excepción
- 🏁 `[LOGIN] Proceso de login finalizado` - Fin del proceso

### 2. NextAuth Configuration (`src/lib/auth.ts`)

Se agregaron logs en los callbacks de autenticación:

#### Callback `authorize`:
- 🔑 `[AUTH] Iniciando authorize...` - Inicio de autorización
- 📧 `[AUTH] Email recibido:` - Email que se intenta autenticar
- ❌ `[AUTH] Credenciales faltantes` - Error: falta email o password
- 🔍 `[AUTH] Buscando usuario en base de datos...` - Búsqueda en DB
- ❌ `[AUTH] Usuario no encontrado:` - Error: usuario no existe
- ✅ `[AUTH] Usuario encontrado:` - Usuario encontrado con id, email, role
- ❌ `[AUTH] Contraseña incorrecta para:` - Error: password inválido
- ✅ `[AUTH] Autenticación exitosa para:` - Autorización exitosa

#### Callback `jwt`:
- 🎫 `[JWT] Callback ejecutado` - JWT callback llamado
- 👤 `[JWT] Usuario encontrado, agregando a token:` - Agregando usuario al token
- 🔄 `[JWT] Token existente, sin usuario nuevo` - Refrescando token existente
- 📦 `[JWT] Token final:` - Token completo con id, role, email

#### Callback `session`:
- 📋 `[SESSION] Callback ejecutado` - Session callback llamado
- 🎫 `[SESSION] Token recibido:` - Token con id y role
- ✅ `[SESSION] Sesión actualizada:` - Sesión con userId, userEmail, userRole

#### Callback `redirect`:
- 🚀 `[REDIRECT] Callback ejecutado` - Redirect callback llamado
- 📍 `[REDIRECT] URL solicitada:` - URL de destino
- 🏠 `[REDIRECT] Base URL:` - Base URL de la aplicación
- ✅ `[REDIRECT] URL coincide con baseUrl, usando:` - URL absoluta del mismo sitio
- ✅ `[REDIRECT] Ruta relativa, construyendo:` - Construyendo URL desde ruta relativa
- ⚠️ `[REDIRECT] URL no reconocida, usando default dashboard:` - Usando /dashboard por defecto
- 🎯 `[REDIRECT] URL final de redirección:` - URL final de redirección

### 3. Dashboard Page (`src/app/dashboard/page.tsx`)

Se agregaron logs para verificar si la página se carga:

- 🏠 `[DASHBOARD] Componente montado` - Dashboard renderizado
- 👤 `[DASHBOARD] Usuario:` - Usuario actual
- ⚡ `[DASHBOARD] useEffect ejecutado` - Effect ejecutado
- 🔐 `[DASHBOARD] Rol del usuario:` - Rol del usuario
- ✅ `[DASHBOARD] Puede gestionar asistencia:` - Permisos
- 📊 `[DASHBOARD] Obteniendo estadísticas...` - Fetch de stats
- 📥 `[DASHBOARD] Respuesta de estadísticas recibida:` - Response status
- ❌ `[DASHBOARD] Error al obtener estadísticas:` - Error en fetch
- ⚠️ `[DASHBOARD] Usuario sin permisos para ver estadísticas` - Sin permisos

---

## 🧪 Cómo Interpretar los Logs

### ✅ Flujo de Login Exitoso Esperado

```
🔐 [LOGIN] Iniciando proceso de login...
📧 [LOGIN] Email: prueba@test.com
�� [LOGIN] Environment: { hostname: "...", href: "...", origin: "..." }

🔑 [AUTH] Iniciando authorize...
📧 [AUTH] Email recibido: prueba@test.com
🔍 [AUTH] Buscando usuario en base de datos...
✅ [AUTH] Usuario encontrado: { id: "...", email: "...", role: "USER" }
✅ [AUTH] Autenticación exitosa para: prueba@test.com

🎫 [JWT] Callback ejecutado
👤 [JWT] Usuario encontrado, agregando a token: { id: "...", email: "...", role: "USER" }
📦 [JWT] Token final: { id: "...", role: "USER", email: "..." }

📊 [LOGIN] SignIn result completo: { ok: true, status: 200, url: "...", error: null }
✅ [LOGIN] Login exitoso!
🔄 [LOGIN] Estado del resultado: { ok: true, status: 200, url: "...", error: null }
🚀 [LOGIN] Redirigiendo a /dashboard...

🚀 [REDIRECT] Callback ejecutado
📍 [REDIRECT] URL solicitada: /dashboard
🏠 [REDIRECT] Base URL: https://...
✅ [REDIRECT] Ruta relativa, construyendo: https://.../dashboard
🎯 [REDIRECT] URL final de redirección: https://.../dashboard

⏱️ [LOGIN] Timeout alcanzado - verificando redirección...
📍 [LOGIN] Location actual: https://.../dashboard

🏠 [DASHBOARD] Componente montado
👤 [DASHBOARD] Usuario: { id: "...", email: "...", name: "...", role: "USER" }
⚡ [DASHBOARD] useEffect ejecutado
```

### ❌ Posibles Problemas y sus Logs

#### Problema 1: Credenciales Inválidas

```
🔐 [LOGIN] Iniciando proceso de login...
🔑 [AUTH] Iniciando authorize...
❌ [AUTH] Contraseña incorrecta para: prueba@test.com
❌ [LOGIN] Error en signIn: Contraseña incorrecta
```

**Solución:** Verificar contraseña del usuario.

#### Problema 2: Usuario No Existe

```
🔐 [LOGIN] Iniciando proceso de login...
🔑 [AUTH] Iniciando authorize...
🔍 [AUTH] Buscando usuario en base de datos...
❌ [AUTH] Usuario no encontrado: prueba@test.com
❌ [LOGIN] Error en signIn: Usuario no encontrado
```

**Solución:** Crear el usuario en la base de datos.

#### Problema 3: Login Exitoso pero No Redirige

```
✅ [LOGIN] Login exitoso!
🚀 [LOGIN] Redirigiendo a /dashboard...
⏱️ [LOGIN] Timeout alcanzado - verificando redirección...
📍 [LOGIN] Location actual: https://.../auth/login  ← SIGUE EN LOGIN!
```

**Posibles causas:**
- `window.location.href` no funciona en Vercel
- Algún middleware está bloqueando la redirección
- Error en el callback de redirect

**Solución:** Revisar logs de `[REDIRECT]` para ver qué URL se devolvió.

#### Problema 4: Redirige pero Dashboard No Carga

```
✅ [LOGIN] Login exitoso!
🚀 [LOGIN] Redirigiendo a /dashboard...
📍 [LOGIN] Location actual: https://.../dashboard  ← SÍ REDIRIGE
🏠 [DASHBOARD] Componente montado  ← NO APARECE ESTE LOG
```

**Posibles causas:**
- Dashboard no se está renderizando
- Error en el componente Dashboard
- Problema con la sesión

**Solución:** Revisar errores en la consola del navegador.

#### Problema 5: Session/JWT No Se Crea

```
✅ [AUTH] Autenticación exitosa para: prueba@test.com
📊 [LOGIN] SignIn result completo: { ok: true, ... }
← NO APARECEN LOGS DE [JWT] O [SESSION]
```

**Posibles causas:**
- Callbacks de NextAuth no se están ejecutando
- Problema con `NEXTAUTH_SECRET`
- Error en configuración de sesión

**Solución:** Verificar variables de entorno y configuración de NextAuth.

---

## 📝 Checklist de Depuración en Vercel

Cuando pruebes el login en Vercel, sigue estos pasos:

1. **Abre las DevTools del navegador**
   - F12 o clic derecho → Inspeccionar
   - Ve a la pestaña "Console"

2. **Limpia la consola**
   - Clic en el icono 🚫 para limpiar logs anteriores

3. **Ingresa las credenciales y haz clic en "Iniciar Sesión"**

4. **Observa los logs en orden**
   - Copia TODOS los logs que aparezcan
   - Especialmente los que tengan emoji 🚀 📍 🎯

5. **Toma nota de:**
   - ¿Aparece `✅ [LOGIN] Login exitoso!`?
   - ¿Aparece `🚀 [REDIRECT] Callback ejecutado`?
   - ¿Cuál es la `🎯 [REDIRECT] URL final de redirección:`?
   - ¿La `📍 [LOGIN] Location actual:` cambió a `/dashboard`?
   - ¿Aparece `🏠 [DASHBOARD] Componente montado`?

6. **Si no redirige:**
   - Busca el log `📍 [LOGIN] Location actual:` después del timeout
   - Compara con la URL que ves en la barra del navegador
   - Busca cualquier log con ❌ o ⚠️

---

## 🔧 Variables de Entorno a Verificar en Vercel

Asegúrate de que estas variables estén configuradas:

```env
# NextAuth
NEXTAUTH_URL=https://tu-app.vercel.app
NEXTAUTH_SECRET=tu-secreto-aqui

# Database (Supabase)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Node
NODE_ENV=production
```

**Importante:** `NEXTAUTH_URL` debe ser la URL exacta de producción de Vercel.

---

## 🎯 Qué Buscar en los Logs

### Indicadores de Éxito ✅

- `✅ [AUTH] Autenticación exitosa`
- `✅ [LOGIN] Login exitoso!`
- `🎯 [REDIRECT] URL final de redirección: https://.../dashboard`
- `📍 [LOGIN] Location actual: https://.../dashboard`
- `🏠 [DASHBOARD] Componente montado`

### Indicadores de Problema ❌

- `❌ [AUTH] Usuario no encontrado`
- `❌ [AUTH] Contraseña incorrecta`
- `❌ [LOGIN] Error en signIn`
- `⚠️ [REDIRECT] URL no reconocida`
- Falta de logs de `[REDIRECT]`
- `📍 [LOGIN] Location actual:` sigue siendo `/auth/login`

---

## 📊 Ejemplo de Logs Completos

### Escenario: Login Exitoso con Redirección

```
🔐 [LOGIN] Iniciando proceso de login...
📧 [LOGIN] Email: prueba@test.com
🌍 [LOGIN] Environment: {
  hostname: "systemtime.vercel.app",
  href: "https://systemtime.vercel.app/auth/login",
  origin: "https://systemtime.vercel.app"
}

🔑 [AUTH] Iniciando authorize...
📧 [AUTH] Email recibido: prueba@test.com
🔍 [AUTH] Buscando usuario en base de datos...
✅ [AUTH] Usuario encontrado: {
  id: "cm3abc123...",
  email: "prueba@test.com",
  role: "USER"
}
✅ [AUTH] Autenticación exitosa para: prueba@test.com

🎫 [JWT] Callback ejecutado
👤 [JWT] Usuario encontrado, agregando a token: {
  id: "cm3abc123...",
  email: "prueba@test.com",
  role: "USER"
}
📦 [JWT] Token final: {
  id: "cm3abc123...",
  role: "USER",
  email: "prueba@test.com"
}

📊 [LOGIN] SignIn result completo: {
  "error": null,
  "ok": true,
  "status": 200,
  "url": "https://systemtime.vercel.app/dashboard"
}

✅ [LOGIN] Login exitoso!
🔄 [LOGIN] Estado del resultado: {
  ok: true,
  status: 200,
  url: "https://systemtime.vercel.app/dashboard",
  error: null
}
🚀 [LOGIN] Redirigiendo a /dashboard...

🚀 [REDIRECT] Callback ejecutado
📍 [REDIRECT] URL solicitada: /dashboard
🏠 [REDIRECT] Base URL: https://systemtime.vercel.app
✅ [REDIRECT] Ruta relativa, construyendo: https://systemtime.vercel.app/dashboard
🎯 [REDIRECT] URL final de redirección: https://systemtime.vercel.app/dashboard

⏱️ [LOGIN] Timeout alcanzado - verificando redirección...
📍 [LOGIN] Location actual: https://systemtime.vercel.app/dashboard
🏁 [LOGIN] Proceso de login finalizado

🏠 [DASHBOARD] Componente montado
👤 [DASHBOARD] Usuario: {
  id: "cm3abc123...",
  email: "prueba@test.com",
  name: "Usuario Prueba",
  role: "USER"
}
⚡ [DASHBOARD] useEffect ejecutado
👤 [DASHBOARD] Usuario en useEffect: { ... }
🔐 [DASHBOARD] Rol del usuario: USER
✅ [DASHBOARD] Puede gestionar asistencia: false
⚠️ [DASHBOARD] Usuario sin permisos para ver estadísticas
```

---

## 🚀 Próximos Pasos

1. **Hacer commit de los cambios:**
   ```bash
   git add .
   git commit -m "Agregar logs de depuración para login en Vercel"
   git push
   ```

2. **Esperar deployment en Vercel**

3. **Probar el login en producción:**
   - Abrir https://tu-app.vercel.app/auth/login
   - Abrir DevTools (F12)
   - Ingresar credenciales: `prueba@test.com / password123`
   - Hacer clic en "Iniciar Sesión"

4. **Copiar TODOS los logs de la consola**

5. **Analizar los logs:**
   - ¿Dónde se detiene el flujo?
   - ¿Hay algún error ❌?
   - ¿La URL final es correcta?

6. **Reportar hallazgos:**
   - Incluir todos los logs
   - Especificar en qué punto falla
   - Verificar variables de entorno

---

## 📋 Resumen

**Archivos modificados:**
- ✅ `src/app/auth/login/page.tsx` - Logs en proceso de login del cliente
- ✅ `src/lib/auth.ts` - Logs en authorize, jwt, session y redirect callbacks
- ✅ `src/app/dashboard/page.tsx` - Logs al cargar dashboard

**Logs totales agregados:** ~30 puntos de depuración

**Próximo commit:** Incluir estos cambios en el deployment de Vercel

---

*Creado: 19/11/2025*
*Propósito: Diagnosticar problema de redirección post-login en Vercel*
