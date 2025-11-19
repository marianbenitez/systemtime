# Solución: Login en Vercel

**Tu URL de Vercel (Producción)**: `https://systemtime.vercel.app`

**Estado Actual**:
- ✅ Conexión con Supabase: FUNCIONANDO
- ✅ Variables de entorno: CARGADAS
- ✅ Base de datos: 3 usuarios disponibles
- ❓ Login: NECESITA CONFIGURACIÓN

---

## Paso 1: Configurar NEXTAUTH_URL Correctamente

### Ve a Vercel Dashboard

1. Abre: https://vercel.com/dashboard
2. Selecciona tu proyecto "systemtime"
3. Ve a: **Settings** → **Environment Variables**

### Busca la variable NEXTAUTH_URL

**Valor INCORRECTO** (si está así):
```
http://localhost:3000
```

**Valor CORRECTO** (cámbialo a):
```
https://systemtime.vercel.app
```

### Importante:
- ✅ Marca: **Production**, **Preview**, **Development**
- ✅ Guarda los cambios
- ✅ NO incluyas barras al final de la URL

---

## Paso 2: Verificar NEXTAUTH_SECRET

Asegúrate que la variable `NEXTAUTH_SECRET` existe con este valor:

```
hX/N5Io2qeV/pgbVBYdEa/9BaAp1Deo8sgz3/8w+cDQ=
```

- ✅ Marca: **Production**, **Preview**, **Development**
- ✅ Guarda los cambios

---

## Paso 3: Redeploy el Proyecto

Después de cambiar las variables:

1. Ve a: **Deployments**
2. En el último deployment, haz click en el botón **"⋯"** (tres puntos)
3. Selecciona: **Redeploy**
4. Confirma el redeploy
5. Espera 2-3 minutos a que termine

---

## Paso 4: Prueba de Autenticación

### Test 1: Endpoint de Diagnóstico de Auth

Accede a:
```
https://systemtime.vercel.app/api/test-auth
```

**Respuesta Esperada**:
```json
{
  "status": "success",
  "environment": {
    "hasNextAuthUrl": true,
    "nextAuthUrl": "https://systemtime.vercel.app",
    "hasNextAuthSecret": true
  },
  "database": {
    "totalUsers": 3,
    "superadminExists": true
  },
  "passwordTest": {
    "isValid": true
  },
  "recommendations": [
    "✅ NEXTAUTH_URL configurado correctamente",
    "✅ NEXTAUTH_SECRET está presente",
    "✅ Usuario superadmin existe",
    "✅ La contraseña 'password123' es válida"
  ]
}
```

**Si ves algún ❌ en las recomendaciones**, ese es el problema específico.

### Test 2: Login en la Aplicación

Accede a:
```
https://systemtime.vercel.app/auth/login
```

**Credenciales de prueba**:
- Email: `superadmin@example.com`
- Password: `password123`

---

## Paso 5: Si el Login Aún No Funciona

### Revisa los Logs de Vercel

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Click en **Deployments** → Último deployment
4. Click en **Runtime Logs** o **Functions**
5. Intenta hacer login
6. Busca errores en rojo

### Errores Comunes y Soluciones

#### Error: "Invalid callback URL"
**Causa**: NEXTAUTH_URL no coincide con la URL real
**Solución**: Verifica que NEXTAUTH_URL sea exactamente:
```
https://systemtime.vercel.app
```

#### Error: "No secret provided"
**Causa**: NEXTAUTH_SECRET no está configurado
**Solución**: Agrega la variable con el valor proporcionado arriba

#### Error: "Cannot find module @prisma/client"
**Causa**: Prisma Client no se generó durante el build
**Solución**: Ya está configurado en `package.json` con `postinstall`, solo redeploy

#### Error: "User not found" o "Invalid password"
**Causa**: Los usuarios no están en Supabase o la contraseña es incorrecta
**Solución**: Verifica que los usuarios existan usando `/api/test-auth`

---

## Resumen de Variables de Entorno en Vercel

**Variables REQUERIDAS**:

| Variable | Valor | Entornos |
|----------|-------|----------|
| `DATABASE_URL` | `postgresql://postgres.jmxlkjcfzwfsduthiyzm:System%402025@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true` | Production, Preview, Development |
| `DIRECT_URL` | `postgresql://postgres.jmxlkjcfzwfsduthiyzm:System%402025@aws-0-us-west-2.pooler.supabase.com:5432/postgres` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://systemtime.vercel.app` | Production, Preview, Development |
| `NEXTAUTH_SECRET` | `hX/N5Io2qeV/pgbVBYdEa/9BaAp1Deo8sgz3/8w+cDQ=` | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |

---

## Checklist Final

Antes de probar el login, verifica:

- [ ] NEXTAUTH_URL apunta a tu URL de Vercel (NO localhost)
- [ ] NEXTAUTH_SECRET está configurado
- [ ] DATABASE_URL tiene `System%402025` (no `System@2025`)
- [ ] Todas las variables están en Production, Preview, Development
- [ ] Redeployaste después de cambiar las variables
- [ ] Esperaste 2-3 minutos a que el deploy termine
- [ ] `/api/test-auth` devuelve todas las ✅
- [ ] `/api/test-db` devuelve `status: "connected"`

---

## Información de Contacto para Debug

Si después de seguir todos estos pasos el login no funciona, comparte:

1. **Respuesta de `/api/test-auth`** (copia el JSON completo)
2. **Logs de Vercel** (los errores en rojo del Runtime Logs)
3. **Captura de pantalla** de las variables de entorno en Vercel
4. **Mensaje de error específico** que aparece al intentar login

---

**Última actualización**: 19 Nov 2025
**Siguiente paso**: Cambiar NEXTAUTH_URL en Vercel y redeploy
