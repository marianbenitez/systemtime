import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test 1: Conexión básica
    await prisma.$connect()

    // Test 2: Contar usuarios
    const userCount = await prisma.user.count()

    // Test 3: Verificar tablas
    const empleadoCount = await prisma.empleado.count()
    const marcacionCount = await prisma.marcacionRaw.count()

    // Test 4: Info de BD
    const dbInfo = await prisma.$queryRaw<Array<{
      current_database: string
      current_user: string
      version: string
    }>>`
      SELECT
        current_database() as current_database,
        current_user as current_user,
        version() as version
    `

    return NextResponse.json({
      status: 'connected',
      message: '✅ Conexión exitosa a Supabase',
      database: {
        name: dbInfo[0].current_database,
        user: dbInfo[0].current_user,
        version: dbInfo[0].version.split(',')[0]
      },
      counts: {
        users: userCount,
        empleados: empleadoCount,
        marcaciones: marcacionCount
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDirectUrl: !!process.env.DIRECT_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET
      },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Database test error:', error)

    return NextResponse.json({
      status: 'error',
      message: error.message || 'Error de conexión',
      error: {
        name: error.name,
        code: error.code,
        meta: error.meta
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDirectUrl: !!process.env.DIRECT_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
