import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Intentar una consulta simple a la base de datos
    const userCount = await prisma.user.count()
    
    return NextResponse.json({
      status: 'ok',
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
      userCount,
      env: process.env.NODE_ENV
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Database connection failed',
        error: (error as Error).message
      },
      { status: 500 }
    )
  }
}
