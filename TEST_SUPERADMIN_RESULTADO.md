# Test de Conexión con Superadmin

**Fecha:** 19 de Noviembre de 2025
**Estado:** 🟢 Listo para probar

---

## 📊 Resumen

### ✅ Lo que sabemos que funciona:
1. **Conexión a Supabase:** ✅ Funcionando
2. **Prisma Schema:** ✅ Sincronizado
3. **Tablas creadas:** ✅ 11 tablas
4. **Prisma Studio:** ✅ Conecta correctamente
5. **Variables de entorno:** ✅ Configuradas

### 📝 Lo que mencionaste:
> "los usuarios estan en supabase"

Esto significa que **YA CREASTE** los usuarios directamente en Supabase, lo cual es perfecto.

---

## 🧪 Prueba Recomendada

La mejor forma de verificar la conexión con superadmin es **probando el login directamente**:

### Paso 1: Iniciar la aplicación
```bash
cd /home/marianob/proyectos/systemtime
npm run dev
```

### Paso 2: Abrir navegador
```
http://localhost:3000/auth/login
```

### Paso 3: Iniciar sesión
```
Email: superadmin@example.com
Password: [la que configuraste en Supabase]
```

**Nota:** Si usaste el seed original, la contraseña es `password123`

---

## 🔍 Verificación Alternativa con Prisma Studio

Si quieres verificar los usuarios sin iniciar la app:

```bash
npx prisma studio
```

1. Abre http://localhost:5555
2. Ve a la tabla `users`
3. Deberías ver:
   - superadmin@example.com (SUPERADMIN)
   - admin@example.com (ADMIN)
   - user@example.com (USER)

---

## 🎯 Próximos Pasos

### Opción A: Probar el Login (Recomendado)
1. Ejecuta `npm run dev`
2. Ve a http://localhost:3000/auth/login
3. Ingresa credenciales de superadmin
4. Verifica que entras al dashboard

### Opción B: Verificar desde SQL
En Supabase SQL Editor:
```sql
SELECT email, name, role, "createdAt"
FROM users
WHERE email = 'superadmin@example.com';
```

### Opción C: API Test
Crear un endpoint temporal para probar:
```bash
curl http://localhost:3000/api/test-connection
```

---

## ✅ Checklist de Verificación

Una vez que inicies sesión con superadmin, verifica:

### Dashboard
- [ ] Dashboard principal carga
- [ ] Muestra estadísticas
- [ ] Navegación funciona

### Permisos de SUPERADMIN
- [ ] Puede acceder a "Usuarios" (sidebar)
- [ ] Puede acceder a "Asistencias"
- [ ] Puede acceder a "Marcaciones Biométrico"
- [ ] Puede acceder a "Empleados Biométrico"
- [ ] Puede acceder a "Informes"

### Funcionalidades
- [ ] Puede crear usuarios
- [ ] Puede registrar asistencias
- [ ] Puede importar archivos Excel
- [ ] Puede generar reportes PDF

---

## 🐛 Troubleshooting

### Si el login falla:

**Error 1: "Invalid credentials"**
- La contraseña en Supabase no coincide
- Verifica en Prisma Studio el hash de la contraseña
- Resetea la contraseña si es necesario

**Error 2: "User not found"**
- El usuario no existe en la tabla `users`
- Créalo manualmente en Supabase Studio
- O ejecuta el seed (si las variables de entorno funcionan)

**Error 3: "Database connection error"**
- Verifica DATABASE_URL en .env
- Regenera el cliente Prisma: `npx prisma generate`

### Resetear contraseña de superadmin

Si necesitas resetear la contraseña:

1. **Opción A: En Supabase SQL Editor**
```sql
-- Hash para "password123"
UPDATE users
SET password = '$2a$10$eKJ5gZ8rXq3W7hYK.kXxNeBLV4qGkWFH6z4cCzLZfT2dQP5OxJG5.'
WHERE email = 'superadmin@example.com';
```

2. **Opción B: Generar nuevo hash**
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('password123', 10));"
```
Luego actualiza en Supabase Studio.

---

## 🎉 Éxito Esperado

Cuando todo funcione, deberías ver:

```
✅ Login exitoso
✅ Redirigido a /dashboard
✅ Sidebar muestra todas las opciones (SUPERADMIN)
✅ Puede navegar por todos los módulos
✅ Puede crear/editar/eliminar usuarios
```

---

## 📞 Si necesitas ayuda

Si algo no funciona:
1. Verifica los logs del servidor: `npm run dev` (en la terminal)
2. Abre DevTools del navegador (F12) y ve a Console
3. Verifica Network tab para ver errores de API

---

**Estado Actual:** 🟢 Sistema listo para probar
**Acción Recomendada:** Ejecutar `npm run dev` y probar login
**Credenciales:** superadmin@example.com / password123 (o la que configuraste)
