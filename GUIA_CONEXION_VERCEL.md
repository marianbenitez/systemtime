# Guía de Conexión con Vercel

Esta guía te ayudará a conectar y desplegar tu proyecto en Vercel.

## 📋 Prerrequisitos

1. ✅ Cuenta en [Vercel](https://vercel.com)
2. ✅ Proyecto en un repositorio Git (GitHub, GitLab o Bitbucket)
3. ✅ Variables de entorno configuradas localmente

## 🚀 Pasos para Conectar con Vercel

### Opción 1: Conectar desde Vercel Dashboard (Recomendado)

#### Paso 1: Iniciar Sesión en Vercel

1. Ve a [https://vercel.com](https://vercel.com)
2. Inicia sesión con tu cuenta (GitHub, GitLab, Bitbucket o email)

#### Paso 2: Importar Proyecto

1. En el Dashboard, haz clic en **"Add New..."** → **"Project"**
2. Selecciona tu repositorio de Git
3. Si no aparece, haz clic en **"Adjust GitHub App Permissions"** para dar acceso

#### Paso 3: Configurar el Proyecto

Vercel detectará automáticamente que es un proyecto Next.js. Verifica:

- **Framework Preset**: `Next.js`
- **Root Directory**: `./` (raíz del proyecto)
- **Build Command**: `prisma generate && next build` (ya configurado en `vercel.json`)
- **Output Directory**: `.next` (automático)
- **Install Command**: `npm install` (automático)

#### Paso 4: Configurar Variables de Entorno

**⚠️ IMPORTANTE**: Configura estas variables ANTES del primer despliegue:

1. En la sección **"Environment Variables"**, agrega:

```bash
# Base de Datos
DATABASE_URL=postgresql://postgres.jmxlkjcfzwfsduthiyzm:System%402025@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL=postgresql://postgres.jmxlkjcfzwfsduthiyzm:System%402025@aws-0-us-west-2.pooler.supabase.com:5432/postgres

# NextAuth
NEXTAUTH_URL=https://tu-proyecto.vercel.app
NEXTAUTH_SECRET=hX/N5Io2qeV/pgbVBYdEa/9BaAp1Deo8sgz3/8w+cDQ=

# Opcional: Node Environment
NODE_ENV=production
```

2. **Marca todas las opciones**: Production, Preview, Development
3. **IMPORTANTE**: Reemplaza `https://tu-proyecto.vercel.app` con la URL real que Vercel te asigne

#### Paso 5: Desplegar

1. Haz clic en **"Deploy"**
2. Espera 2-3 minutos mientras Vercel:
   - Instala dependencias
   - Genera Prisma Client
   - Construye la aplicación
   - Despliega

#### Paso 6: Actualizar NEXTAUTH_URL

Después del primer despliegue:

1. Ve a **Settings** → **Environment Variables**
2. Edita `NEXTAUTH_URL` con la URL real de tu proyecto
3. Haz clic en **"Redeploy"** en el último deployment

### Opción 2: Conectar desde la Terminal (CLI)

#### Paso 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

#### Paso 2: Iniciar Sesión

```bash
vercel login
```

#### Paso 3: Desplegar

```bash
# Desde la raíz del proyecto
vercel
```

Sigue las instrucciones:
- ¿Set up and deploy? → **Y**
- ¿Which scope? → Selecciona tu cuenta
- ¿Link to existing project? → **N** (primera vez) o **Y** (si ya existe)
- ¿What's your project's name? → `systemtime` (o el nombre que prefieras)
- ¿In which directory is your code located? → `./`

#### Paso 4: Configurar Variables de Entorno

```bash
# Agregar variables una por una
vercel env add DATABASE_URL
vercel env add DIRECT_URL
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
```

O agrega todas desde el Dashboard en **Settings** → **Environment Variables**

#### Paso 5: Desplegar a Producción

```bash
vercel --prod
```

## 🔧 Configuración Post-Despliegue

### 1. Verificar el Despliegue

Una vez desplegado, verifica:

- ✅ La aplicación carga: `https://tu-proyecto.vercel.app`
- ✅ El endpoint MCP funciona: `https://tu-proyecto.vercel.app/api/mcp`
- ✅ La base de datos conecta: `https://tu-proyecto.vercel.app/api/health`

### 2. Probar el Endpoint MCP

```bash
# Local
node scripts/test-mcp.js https://tu-proyecto.vercel.app
```

O manualmente:

```bash
curl https://tu-proyecto.vercel.app/api/mcp
```

### 3. Configurar Dominio Personalizado (Opcional)

1. Ve a **Settings** → **Domains**
2. Agrega tu dominio personalizado
3. Sigue las instrucciones para configurar DNS

## 📝 Variables de Entorno Requeridas

| Variable | Descripción | Ejemplo |
|-----------|-------------|---------|
| `DATABASE_URL` | URL de conexión a Supabase (con pooler) | `postgresql://...?pgbouncer=true` |
| `DIRECT_URL` | URL directa a Supabase (para migraciones) | `postgresql://...:5432/...` |
| `NEXTAUTH_URL` | URL completa de tu app en Vercel | `https://systemtime.vercel.app` |
| `NEXTAUTH_SECRET` | Secret para NextAuth (generar con `openssl rand -base64 32`) | `hX/N5Io2qeV/...` |

## 🔍 Verificar el Estado

### Endpoints de Diagnóstico

```bash
# Health check
curl https://tu-proyecto.vercel.app/api/health

# Test database
curl https://tu-proyecto.vercel.app/api/test-db

# MCP endpoint
curl https://tu-proyecto.vercel.app/api/mcp
```

### Ver Logs en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Click en el último deployment
3. Click en **"View Function Logs"**
4. Revisa errores o advertencias

## 🐛 Solución de Problemas

### Error: "Failed to construct 'URL'"

**Causa**: `NEXTAUTH_URL` no está configurada o es incorrecta

**Solución**:
1. Ve a **Settings** → **Environment Variables**
2. Verifica que `NEXTAUTH_URL` sea exactamente: `https://tu-proyecto.vercel.app` (sin trailing slash)
3. Haz un **Redeploy**

### Error: "Prisma Client not generated"

**Causa**: Prisma Client no se generó durante el build

**Solución**:
1. Verifica que `vercel.json` tenga: `"buildCommand": "prisma generate && next build"`
2. Verifica que `package.json` tenga: `"postinstall": "prisma generate"`
3. Haz un **Redeploy**

### Error: "Database connection failed"

**Causa**: Variables de base de datos incorrectas o no configuradas

**Solución**:
1. Verifica `DATABASE_URL` y `DIRECT_URL` en **Settings** → **Environment Variables**
2. Asegúrate de que la contraseña esté codificada correctamente (`System%402025`)
3. Verifica que las variables estén habilitadas para Production, Preview y Development

### Build Falla

**Causa**: Dependencias o errores de TypeScript

**Solución**:
1. Revisa los logs del build en Vercel
2. Prueba localmente: `npm run build`
3. Corrige errores antes de hacer commit y push

## 🔄 Actualizar el Despliegue

### Automático (Recomendado)

Cada vez que hagas `git push` a la rama principal, Vercel desplegará automáticamente.

### Manual

```bash
# Desde la terminal
vercel --prod

# O desde el Dashboard
# Deployments → ... → Redeploy
```

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Next.js en Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Variables de Entorno en Vercel](https://vercel.com/docs/environment-variables)
- [Prisma en Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

## ✅ Checklist Final

Antes de considerar el despliegue completo:

- [ ] Proyecto conectado a Vercel
- [ ] Variables de entorno configuradas
- [ ] `NEXTAUTH_URL` actualizada con la URL real
- [ ] Build exitoso
- [ ] Aplicación carga correctamente
- [ ] Endpoint MCP funciona: `/api/mcp`
- [ ] Conexión a base de datos funciona: `/api/health`
- [ ] Login funciona correctamente

---

**¡Listo!** Tu aplicación debería estar funcionando en Vercel. 🎉

