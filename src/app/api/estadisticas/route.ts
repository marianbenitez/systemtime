import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [
      totalEmpleados,
      totalMarcaciones,
      diasConErrores
    ] = await Promise.all([
      prisma.empleado.count({ where: { activo: true } }),
      prisma.marcacionRaw.count(),
      prisma.asistenciaDiaria.count({ where: { tieneErrores: true } })
    ])

    return NextResponse.json({
      totalEmpleados,
      totalMarcaciones,
      diasConErrores
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}
