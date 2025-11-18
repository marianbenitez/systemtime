import * as XLSX from 'xlsx'
import { MarcacionExcel } from '@/types/marcacion'

export type TipoFormato = 'CON_ERRORES' | 'SIN_ERRORES'

export interface ResultadoLectura {
  datos: MarcacionExcel[]
  formato: TipoFormato
}

/**
 * Lee un archivo Excel en el servidor (API routes)
 * Usa arrayBuffer() en lugar de FileReader para compatibilidad con Node.js
 */
export async function leerExcelMarcaciones(
  archivo: File
): Promise<ResultadoLectura> {
  try {
    // Leer el archivo como ArrayBuffer (funciona en servidor)
    const buffer = await archivo.arrayBuffer()

    // Convertir a Buffer de Node.js y leer con XLSX
    const workbook = XLSX.read(Buffer.from(buffer), { type: 'buffer' })

    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]

    const json = XLSX.utils.sheet_to_json<MarcacionExcel>(sheet)

    // Detectar formato automáticamente
    const formato = detectarFormato(json)

    return { datos: json, formato }
  } catch (error) {
    throw new Error('Error al leer el archivo Excel: ' + (error as Error).message)
  }
}

export function detectarFormato(data: any[]): TipoFormato {
  if (!data || data.length === 0) {
    throw new Error('No se puede detectar el formato: archivo vacío')
  }

  const primeraFila = data[0]

  // Formato CON ERRORES tiene: "Nº AC.", "Tiempo", "Excepción"
  const esFormatoConErrores = 'Nº AC.' in primeraFila && 'Tiempo' in primeraFila

  // Formato SIN ERRORES tiene: "AC Nº", "Día/Hora", "Departamento"
  const esFormatoSinErrores = 'AC Nº' in primeraFila && 'Día/Hora' in primeraFila

  if (esFormatoConErrores) {
    return 'CON_ERRORES'
  } else if (esFormatoSinErrores) {
    return 'SIN_ERRORES'
  } else {
    throw new Error('Formato de archivo no reconocido. Columnas esperadas no encontradas.')
  }
}

export function validarEstructuraExcel(data: any[], formato: TipoFormato): boolean {
  if (!data || data.length === 0) {
    throw new Error('El archivo Excel está vacío')
  }

  const primeraFila = data[0]

  let columnasRequeridas: string[]

  if (formato === 'CON_ERRORES') {
    columnasRequeridas = ['Nº AC.', 'Nombre', 'Tiempo', 'Estado']
  } else {
    columnasRequeridas = ['AC Nº', 'Nombre', 'Día/Hora', 'Estado', 'Departamento']
  }

  for (const columna of columnasRequeridas) {
    if (!(columna in primeraFila)) {
      throw new Error(`Falta la columna requerida: ${columna}`)
    }
  }

  return true
}
