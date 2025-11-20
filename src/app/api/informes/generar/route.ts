import { NextRequest, NextResponse } from 'next/server'
import { generarInformePDF } from '@/lib/pdf/generador-informes'

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

    // Return the PDF buffer directly
    return new NextResponse(resultado.buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${resultado.nombreArchivo}"`
      }
    })

  } catch (error) {
    console.error('Error generando informe:', error)
    return NextResponse.json(
      { error: (error as Error).message || 'Error al generar informe' },
      { status: 500 }
    )
  }
}
