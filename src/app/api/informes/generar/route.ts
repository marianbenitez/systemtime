import { NextRequest, NextResponse } from 'next/server'
import { generarInformePDF } from '@/lib/pdf/generador-informes'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { empleadoId, fechaInicio, fechaFin, modo } = body

    const resultado = await generarInformePDF({
      empleadoId: parseInt(empleadoId),
      fechaInicio: new Date(fechaInicio),
      fechaFin: new Date(fechaFin),
      modo
    })

    const filePath = join(process.cwd(), 'public', 'informes', resultado.nombreArchivo)
    await writeFile(filePath, Buffer.from(resultado.buffer))

    return NextResponse.json({
      success: true,
      url: `/informes/${resultado.nombreArchivo}`,
      nombreArchivo: resultado.nombreArchivo
    })

  } catch (error) {
    console.error('Error generando informe:', error)
    return NextResponse.json(
      { error: (error as Error).message || 'Error al generar informe' },
      { status: 500 }
    )
  }
}
