# Estado de Conexión: Supabase + Vercel

**Fecha:** 19 de Noviembre de 2025
**Proyecto:** Sistema de Control de Asistencia

---

## ✅ SUPABASE - Conectado

### Información del Proyecto
- **Project ID:** `jmxlkjcfzwfsduthiyzm`
- **Region:** US West 2 (Oregon)
- **URL:** https://jmxlkjcfzwfsduthiyzm.supabase.co
- **Host:** aws-0-us-west-2.pooler.supabase.com

### Estado de Conexión
| Componente | Estado | Detalles |
|------------|--------|----------|
| **Schema Prisma** | ✅ Configurado | PostgreSQL con directUrl |
| **Cliente Prisma** | ✅ Generado | v6.19.0 en src/generated/prisma |
| **Migraciones** | ✅ Aplicadas | 1 migración aplicada exitosamente |
| **Base de Datos** | ✅ Sincronizada | Todas las tablas creadas |
| **Seed** | ⚠️ Pendiente | Error con variables de entorno |

### Variables de Entorno Configuradas
```env
DATABASE_URL="postgresql://postgres.jmxlkjcfzwfsduthiyzm:System%402025@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.jmxlkjcfzwfsduthiyzm:System%402025@aws-0-us-west-2.pooler.supabase.com:5432/postgres"
```

### Tablas Creadas en Supabase
1. ✅ `users` - Sistema de usuarios con roles
2. ✅ `attendances` - Asistencias manuales
3. ✅ `accounts` - NextAuth accounts
4. ✅ `sessions` - NextAuth sessions
5. ✅ `verification_tokens` - NextAuth tokens
6. ✅ `empleados` - Empleados del sistema biométrico
7. ✅ `marcaciones_raw` - Marcaciones crudas del reloj
8. ✅ `asistencia_diaria` - Asistencias procesadas diarias
9. ✅ `resumen_mensual` - Resúmenes mensuales
10. ✅ `importaciones` - Historial de importaciones
11. ✅ `informes` - Metadatos de informes PDF

---

## 🔄 VERCEL - Estado

### Repositorio GitHub
- **URL:** git@github.com:marianbenitez/systemtime.git
- **Remote:** origin (configurado)
- **Estado:** ✅ Conectado

### Estado de Despliegue en Vercel
- **Proyecto en Vercel:** ❓ Por verificar
- **Último deploy:** ❓ Por verificar
- **URL de producción:** ❓ Por asignar

### Para Conectar con Vercel

Si aún no has conectado con Vercel, sigue estos pasos:

#### Opción A: Desde Vercel Dashboard
1. Ve a https://vercel.com/new
2. Importa tu repositorio: `marianbenitez/systemtime`
3. Configurar variables de entorno (ver sección abajo)
4. Deploy

#### Opción B: Desde CLI
```bash
npm i -g vercel
vercel login
vercel
```

---

## 🔑 Variables de Entorno para Vercel

Cuando conectes con Vercel, necesitas agregar estas variables en:
**Vercel Dashboard > Tu Proyecto > Settings > Environment Variables**

### Variables Requeridas:

```env
# Database - Supabase
DATABASE_URL=postgresql://postgres.jmxlkjcfzwfsduthiyzm:System%402025@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL=postgresql://postgres.jmxlkjcfzwfsduthiyzm:System%402025@aws-0-us-west-2.pooler.supabase.com:5432/postgres

# NextAuth
NEXTAUTH_URL=https://tu-proyecto.vercel.app
NEXTAUTH_SECRET=<generar-nuevo-con-openssl-rand-base64-32>

# Application
NODE_ENV=production
```

⚠️ **IMPORTANTE:**
- Genera un nuevo `NEXTAUTH_SECRET` para producción
- Actualiza `NEXTAUTH_URL` con tu URL de Vercel

---

## 🚀 Próximos Pasos

### 1. Resolver Seed en Supabase
El seed está fallando. Opciones:

**Opción A: Crear usuarios manualmente en Supabase Studio**
1. Ve a https://supabase.com/dashboard/project/jmxlkjcfzwfsduthiyzm
2. Ve a Table Editor > users
3. Insert row > Agregar manualmente los 3 usuarios

**Opción B: Ejecutar SQL directo**
```sql
-- Ejecutar en Supabase SQL Editor
INSERT INTO users (id, email, name, password, role, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'superadmin@example.com', 'Super Administrador', '$2a$10$hashedpassword', 'SUPERADMIN', NOW(), NOW()),
  (gen_random_uuid(), 'admin@example.com', 'Administrador', '$2a$10$hashedpassword', 'ADMIN', NOW(), NOW()),
  (gen_random_uuid(), 'user@example.com', 'Usuario Regular', '$2a$10$hashedpassword', 'USER', NOW(), NOW());
```

### 2. Conectar con Vercel

**Si ya tienes cuenta en Vercel:**
1. Importa el repositorio desde GitHub
2. Configura las variables de entorno
3. Deploy

**Si NO tienes cuenta:**
1. Crea cuenta en https://vercel.com (usa GitHub OAuth)
2. Sigue los pasos de arriba

### 3. Verificar Deploy

Una vez desplegado:
```bash
# Ver logs
vercel logs tu-proyecto.vercel.app --follow

# Ver estado
vercel ls
```

---

## 🧪 Testing Local

Para probar localmente antes de deploy:

```bash
# 1. Instalar dependencias
npm install

# 2. Generar cliente Prisma (ya hecho)
npx prisma generate

# 3. Iniciar servidor
npm run dev

# 4. Abrir navegador
# http://localhost:3000
```

---

## ✅ Checklist de Verificación

### Supabase
- [x] Proyecto creado
- [x] Credenciales obtenidas
- [x] Variables de entorno configuradas
- [x] Schema sincronizado
- [x] Tablas creadas
- [ ] Usuarios seed creados

### Vercel
- [x] Repositorio en GitHub
- [ ] Proyecto importado en Vercel
- [ ] Variables de entorno configuradas
- [ ] Primer deploy exitoso
- [ ] URL de producción asignada

### Aplicación
- [ ] Login funciona
- [ ] Dashboard carga correctamente
- [ ] Importación de Excel funciona
- [ ] Generación de PDF funciona

---

## 📞 Soporte

### Supabase
- Dashboard: https://supabase.com/dashboard/project/jmxlkjcfzwfsduthiyzm
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com/

### Vercel
- Dashboard: https://vercel.com/dashboard
- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord

### GitHub Repository
- URL: https://github.com/marianbenitez/systemtime
- Issues: https://github.com/marianbenitez/systemtime/issues

---

**Última Actualización:** 19 Nov 2025, 13:00 ART
