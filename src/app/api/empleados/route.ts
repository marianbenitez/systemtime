import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const empleados = await prisma.empleado.findMany({
      where: { activo: true },
      orderBy: [
        { apellido: 'asc' },
        { nombre: 'asc' }
      ]
    })

    return NextResponse.json(empleados)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener empleados' },
      { status: 500 }
    )
  }
}
