import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Definir herramientas MCP disponibles
const TOOLS = [
  {
    name: 'get_system_info',
    description: 'Obtiene información del sistema de asistencia',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_empleados_count',
    description: 'Obtiene el número de empleados activos',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_users_count',
    description: 'Obtiene el número de usuarios del sistema',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
]

// Handler para llamar herramientas
async function callTool(name: string, args: any) {
  try {
    switch (name) {
      case 'get_system_info':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                name: 'Sistema de Asistencia Biométrico',
                version: '1.0.0',
                status: 'activo',
                timestamp: new Date().toISOString(),
              }, null, 2),
            },
          ],
        }

      case 'get_empleados_count':
        const { prisma } = await import('@/lib/prisma')
        const empleadosCount = await prisma.empleado.count({
          where: { activo: true },
        })
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                empleados_activos: empleadosCount,
                timestamp: new Date().toISOString(),
              }, null, 2),
            },
          ],
        }

      case 'get_users_count':
        const { prisma: prismaUsers } = await import('@/lib/prisma')
        const usersCount = await prismaUsers.user.count()
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                total_usuarios: usersCount,
                timestamp: new Date().toISOString(),
              }, null, 2),
            },
          ],
        }

      default:
        throw new Error(`Herramienta desconocida: ${name}`)
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${(error as Error).message}`,
        },
      ],
      isError: true,
    }
  }
}

// Handler para HTTP (adaptador para Vercel)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Manejar solicitudes JSON-RPC 2.0
    if (body.method) {
      let result

      switch (body.method) {
        case 'tools/list':
          result = {
            tools: TOOLS,
          }
          break

        case 'tools/call':
          const { name, arguments: args } = body.params || {}
          if (!name) {
            return NextResponse.json(
              {
                jsonrpc: '2.0',
                id: body.id,
                error: {
                  code: -32602,
                  message: 'Parámetros inválidos: se requiere "name"',
                },
              },
              { status: 200 }
            )
          }
          result = await callTool(name, args || {})
          break

        case 'initialize':
          result = {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {},
            },
            serverInfo: {
              name: 'systemtime-mcp',
              version: '0.1.0',
            },
          }
          break

        default:
          return NextResponse.json(
            {
              jsonrpc: '2.0',
              id: body.id,
              error: {
                code: -32601,
                message: `Método no encontrado: ${body.method}`,
              },
            },
            { status: 200 }
          )
      }

      return NextResponse.json({
        jsonrpc: '2.0',
        id: body.id,
        result,
      })
    }

    // Si no es JSON-RPC, devolver información del servidor
    return NextResponse.json({
      name: 'systemtime-mcp',
      version: '0.1.0',
      description: 'Servidor MCP para Sistema de Asistencia Biométrico',
      endpoints: {
        tools: '/api/mcp',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: 'Error procesando solicitud MCP',
          data: (error as Error).message,
        },
      },
      { status: 500 }
    )
  }
}

// GET para información del servidor
export async function GET() {
  return NextResponse.json({
    name: 'systemtime-mcp',
    version: '0.1.0',
    description: 'Servidor MCP para Sistema de Asistencia Biométrico',
    protocol: 'MCP 2024-11-05',
    capabilities: {
      tools: ['get_system_info', 'get_empleados_count', 'get_users_count'],
    },
    usage: {
      method: 'POST',
      endpoint: '/api/mcp',
      format: 'JSON-RPC 2.0',
      example: {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {},
      },
    },
  })
}

