import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { leerExcelMarcaciones, validarEstructuraExcel } from '@/lib/excel/lector'
import { normalizarMarcacion, agruparPorEmpleado } from '@/lib/excel/normalizador'
import { procesarAsistenciaEmpleado } from '@/lib/asistencia/motor-calculo'

/**
 * Endpoint para importar AMBOS archivos (SIN ERRORES + CON ERRORES) simultáneamente
 *
 * Estrategia:
 * 1. Lee archivo SIN ERRORES → Extrae departamentos por DNI
 * 2. Lee archivo CON ERRORES → Obtiene marcaciones con análisis de errores
 * 3. Fusiona: Enriquece marcaciones CON ERRORES con departamentos
 * 4. Importa todo en una sola operación
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const archivoSinErrores = formData.get('archivoSinErrores') as File
    const archivoConErrores = formData.get('archivoConErrores') as File
    const fechaInicio = new Date(formData.get('fechaInicio') as string)
    const fechaFin = new Date(formData.get('fechaFin') as string)

    // Validar que se subieron ambos archivos
    if (!archivoSinErrores || !archivoConErrores) {
      return NextResponse.json(
        { error: 'Se requieren ambos archivos: Sin Errores y Con Errores' },
        { status: 400 }
      )
    }

    console.log('📊 Iniciando importación DUAL...')

    // ============================================
    // PASO 1: Leer archivo SIN ERRORES (para departamentos)
    // ============================================
    console.log('📄 Leyendo archivo SIN ERRORES...')
    const { datos: datosSinErrores, formato: formatoSinErrores } =
      await leerExcelMarcaciones(archivoSinErrores)

    if (formatoSinErrores !== 'SIN_ERRORES') {
      return NextResponse.json(
        { error: 'El primer archivo debe ser formato SIN ERRORES (Ac Reg del...)' },
        { status: 400 }
      )
    }

    validarEstructuraExcel(datosSinErrores, formatoSinErrores)

    // Crear diccionario de departamentos por DNI
    const departamentosPorDNI = new Map<string, string>()

    for (const row of datosSinErrores) {
      const marcacion = normalizarMarcacion(row, formatoSinErrores)
      if (marcacion && marcacion.departamento) {
        departamentosPorDNI.set(marcacion.numeroAC, marcacion.departamento)
      }
    }

    console.log(`✅ Extraídos departamentos de ${departamentosPorDNI.size} empleados`)

    // ============================================
    // PASO 2: Leer archivo CON ERRORES (para marcaciones)
    // ============================================
    console.log('📄 Leyendo archivo CON ERRORES...')
    const { datos: datosConErrores, formato: formatoConErrores } =
      await leerExcelMarcaciones(archivoConErrores)

    if (formatoConErrores !== 'CON_ERRORES') {
      return NextResponse.json(
        { error: 'El segundo archivo debe ser formato CON ERRORES (Marcaciones del...)' },
        { status: 400 }
      )
    }

    validarEstructuraExcel(datosConErrores, formatoConErrores)

    // ============================================
    // PASO 3: Fusionar datos
    // ============================================
    console.log('🔄 Fusionando datos...')
    const marcaciones = datosConErrores
      .map(row => {
        const marcacion = normalizarMarcacion(row, formatoConErrores)
        if (marcacion) {
          // Enriquecer con departamento del otro archivo
          const departamento = departamentosPorDNI.get(marcacion.numeroAC)
          if (departamento) {
            marcacion.departamento = departamento
          }
        }
        return marcacion
      })
      .filter((m): m is NonNullable<typeof m> => m !== null)

    console.log(`✅ ${marcaciones.length} marcaciones fusionadas`)

    // Contar empleados con departamento
    const empleadosConDepartamento = new Set(
      marcaciones.filter(m => m.departamento).map(m => m.numeroAC)
    ).size

    console.log(`✅ ${empleadosConDepartamento} empleados tienen departamento asignado`)

    // ============================================
    // PASO 4: Importar todo en una sola operación
    // ============================================
    console.log('💾 Guardando en base de datos...')

    const importacion = await prisma.importacion.create({
      data: {
        nombreArchivo: `DUAL: ${archivoSinErrores.name} + ${archivoConErrores.name}`,
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
        nombre: `${m.apellido}, ${m.nombre}`,
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
          departamento: primeraM.departamento // Incluye departamento fusionado
        },
        update: {
          nombre: primeraM.nombre,
          apellido: primeraM.apellido,
          numeroId: primeraM.numeroId,
          // Actualizar departamento si existe
          ...(primeraM.departamento && { departamento: primeraM.departamento })
        }
      })

      await procesarAsistenciaEmpleado(
        empleado.id,
        numeroAC,
        marcasEmpleado
      )
    }

    console.log('✅ Importación DUAL completada')

    return NextResponse.json({
      success: true,
      importacion,
      estadisticas: {
        totalMarcaciones: marcaciones.length,
        totalEmpleados: porEmpleado.size,
        empleadosConDepartamento,
        marcacionesValidas: marcaciones.filter(m => m.excepcion === 'FOT').length,
        marcacionesInvalidas: marcaciones.filter(m => m.excepcion === 'Invalido').length,
        marcacionesRepetidas: marcaciones.filter(m => m.excepcion === 'Repetido').length,
      },
      mensaje: `✅ Importación DUAL exitosa: ${marcaciones.length} marcaciones de ${porEmpleado.size} empleados (${empleadosConDepartamento} con departamento + análisis de errores)`
    })

  } catch (error) {
    console.error('❌ Error en importación DUAL:', error)
    return NextResponse.json(
      { error: (error as Error).message || 'Error al importar archivos' },
      { status: 500 }
    )
  }
}
