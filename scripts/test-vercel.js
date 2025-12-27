/**
 * Script para probar la conexión con Vercel
 * Uso: node scripts/test-vercel.js [url]
 * Ejemplo: node scripts/test-vercel.js https://systemtime.vercel.app
 */

const BASE_URL = process.argv[2] || 'https://systemtime.vercel.app'

async function testVercel() {
  console.log('🧪 Probando conexión con Vercel...\n')
  console.log(`📍 URL: ${BASE_URL}\n`)

  const endpoints = [
    { name: 'Health Check', path: '/api/health' },
    { name: 'MCP Endpoint', path: '/api/mcp' },
    { name: 'Test DB', path: '/api/test-db' },
  ]

  for (const endpoint of endpoints) {
    console.log(`📋 Test: ${endpoint.name} (${endpoint.path})`)
    try {
      const response = await fetch(`${BASE_URL}${endpoint.path}`)
      const data = await response.json()
      
      if (response.ok) {
        console.log('✅ Estado:', response.status)
        console.log('📦 Respuesta:', JSON.stringify(data, null, 2).substring(0, 200) + '...')
      } else {
        console.log('❌ Error:', response.status)
        console.log('📦 Respuesta:', JSON.stringify(data, null, 2))
      }
    } catch (error) {
      console.error('❌ Error:', error.message)
    }
    console.log('\n')
  }

  // Test MCP específico
  console.log('📋 Test: MCP Tools List')
  try {
    const response = await fetch(`${BASE_URL}/api/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {},
      }),
    })
    const data = await response.json()
    
    if (response.ok && data.result && data.result.tools) {
      console.log('✅ MCP funciona correctamente')
      console.log(`📦 Herramientas disponibles: ${data.result.tools.length}`)
      data.result.tools.forEach(tool => {
        console.log(`   - ${tool.name}: ${tool.description}`)
      })
    } else {
      console.log('❌ MCP no responde correctamente')
      console.log('📦 Respuesta:', JSON.stringify(data, null, 2))
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
  console.log('\n')

  console.log('✨ Pruebas completadas!')
  console.log('\n💡 Si todos los tests pasan, tu aplicación está funcionando correctamente en Vercel.')
}

// Ejecutar pruebas
testVercel().catch(console.error)

