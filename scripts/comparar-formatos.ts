import * as XLSX from 'xlsx'
import * as path from 'path'

const archivos = [
  { nombre: 'Ac Reg del 01-05 al 31--05.xls', descripcion: 'SIN ERRORES' },
  { nombre: 'Marcaciones del 01-05 al 31--05 (1).xls', descripcion: 'CON ERRORES' }
]

console.log('🔍 COMPARACIÓN DETALLADA DE FORMATOS\n')

for (const archivo of archivos) {
  try {
    const rutaArchivo = path.join(process.cwd(), archivo.nombre)
    console.log(`\n${'='.repeat(80)}`)
    console.log(`📄 ${archivo.descripcion}: ${archivo.nombre}`)
    console.log('='.repeat(80))

    const workbook = XLSX.readFile(rutaArchivo)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const datos = XLSX.utils.sheet_to_json(sheet)

    // Análisis de un empleado específico
    const empleadoEjemplo = datos.find((row: any) =>
      row['Nº AC.'] === '13917693' || row['AC Nº'] === '13917693'
    ) as any

    if (empleadoEjemplo) {
      console.log('\n📋 DATOS DE EJEMPLO (DNI: 13917693):')
      console.log(JSON.stringify(empleadoEjemplo, null, 2))
    }

    // Análisis de excepciones (solo para archivo 2)
    if (archivo.descripcion === 'CON ERRORES') {
      console.log('\n❌ ANÁLISIS DE ERRORES/EXCEPCIONES:')

      const excepciones: { [key: string]: number } = {}
      datos.forEach((row: any) => {
        const exc = row['Excepción'] || 'Sin definir'
        excepciones[exc] = (excepciones[exc] || 0) + 1
      })

      Object.entries(excepciones).forEach(([tipo, cantidad]) => {
        const porcentaje = ((cantidad / datos.length) * 100).toFixed(2)
        console.log(`  ${tipo}: ${cantidad} (${porcentaje}%)`)
      })

      // Ejemplos de cada tipo de error
      console.log('\n📝 EJEMPLOS POR TIPO DE EXCEPCIÓN:')

      const tiposExcepcion = [...new Set(datos.map((row: any) => row['Excepción']))]
      tiposExcepcion.forEach((tipo: any) => {
        const ejemplo = datos.find((row: any) => row['Excepción'] === tipo) as any
        if (ejemplo) {
          console.log(`\n  ${tipo || 'Sin definir'}:`)
          console.log(`    Nombre: ${ejemplo['Nombre']}`)
          console.log(`    Tiempo: ${ejemplo['Tiempo']}`)
          console.log(`    Estado: ${ejemplo['Estado']}`)
          console.log(`    Nuevo Estado: ${ejemplo['Nuevo Estado'] || 'N/A'}`)
        }
      })
    }

    // Contar empleados únicos
    const dniField = archivo.descripcion === 'CON ERRORES' ? 'Nº AC.' : 'AC Nº'
    const empleadosUnicos = new Set(datos.map((row: any) => row[dniField]))
    console.log(`\n👥 Empleados únicos: ${empleadosUnicos.size}`)
    console.log(`📊 Total de marcaciones: ${datos.length}`)
    console.log(`📈 Promedio marcaciones por empleado: ${(datos.length / empleadosUnicos.size).toFixed(2)}`)

    // Análisis de formato de nombres
    console.log('\n📝 ANÁLISIS DE FORMATO DE NOMBRES:')
    const ejemplosNombres = datos.slice(0, 5).map((row: any) => row['Nombre'])
    ejemplosNombres.forEach((nombre: string, idx: number) => {
      console.log(`  ${idx + 1}. "${nombre}"`)
    })

  } catch (error) {
    console.error(`\n❌ Error al procesar ${archivo.nombre}:`, (error as Error).message)
  }
}

console.log(`\n${'='.repeat(80)}`)
console.log('✅ COMPARACIÓN COMPLETADA')
console.log('='.repeat(80))
