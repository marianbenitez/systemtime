import * as XLSX from 'xlsx'
import * as path from 'path'

const archivos = [
  'Ac Reg del 01-05 al 31--05.xls',
  'Marcaciones del 01-05 al 31--05 (1).xls'
]

console.log('📊 ANÁLISIS DE ARCHIVOS EXCEL\n')

for (const archivo of archivos) {
  try {
    const rutaArchivo = path.join(process.cwd(), archivo)
    console.log(`\n${'='.repeat(80)}`)
    console.log(`📄 ARCHIVO: ${archivo}`)
    console.log('='.repeat(80))

    const workbook = XLSX.readFile(rutaArchivo)

    console.log(`\n📑 Hojas encontradas: ${workbook.SheetNames.join(', ')}`)

    for (const sheetName of workbook.SheetNames) {
      console.log(`\n--- HOJA: "${sheetName}" ---`)

      const sheet = workbook.Sheets[sheetName]
      const datos = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]

      if (datos.length === 0) {
        console.log('⚠️  Hoja vacía')
        continue
      }

      // Mostrar encabezados (primera fila)
      console.log('\n📋 ENCABEZADOS (Primera fila):')
      const encabezados = datos[0] || []
      encabezados.forEach((col: any, idx: number) => {
        console.log(`  Columna ${idx + 1}: "${col}"`)
      })

      // Mostrar total de filas
      console.log(`\n📊 Total de filas: ${datos.length}`)
      console.log(`📊 Total de filas con datos: ${datos.length - 1}`)

      // Mostrar primeras 5 filas de datos
      console.log('\n📝 PRIMERAS 5 FILAS DE DATOS:')
      const filasAMostrar = Math.min(6, datos.length)

      for (let i = 0; i < filasAMostrar; i++) {
        const fila = datos[i]
        console.log(`\nFila ${i + 1}:`)
        fila.forEach((valor: any, idx: number) => {
          if (encabezados[idx]) {
            console.log(`  ${encabezados[idx]}: ${valor}`)
          }
        })
      }

      // Análisis de estructura
      console.log('\n🔍 ANÁLISIS DE ESTRUCTURA:')
      const datosJSON = XLSX.utils.sheet_to_json(sheet)
      if (datosJSON.length > 0) {
        const primeraFila = datosJSON[0] as any
        console.log('\n  Campos detectados:')
        Object.keys(primeraFila).forEach(key => {
          const valor = primeraFila[key]
          const tipo = typeof valor
          console.log(`    - "${key}": ${tipo} (ejemplo: ${JSON.stringify(valor)})`)
        })
      }
    }

  } catch (error) {
    console.error(`\n❌ Error al procesar ${archivo}:`, (error as Error).message)
  }
}

console.log(`\n${'='.repeat(80)}`)
console.log('✅ ANÁLISIS COMPLETADO')
console.log('='.repeat(80))
