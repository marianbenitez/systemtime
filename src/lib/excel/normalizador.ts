import { format } from 'date-fns'
import { MarcacionExcel, MarcacionNormalizada, MarcacionExcelConErrores, MarcacionExcelSinErrores } from '@/types/marcacion'
import { parsearFechaExcel } from '@/lib/utils'
import { TipoFormato } from './lector'

function esFormatoConErrores(row: MarcacionExcel): row is MarcacionExcelConErrores {
  return 'Nº AC.' in row
}

function esFormatoSinErrores(row: MarcacionExcel): row is MarcacionExcelSinErrores {
  return 'AC Nº' in row
}

export function normalizarMarcacion(
  row: MarcacionExcel,
  formato: TipoFormato
): MarcacionNormalizada | null {
  try {
    // Detectar y procesar según el formato
    if (formato === 'CON_ERRORES' && esFormatoConErrores(row)) {
      return normalizarFormatoConErrores(row)
    } else if (formato === 'SIN_ERRORES' && esFormatoSinErrores(row)) {
      return normalizarFormatoSinErrores(row)
    } else {
      console.error('Formato inconsistente:', row)
      return null
    }
  } catch (error) {
    console.error('Error al normalizar marcación:', error, row)
    return null
  }
}

function normalizarFormatoConErrores(
  row: MarcacionExcelConErrores
): MarcacionNormalizada | null {
  const fechaHora = parsearFechaExcel(row['Tiempo'])

  if (!fechaHora) {
    console.warn('Fecha inválida:', row['Tiempo'])
    return null
  }

  // Separar nombre completo en apellido y nombre
  // Formato: "APELLIDO, NOMBRE"
  const nombreCompleto = row['Nombre'].trim()
  const partes = nombreCompleto.split(',').map(p => p.trim())

  const apellido = partes[0] || ''
  const nombre = partes[1] || partes[0]

  return {
    numeroAC: String(row['Nº AC.']).trim(), // DNI
    numeroId: String(row['Nº'] || '').trim() || undefined, // Rol/Legajo
    nombre,
    apellido,
    departamento: undefined, // No disponible en este formato
    fechaHora,
    estado: row['Estado'],
    excepcion: row['Excepción'] || 'FOT',
    nuevoEstado: row['Nuevo Estado'],
    operacion: row['Operación']
  }
}

function normalizarFormatoSinErrores(
  row: MarcacionExcelSinErrores
): MarcacionNormalizada | null {
  const fechaHora = parsearFechaExcel(row['Día/Hora'])

  if (!fechaHora) {
    console.warn('Fecha inválida:', row['Día/Hora'])
    return null
  }

  // Separar nombre completo en apellido y nombre
  // Formato: "APELLIDO, NOMBRE"
  const nombreCompleto = row['Nombre'].trim()
  const partes = nombreCompleto.split(',').map(p => p.trim())

  const apellido = partes[0] || ''
  const nombre = partes[1] || partes[0]

  return {
    numeroAC: String(row['AC Nº']).trim(), // DNI
    numeroId: String(row['Número ID'] || '').trim() || undefined, // Rol/Legajo
    nombre,
    apellido,
    departamento: row['Departamento']?.trim() || undefined, // Escuela
    fechaHora,
    estado: row['Estado'],
    excepcion: 'FOT', // Este formato no tiene excepciones, asumimos FOT (normal)
    nuevoEstado: undefined,
    operacion: undefined
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
