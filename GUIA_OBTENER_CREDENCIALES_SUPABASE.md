# Guía: Cómo Obtener Credenciales de Supabase

## 🔍 Método 1: Desde Database Settings (Recomendado)

### Paso a Paso:

1. **Ir a tu proyecto en Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/[TU-PROJECT-ID]

2. **Navegar a Settings**
   - Click en el ícono de ⚙️ **Settings** (abajo a la izquierda)

3. **Ir a Database**
   - En el menú lateral, click en **Database**

4. **Buscar la sección "Connection Parameters"**
   Deberías ver algo como:
   ```
   Host: db.[proyecto-ref].supabase.co
   Database name: postgres
   Port: 5432 (Direct) / 6543 (Pooler)
   User: postgres.[proyecto-ref]
   Password: [tu-password]
   ```

5. **Construir las URLs manualmente:**

   **DATABASE_URL (Connection Pooling - puerto 6543):**
   ```
   postgresql://postgres.[proyecto-ref]:[PASSWORD]@db.[proyecto-ref].supabase.co:6543/postgres?pgbouncer=true
   ```

   **DIRECT_URL (Direct Connection - puerto 5432):**
   ```
   postgresql://postgres.[proyecto-ref]:[PASSWORD]@db.[proyecto-ref].supabase.co:5432/postgres
   ```

   Donde:
   - `[proyecto-ref]` = Tu project reference (ej: `abc123def456`)
   - `[PASSWORD]` = La contraseña que configuraste al crear el proyecto

---

## 🔍 Método 2: Desde API Settings

Si no encuentras la información en Database:

1. **Ir a Settings > API**
   - Aquí encontrarás:
     - Project URL
     - Project API keys (anon public, service_role)

2. **Construir la URL desde Project URL**

   Si tu Project URL es: `https://abc123def456.supabase.co`

   Entonces:
   - Project Reference = `abc123def456`
   - Host = `db.abc123def456.supabase.co`

3. **Usar el formato:**
   ```
   DATABASE_URL="postgresql://postgres.abc123def456:[PASSWORD]@db.abc123def456.supabase.co:6543/postgres?pgbouncer=true"

   DIRECT_URL="postgresql://postgres.abc123def456:[PASSWORD]@db.abc123def456.supabase.co:5432/postgres"
   ```

---

## 🔍 Método 3: Usando SQL Editor de Supabase

1. **Ir a SQL Editor** en el dashboard de Supabase

2. **Ejecutar esta query para obtener información de conexión:**
   ```sql
   SELECT current_database(), current_user, inet_server_addr(), inet_server_port();
   ```

3. **Esto te mostrará:**
   - Database: `postgres`
   - User: El usuario actual
   - Host IP: La IP del servidor
   - Port: El puerto actual

---

## 📝 Información que Necesitas

Para completar la configuración, necesitas:

1. ✅ **Project Reference ID**
   - Lo encuentras en la URL del proyecto
   - Formato: letras y números (ej: `abc123xyz456`)

2. ✅ **Database Password**
   - La que configuraste al crear el proyecto
   - **Si la olvidaste:** Puedes resetearla en Settings > Database > Database Password > Reset

3. ✅ **Region**
   - South America: `db.[ref].supabase.co`
   - US East: `db.[ref].supabase.co`
   - EU: `db.[ref].supabase.co`

---

## 🔐 Resetear Password (Si la Olvidaste)

1. **Ir a Settings > Database**
2. **Buscar "Database Password"**
3. **Click en "Reset Database Password"**
4. **Generar nueva contraseña segura**
5. **Guardar la contraseña en lugar seguro**

⚠️ **IMPORTANTE:** Resetear la password invalidará todas las conexiones existentes.

---

## 🎯 Formato Final para .env

Una vez que tengas toda la información:

```env
# Database Configuration - Supabase PostgreSQL
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true"

# Direct Connection (Session Mode) - para migraciones
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="genera-uno-con-openssl-rand-base64-32"

# Application
NODE_ENV="development"
```

---

## ✅ Verificar Conexión

Una vez configurado, verifica la conexión:

```bash
# Test de conexión
npx prisma db pull

# Si funciona, verás:
# "Introspecting based on datasource defined in prisma/schema.prisma"
# "✔ Introspected X models and wrote them into prisma/schema.prisma"
```

---

## 🆘 Si Sigues Sin Encontrar las Credenciales

Si no puedes encontrar ninguna de estas opciones:

1. **Verificar que el proyecto esté activo**
   - Proyectos free se pausan después de 1 semana de inactividad
   - Ve a la página principal del proyecto y verifica el estado

2. **Crear un nuevo proyecto**
   - Si es un proyecto de prueba, considera crear uno nuevo
   - Supabase free tier permite 2 proyectos activos

3. **Contactar soporte de Supabase**
   - Discord: https://discord.supabase.com/
   - GitHub Discussions: https://github.com/supabase/supabase/discussions

---

## 📸 Capturas de Pantalla Esperadas

Deberías ver algo similar a esto en tu dashboard:

```
Settings > Database

Connection Info:
┌─────────────────────────────────────────┐
│ Host                                    │
│ db.xxxxxxxxxxxxx.supabase.co           │
├─────────────────────────────────────────┤
│ Database name                           │
│ postgres                                │
├─────────────────────────────────────────┤
│ Port                                    │
│ 5432                                    │
├─────────────────────────────────────────┤
│ User                                    │
│ postgres                                │
└─────────────────────────────────────────┘

Connection pooling:
☑ Enable connection pooling
Port: 6543
```

---

**¿Necesitas ayuda adicional?**
- Cuéntame qué ves exactamente en tu dashboard
- O comparte el Project Reference ID (no compartas la password)
