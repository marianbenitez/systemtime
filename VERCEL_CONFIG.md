# Configuración de Variables de Entorno en Vercel

## Error Actual
```
TypeError: Failed to construct 'URL': Invalid URL
```

Este error ocurre cuando **NEXTAUTH_URL** no está configurada correctamente en Vercel.

## Pasos para Configurar en Vercel

### 1. Ve a tu proyecto en Vercel
- Abre: https://vercel.com/dashboard
- Selecciona tu proyecto: `systemtime`

### 2. Configura las Variables de Entorno
- Ve a **Settings** → **Environment Variables**
- Agrega las siguientes variables:

#### Variables Requeridas:

```bash
# NextAuth URL - DEBE ser la URL completa de tu aplicación
NEXTAUTH_URL=https://systemtime.vercel.app

# NextAuth Secret - Generar con: openssl rand -base64 32
NEXTAUTH_SECRET=tu-secret-generado-aqui

# Database URL (Supabase Pooler)
DATABASE_URL=postgresql://postgres.jmxlkjcfzwfsduthiyzm:System%402025@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct URL (Supabase Direct)
DIRECT_URL=postgresql://postgres.jmxlkjcfzwfsduthiyzm:System%402025@aws-0-us-west-2.pooler.supabase.com:5432/postgres
```

### 3. Generar NEXTAUTH_SECRET

En tu terminal local, ejecuta:
```bash
openssl rand -base64 32
```

Copia el resultado y úsalo como valor de `NEXTAUTH_SECRET`.

### 4. Verificar la URL correcta

**IMPORTANTE:** La URL debe coincidir exactamente con tu dominio en Vercel:
- Si tu dominio es `systemtime.vercel.app` → usa `https://systemtime.vercel.app`
- Si usas un dominio personalizado → usa `https://tu-dominio.com`
- **NO** incluyas trailing slash: ❌ `https://systemtime.vercel.app/`
- **SÍ** incluye https: ✅ `https://systemtime.vercel.app`

### 5. Aplicar Cambios

Después de configurar las variables:
1. Guarda los cambios
2. Ve a **Deployments**
3. Click en los 3 puntos (...) del último deployment
4. Click en **Redeploy**
5. Marca la opción **"Use existing Build Cache"** (opcional, más rápido)
6. Click en **Redeploy**

### 6. Verificar

Una vez que el deployment termine:
1. Abre tu app: `https://systemtime.vercel.app`
2. Ve a `/auth/login`
3. Intenta hacer login
4. Si persiste el error, revisa los logs en Vercel

## Verificar Variables en Vercel

Para verificar que las variables están configuradas:
1. Ve a **Settings** → **Environment Variables**
2. Deberías ver 4 variables configuradas
3. Todas deben mostrar un ícono de candado (están encriptadas)

## Troubleshooting

### Error persiste después de configurar
1. **Verifica la URL exacta**: Debe ser EXACTAMENTE la URL de tu app en Vercel
2. **Revisa los logs**: Ve a tu deployment → **View Function Logs**
3. **Limpia la cache**: Haz un redeploy sin cache
4. **Verifica el secret**: Debe ser una cadena base64 válida (sin espacios ni saltos de línea)

### Cómo verificar logs
1. Ve a tu proyecto en Vercel
2. Click en el último deployment
3. Click en **View Function Logs**
4. Busca errores relacionados con "NEXTAUTH" o "URL"

## Variables que NO debes configurar

❌ **NODE_ENV** - Vercel lo maneja automáticamente
❌ **PORT** - Vercel lo asigna automáticamente
❌ **HOSTNAME** - Vercel lo maneja automáticamente

## Después de Configurar

El flujo debería funcionar así:
1. ✅ Login → Autentica → Redirige a `/dashboard`
2. ✅ Logout → Limpia sesión → Redirige a `/auth/login`
3. ✅ Re-login → Funciona inmediatamente sin errores
4. ✅ Ya autenticado → Auto-redirige a dashboard

---

**Fecha de última actualización:** 2025-11-20
**Versión de NextAuth:** 5.0.0-beta.30
**Versión de Next.js:** 16.0.3
