# Gestión de Usuarios

## Descripción

Módulo completo de gestión de usuarios (CRUD) accesible solo para usuarios con rol **SUPERADMIN**.

## Ubicación

- **Página Web**: `/dashboard/users`
- **API Routes**:
  - `GET /api/users` - Listar todos los usuarios
  - `POST /api/users` - Crear nuevo usuario
  - `PUT /api/users/[id]` - Actualizar usuario existente
  - `DELETE /api/users/[id]` - Eliminar usuario

## Acceso

⚠️ **Solo accesible para SUPERADMIN**

Si intentas acceder con otro rol, serás redirigido automáticamente al dashboard principal.

## Características

### 📋 Listar Usuarios

- Tabla completa con todos los usuarios del sistema
- Columnas: Nombre, Email, Rol, Fecha de Registro
- Badges de colores por rol:
  - 🟣 SUPERADMIN - Púrpura
  - 🔵 ADMIN - Azul
  - ⚪ USER - Gris
- Ordenados por fecha de registro (más recientes primero)

### ➕ Crear Usuario

**Campos requeridos:**
- ✅ Nombre completo
- ✅ Email (debe ser único)
- ✅ Contraseña (mínimo 6 caracteres)
- ✅ Rol (USER/ADMIN/SUPERADMIN)

**Validaciones:**
- Email único en el sistema
- Contraseña mínimo 6 caracteres
- Contraseña hasheada con bcrypt (seguridad)
- Todos los campos obligatorios

### ✏️ Editar Usuario

**Campos editables:**
- Nombre completo
- Email (verifica que no esté en uso por otro usuario)
- Contraseña (opcional - dejar vacío para mantener la actual)
- Rol

**Características:**
- Si no cambias la contraseña, se mantiene la actual
- Nueva contraseña debe tener mínimo 6 caracteres
- Email debe ser único (excepto el propio)

### 🗑️ Eliminar Usuario

**Protecciones:**
- ❌ No puedes eliminar tu propio usuario (protección)
- ⚠️ Requiere confirmación antes de eliminar
- 🔗 Eliminación en cascada: borra también las asistencias del usuario

## Roles y Permisos

### SUPERADMIN
- ✅ Acceso completo a gestión de usuarios
- ✅ Puede crear/editar/eliminar cualquier usuario
- ✅ Puede cambiar roles de usuarios
- ✅ Puede crear otros SUPERADMIN

### ADMIN
- ❌ No puede acceder a gestión de usuarios
- ✅ Puede gestionar asistencias
- ✅ Puede usar sistema biométrico

### USER
- ❌ No puede acceder a gestión de usuarios
- ✅ Solo puede ver su propia asistencia

## UI/UX

### Tabla de Usuarios

```
┌─────────────┬──────────────────┬────────────┬────────────────┬──────────┐
│ Nombre      │ Email            │ Rol        │ Fecha Registro │ Acciones │
├─────────────┼──────────────────┼────────────┼────────────────┼──────────┤
│ Juan Pérez  │ juan@email.com   │ SUPERADMIN │ 20/11/2025    │ ✏️ 🗑️    │
│ Ana García  │ ana@email.com    │ ADMIN      │ 19/11/2025    │ ✏️ 🗑️    │
│ Pedro López │ pedro@email.com  │ USER       │ 18/11/2025    │ ✏️ 🗑️    │
└─────────────┴──────────────────┴────────────┴────────────────┴──────────┘
```

### Diálogo de Crear/Editar

- **Modo Crear**: Todos los campos requeridos (incluyendo contraseña)
- **Modo Editar**: Contraseña opcional (mantiene la actual si está vacía)
- Selector de rol con descripciones:
  - USER: Puede ver su propia asistencia
  - ADMIN: Puede gestionar asistencias y sistema biométrico
  - SUPERADMIN: Acceso total al sistema

## Seguridad

### Validaciones de Backend

✅ Verificación de sesión en todas las rutas
✅ Verificación de rol SUPERADMIN en todas las operaciones
✅ Passwords hasheados con bcrypt (10 rounds)
✅ Emails únicos validados antes de crear/editar
✅ Protección contra eliminar el propio usuario
✅ Validación de longitud de contraseña (mínimo 6)
✅ Sanitización de inputs

### Validaciones de Frontend

✅ Todos los campos requeridos marcados
✅ Tipo de input correcto (email, password)
✅ Mensajes de error claros y específicos
✅ Confirmación antes de eliminar
✅ Estados de carga durante operaciones
✅ Deshabilitación de botones durante operaciones

## Ejemplos de Uso

### Crear un Nuevo Administrador

1. Ve a `/dashboard/users`
2. Click en "Nuevo Usuario"
3. Completa el formulario:
   - Nombre: "María Rodríguez"
   - Email: "maria@escuela.edu"
   - Contraseña: "maria2025"
   - Rol: ADMIN
4. Click en "Crear Usuario"
5. El usuario aparecerá en la tabla

### Cambiar el Rol de un Usuario

1. En la tabla, busca el usuario
2. Click en el botón de editar (✏️)
3. Cambia el rol en el selector
4. Click en "Guardar Cambios"
5. El badge de rol se actualizará

### Eliminar un Usuario

1. En la tabla, busca el usuario
2. Click en el botón de eliminar (🗑️)
3. Confirma la eliminación en el diálogo
4. El usuario desaparece de la tabla
5. Sus asistencias también se eliminan (cascade)

## Estructura de Código

```
src/
├── app/
│   ├── api/
│   │   └── users/
│   │       ├── route.ts           # GET (list), POST (create)
│   │       └── [id]/
│   │           └── route.ts       # PUT (update), DELETE (delete)
│   └── dashboard/
│       └── users/
│           └── page.tsx           # Página principal
└── components/
    └── users/
        └── user-dialog.tsx        # Diálogo crear/editar
```

## API Responses

### GET /api/users

```json
[
  {
    "id": "cm123abc...",
    "email": "juan@email.com",
    "name": "Juan Pérez",
    "role": "SUPERADMIN",
    "createdAt": "2025-11-20T10:00:00.000Z"
  }
]
```

### POST /api/users

**Request:**
```json
{
  "email": "nuevo@email.com",
  "password": "password123",
  "name": "Nuevo Usuario",
  "role": "USER"
}
```

**Response (201):**
```json
{
  "id": "cm123xyz...",
  "email": "nuevo@email.com",
  "name": "Nuevo Usuario",
  "role": "USER",
  "createdAt": "2025-11-20T10:30:00.000Z"
}
```

### PUT /api/users/[id]

**Request:**
```json
{
  "email": "actualizado@email.com",
  "password": "newpassword",  // Opcional
  "name": "Nombre Actualizado",
  "role": "ADMIN"
}
```

**Response (200):**
```json
{
  "id": "cm123xyz...",
  "email": "actualizado@email.com",
  "name": "Nombre Actualizado",
  "role": "ADMIN",
  "createdAt": "2025-11-20T10:00:00.000Z"
}
```

### DELETE /api/users/[id]

**Response (200):**
```json
{
  "success": true,
  "message": "Usuario eliminado correctamente"
}
```

## Errores Comunes

### 401 - No Autenticado
```json
{ "error": "No autenticado" }
```
**Solución**: Asegúrate de estar logueado

### 403 - No Autorizado
```json
{ "error": "No autorizado. Solo SUPERADMIN puede gestionar usuarios." }
```
**Solución**: Solo usuarios con rol SUPERADMIN pueden acceder

### 400 - Email Ya Existe
```json
{ "error": "El email ya está registrado" }
```
**Solución**: Usa un email diferente

### 400 - No Puedes Eliminarte
```json
{ "error": "No puedes eliminar tu propio usuario" }
```
**Solución**: Pide a otro SUPERADMIN que te elimine (o usa otro usuario)

### 404 - Usuario No Encontrado
```json
{ "error": "Usuario no encontrado" }
```
**Solución**: Verifica que el ID del usuario sea correcto

## Testing

Para probar la funcionalidad:

1. **Crea un usuario SUPERADMIN** (si no existe):
   ```bash
   # Usar /auth/register o crear directamente en DB
   ```

2. **Login como SUPERADMIN**

3. **Navega a** `/dashboard/users`

4. **Prueba las operaciones**:
   - ✅ Crear un nuevo usuario
   - ✅ Editar el usuario creado
   - ✅ Cambiar su rol
   - ✅ Eliminar el usuario
   - ✅ Intentar eliminar tu propio usuario (debe fallar)

## Próximas Mejoras

Ideas para futuras versiones:

- [ ] Filtros y búsqueda en la tabla
- [ ] Paginación para muchos usuarios
- [ ] Exportar lista de usuarios a CSV/Excel
- [ ] Log de auditoría de cambios de usuarios
- [ ] Reseteo de contraseña por email
- [ ] Activar/desactivar usuarios (soft delete)
- [ ] Permisos granulares por módulo

---

**Fecha de creación**: 2025-11-20
**Versión**: 1.0.0
**Autor**: Claude Code
