import * as fs from 'fs'
import * as path from 'path'
import FormData from 'form-data'
import fetch from 'node-fetch'

const API_URL = 'http://localhost:3000/api/marcaciones/importar-dual'

async function importarDual() {
  console.log('🚀 Iniciando importación dual de archivos Excel...\n')

  const archivoSinErrores = path.join(process.cwd(), 'Ac Reg del 01-05 al 31--05.xls')
  const archivoConErrores = path.join(process.cwd(), 'Marcaciones del 01-05 al 31--05 (1).xls')

  // Verificar que los archivos existen
  if (!fs.existsSync(archivoSinErrores)) {
    console.error('❌ Error: No se encontró el archivo SIN ERRORES')
    process.exit(1)
  }

  if (!fs.existsSync(archivoConErrores)) {
    console.error('❌ Error: No se encontró el archivo CON ERRORES')
    process.exit(1)
  }

  console.log('✅ Archivos encontrados:')
  console.log(`   - SIN ERRORES: ${path.basename(archivoSinErrores)}`)
  console.log(`   - CON ERRORES: ${path.basename(archivoConErrores)}`)
  console.log()

  // Crear FormData
  const formData = new FormData()
  formData.append('archivoSinErrores', fs.createReadStream(archivoSinErrores))
  formData.append('archivoConErrores', fs.createReadStream(archivoConErrores))
  formData.append('fechaInicio', '2025-05-01')
  formData.append('fechaFin', '2025-05-31')

  try {
    console.log('📤 Enviando archivos al servidor...')
    console.log(`   URL: ${API_URL}`)
    console.log(`   Período: 01/05/2025 - 31/05/2025`)
    console.log()

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData as any,
      headers: formData.getHeaders()
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al importar')
    }

    console.log('✅ IMPORTACIÓN EXITOSA!\n')
    console.log('=' .repeat(80))
    console.log(data.mensaje)
    console.log('=' .repeat(80))
    console.log()

    console.log('📊 ESTADÍSTICAS DE LA IMPORTACIÓN:')
    console.log()
    console.log('👥 EMPLEADOS:')
    console.log(`   Total empleados: ${data.estadisticas.totalEmpleados}`)
    console.log(`   Con departamento: ${data.estadisticas.empleadosConDepartamento}`)
    console.log()

    console.log('📋 MARCACIONES:')
    console.log(`   Total marcaciones: ${data.estadisticas.totalMarcaciones}`)
    console.log(`   ✅ Válidas (FOT): ${data.estadisticas.marcacionesValidas}`)
    console.log(`   ⚠️  Repetidas: ${data.estadisticas.marcacionesRepetidas}`)
    console.log(`   ❌ Inválidas: ${data.estadisticas.marcacionesInvalidas}`)
    console.log()

    console.log('📈 PORCENTAJES:')
    const totalMarcaciones = data.estadisticas.totalMarcaciones
    const porcValidas = ((data.estadisticas.marcacionesValidas / totalMarcaciones) * 100).toFixed(2)
    const porcRepetidas = ((data.estadisticas.marcacionesRepetidas / totalMarcaciones) * 100).toFixed(2)
    const porcInvalidas = ((data.estadisticas.marcacionesInvalidas / totalMarcaciones) * 100).toFixed(2)

    console.log(`   Válidas: ${porcValidas}%`)
    console.log(`   Repetidas: ${porcRepetidas}%`)
    console.log(`   Inválidas: ${porcInvalidas}%`)
    console.log()

    console.log('=' .repeat(80))
    console.log()
    console.log('🎯 PRÓXIMOS PASOS:')
    console.log('   1. Revisa los empleados en: http://localhost:3000/dashboard/empleados-biometrico')
    console.log('   2. Genera informes en: http://localhost:3000/dashboard/informes')
    console.log()

    console.log('💾 DATOS GUARDADOS EN BASE DE DATOS:')
    console.log(`   - empleados: ${data.estadisticas.totalEmpleados} registros`)
    console.log(`   - importaciones: 1 registro`)
    console.log(`   - marcaciones_raw: ${data.estadisticas.totalMarcaciones} registros`)
    console.log(`   - asistencia_diaria: ~${data.estadisticas.totalEmpleados * 20} registros (estimado)`)
    console.log(`   - resumen_mensual: ${data.estadisticas.totalEmpleados} registros`)
    console.log()

  } catch (error) {
    console.error('❌ ERROR EN IMPORTACIÓN:')
    console.error((error as Error).message)
    process.exit(1)
  }
}

importarDual()
