# Servidor MCP para Vercel

Servidor MCP (Model Context Protocol) implementado para el Sistema de Asistencia Biométrico.

## 📋 Descripción

Este servidor MCP proporciona herramientas para interactuar con el sistema de asistencia biométrico a través del protocolo MCP estándar.

## 🚀 Endpoint

```
GET/POST /api/mcp
```

## 🛠️ Herramientas Disponibles

### 1. `get_system_info`
Obtiene información general del sistema de asistencia.

**Parámetros:** Ninguno

**Ejemplo:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_system_info",
    "arguments": {}
  }
}
```

### 2. `get_empleados_count`
Obtiene el número de empleados activos en el sistema.

**Parámetros:** Ninguno

**Ejemplo:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "get_empleados_count",
    "arguments": {}
  }
}
```

### 3. `get_users_count`
Obtiene el número total de usuarios del sistema.

**Parámetros:** Ninguno

**Ejemplo:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "get_users_count",
    "arguments": {}
  }
}
```

## 📖 Uso

### Obtener información del servidor (GET)

```bash
curl http://localhost:3000/api/mcp
```

### Listar herramientas disponibles

```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }'
```

### Inicializar el servidor MCP

```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {}
  }'
```

### Llamar una herramienta

```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_system_info",
      "arguments": {}
    }
  }'
```

## 🧪 Pruebas

Para probar el servidor MCP, ejecuta:

```bash
node scripts/test-mcp.js [url]
```

Ejemplo:
```bash
# Local
node scripts/test-mcp.js http://localhost:3000

# Producción (Vercel)
node scripts/test-mcp.js https://systemtime.vercel.app
```

## 📦 Dependencias

- `@modelcontextprotocol/sdk` - SDK oficial de MCP

## 🔧 Protocolo

El servidor implementa el protocolo MCP versión `2024-11-05` usando JSON-RPC 2.0.

### Formato de Respuesta

Todas las respuestas siguen el formato JSON-RPC 2.0:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    // Resultado de la operación
  }
}
```

En caso de error:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32601,
    "message": "Método no encontrado"
  }
}
```

## 🌐 Despliegue en Vercel

El endpoint MCP está listo para desplegarse en Vercel. No requiere configuración adicional.

Una vez desplegado, el endpoint estará disponible en:
```
https://tu-proyecto.vercel.app/api/mcp
```

## 📝 Notas

- El servidor MCP está diseñado para funcionar tanto en desarrollo local como en producción en Vercel
- Todas las herramientas acceden a la base de datos a través de Prisma
- Las respuestas incluyen timestamps para facilitar el debugging





