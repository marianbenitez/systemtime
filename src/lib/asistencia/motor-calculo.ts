import { format, startOfDay, parse } from 'date-fns'
import { prisma } from '@/lib/prisma'
import { MarcacionNormalizada, AsistenciaDia } from '@/types/marcacion'
import { agruparPorFecha } from '@/lib/excel/normalizador'
import { detectarErroresDia } from './deteccion-errores'
import { armarParesEntradaSalida } from './armado-pares'
import { calcularHorasDia } from './calculo-horas'

export async function procesarAsistenciaEmpleado(
  empleadoId: number,
  numeroAC: string,
  marcaciones: MarcacionNormalizada[],
  modo: 'tolerante' | 'estricto' = 'tolerante'
): Promise<AsistenciaDia[]> {

  const porFecha = agruparPorFecha(marcaciones)
  const resultados: AsistenciaDia[] = []

  for (const [fechaStr, marcasDia] of porFecha.entries()) {
    const errores = detectarErroresDia(marcasDia)
    const pares = armarParesEntradaSalida(marcasDia)
    const horas = calcularHorasDia(pares, modo, errores)

    let observaciones = ''
    if (errores.length > 0) {
      observaciones = errores.map(e => e.descripcion).join('; ')
    }

    const asistencia: AsistenciaDia = {
      fecha: parse(fechaStr, 'yyyy-MM-dd', new Date()),
      pares,
      horasTrabajadas: horas,
      tieneErrores: errores.length > 0,
      errores,
      observaciones
    }

    resultados.push(asistencia)
    await guardarAsistenciaDiaria(empleadoId, asistencia)
  }

  await actualizarResumenMensual(empleadoId, resultados)

  return resultados
}

async function guardarAsistenciaDiaria(
  empleadoId: number,
  asistencia: AsistenciaDia
): Promise<void> {
  const pares = asistencia.pares

  await prisma.asistenciaDiaria.upsert({
    where: {
      unique_empleado_fecha: {
        empleadoId,
        fecha: startOfDay(asistencia.fecha)
      }
    },
    create: {
      empleadoId,
      fecha: startOfDay(asistencia.fecha),
      entrada1: pares[0]?.entrada || null,
      salida1: pares[0]?.salida || null,
      entrada2: pares[1]?.entrada || null,
      salida2: pares[1]?.salida || null,
      entrada3: pares[2]?.entrada || null,
      salida3: pares[2]?.salida || null,
      horasTrabajadas: asistencia.horasTrabajadas,
      tieneErrores: asistencia.tieneErrores,
      tipoError: asistencia.errores.map(e => e.tipo).join(', '),
      observaciones: asistencia.observaciones,
      marcacionesRaw: JSON.stringify(pares)
    },
    update: {
      entrada1: pares[0]?.entrada || null,
      salida1: pares[0]?.salida || null,
      entrada2: pares[1]?.entrada || null,
      salida2: pares[1]?.salida || null,
      entrada3: pares[2]?.entrada || null,
      salida3: pares[2]?.salida || null,
      horasTrabajadas: asistencia.horasTrabajadas,
      tieneErrores: asistencia.tieneErrores,
      tipoError: asistencia.errores.map(e => e.tipo).join(', '),
      observaciones: asistencia.observaciones,
      marcacionesRaw: JSON.stringify(pares)
    }
  })
}

async function actualizarResumenMensual(
  empleadoId: number,
  asistencias: AsistenciaDia[]
): Promise<void> {
  const porMes = new Map<string, AsistenciaDia[]>()

  for (const asistencia of asistencias) {
    const key = format(asistencia.fecha, 'yyyy-MM')
    if (!porMes.has(key)) {
      porMes.set(key, [])
    }
    porMes.get(key)!.push(asistencia)
  }

  for (const [mesStr, dias] of porMes.entries()) {
    const [año, mes] = mesStr.split('-').map(Number)

    const diasTrabajados = dias.filter(d => d.horasTrabajadas > 0).length
    const totalHoras = dias.reduce((sum, d) => sum + d.horasTrabajadas, 0)
    const diasConErrores = dias.filter(d => d.tieneErrores).length

    await prisma.resumenMensual.upsert({
      where: {
        unique_empleado_periodo: {
          empleadoId,
          año,
          mes
        }
      },
      create: {
        empleadoId,
        año,
        mes,
        diasTrabajados,
        totalHoras,
        diasConErrores
      },
      update: {
        diasTrabajados,
        totalHoras,
        diasConErrores
      }
    })
  }
}
