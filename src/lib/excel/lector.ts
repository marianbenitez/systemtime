import * as ExcelJS from 'exceljs'
import { MarcacionExcel } from '@/types/marcacion'

export type TipoFormato = 'CON_ERRORES' | 'SIN_ERRORES'

export interface ResultadoLectura {
  datos: MarcacionExcel[]
  formato: TipoFormato
}

/**
 * Lee un archivo Excel en el servidor (API routes)
 * Usa ExcelJS en lugar de xlsx para mayor seguridad
 */
export async function leerExcelMarcaciones(
  archivo: File
): Promise<ResultadoLectura> {
  try {
    // Leer el archivo como ArrayBuffer
    const buffer = await archivo.arrayBuffer()

    // Crear workbook con ExcelJS
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)

    // Obtener la primera hoja
    const worksheet = workbook.worksheets[0]
    
    // Convertir a JSON similar a xlsx
    const json: MarcacionExcel[] = []
    const headerRow = worksheet.getRow(1).values as any[]
    const headers = headerRow.slice(1) // Remover el primer elemento undefined
    
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return // Saltar header
      
      const rowData: any = {}
      const values = row.values as any[]
      
      headers.forEach((header, index) => {
        if (header) {
          rowData[header] = values[index + 1]
        }
      })
      
      json.push(rowData)
    })

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
