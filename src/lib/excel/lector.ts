import * as XLSX from 'xlsx'
import { MarcacionExcel } from '@/types/marcacion'

export async function leerExcelMarcaciones(
  archivo: File
): Promise<MarcacionExcel[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })

        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]

        const json = XLSX.utils.sheet_to_json<MarcacionExcel>(sheet)

        resolve(json)
      } catch (error) {
        reject(new Error('Error al leer el archivo Excel: ' + (error as Error).message))
      }
    }

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'))
    }

    reader.readAsBinaryString(archivo)
  })
}

export function validarEstructuraExcel(data: any[]): boolean {
  if (!data || data.length === 0) {
    throw new Error('El archivo Excel está vacío')
  }

  const primeraFila = data[0]
  const columnasRequeridas = ['Nº AC.', 'Nombre', 'Tiempo', 'Estado']

  for (const columna of columnasRequeridas) {
    if (!(columna in primeraFila)) {
      throw new Error(`Falta la columna requerida: ${columna}`)
    }
  }

  return true
}
