import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { leerExcelMarcaciones, validarEstructuraExcel } from '@/lib/excel/lector'
import { normalizarMarcacion, agruparPorEmpleado } from '@/lib/excel/normalizador'
import { procesarAsistenciaEmpleado } from '@/lib/asistencia/motor-calculo'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const archivoMarcaciones = formData.get('archivoMarcaciones') as File
    const fechaInicio = new Date(formData.get('fechaInicio') as string)
    const fechaFin = new Date(formData.get('fechaFin') as string)

    if (!archivoMarcaciones) {
      return NextResponse.json(
        { error: 'Archivo de marcaciones requerido' },
        { status: 400 }
      )
    }

    // Leer Excel con detección automática de formato
    const { datos: datosExcel, formato } = await leerExcelMarcaciones(archivoMarcaciones)

    console.log(`📊 Formato detectado: ${formato}`)
    console.log(`📊 Total de registros: ${datosExcel.length}`)

    validarEstructuraExcel(datosExcel, formato)

    const marcaciones = datosExcel
      .map(row => normalizarMarcacion(row, formato))
      .filter((m): m is NonNullable<typeof m> => m !== null)

    const importacion = await prisma.importacion.create({
      data: {
        nombreArchivo: archivoMarcaciones.name,
        tipoArchivo: 'marcaciones',
        fechaInicio,
        fechaFin,
        totalRegistros: marcaciones.length,
        registrosValidos: marcaciones.filter(m => m.excepcion === 'FOT').length,
        registrosInvalidos: marcaciones.filter(m => m.excepcion !== 'FOT').length
      }
    })

    await prisma.marcacionRaw.createMany({
      data: marcaciones.map(m => ({
        numeroAC: m.numeroAC,
        nombre: `${m.apellido}, ${m.nombre}`, // Guardar nombre completo
        fechaHora: m.fechaHora,
        estado: m.estado,
        excepcion: m.excepcion,
        nuevoEstado: m.nuevoEstado,
        operacion: m.operacion,
        importacionId: importacion.id
      }))
    })

    const porEmpleado = agruparPorEmpleado(marcaciones)

    for (const [numeroAC, marcasEmpleado] of porEmpleado.entries()) {
      const primeraM = marcasEmpleado[0]

      const empleado = await prisma.empleado.upsert({
        where: { numeroAC },
        create: {
          numeroAC,
          numeroId: primeraM.numeroId,
          nombre: primeraM.nombre,
          apellido: primeraM.apellido,
          departamento: primeraM.departamento // Se incluirá si existe (formato sin errores)
        },
        update: {
          nombre: primeraM.nombre,
          apellido: primeraM.apellido,
          numeroId: primeraM.numeroId,
          // Solo actualizar departamento si viene en el archivo (no sobrescribir con undefined)
          ...(primeraM.departamento && { departamento: primeraM.departamento })
        }
      })

      await procesarAsistenciaEmpleado(
        empleado.id,
        numeroAC,
        marcasEmpleado
      )
    }

    return NextResponse.json({
      success: true,
      importacion,
      formato,
      mensaje: `Se procesaron ${marcaciones.length} marcaciones de ${porEmpleado.size} empleados (Formato: ${formato === 'CON_ERRORES' ? 'CON ERRORES' : 'SIN ERRORES'})`
    })

  } catch (error) {
    console.error('Error en importación:', error)
    return NextResponse.json(
      { error: (error as Error).message || 'Error al importar marcaciones' },
      { status: 500 }
    )
  }
}
