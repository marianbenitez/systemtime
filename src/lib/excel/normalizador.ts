import { format } from 'date-fns'
import { MarcacionExcel, MarcacionNormalizada } from '@/types/marcacion'
import { parsearFechaExcel } from '@/lib/utils'

export function normalizarMarcacion(
  row: MarcacionExcel
): MarcacionNormalizada | null {
  try {
    const fechaHora = parsearFechaExcel(row['Tiempo'])

    if (!fechaHora) {
      console.warn('Fecha inválida:', row['Tiempo'])
      return null
    }

    return {
      numeroAC: String(row['Nº AC.']).trim(),
      numeroEmpleado: String(row['Nº'] || '').trim(),
      nombre: row['Nombre'].trim(),
      fechaHora,
      estado: row['Estado'],
      excepcion: row['Excepción'] || 'FOT',
      nuevoEstado: row['Nuevo Estado'],
      operacion: row['Operación']
    }
  } catch (error) {
    console.error('Error al normalizar marcación:', error, row)
    return null
  }
}

export function agruparPorEmpleado(
  marcaciones: MarcacionNormalizada[]
): Map<string, MarcacionNormalizada[]> {
  const grupos = new Map<string, MarcacionNormalizada[]>()

  for (const marcacion of marcaciones) {
    const key = marcacion.numeroAC

    if (!grupos.has(key)) {
      grupos.set(key, [])
    }

    grupos.get(key)!.push(marcacion)
  }

  return grupos
}

export function agruparPorFecha(
  marcaciones: MarcacionNormalizada[]
): Map<string, MarcacionNormalizada[]> {
  const grupos = new Map<string, MarcacionNormalizada[]>()

  for (const marcacion of marcaciones) {
    const key = format(marcacion.fechaHora, 'yyyy-MM-dd')

    if (!grupos.has(key)) {
      grupos.set(key, [])
    }

    grupos.get(key)!.push(marcacion)
  }

  return grupos
}
