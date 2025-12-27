/**
 * Script para probar el endpoint MCP
 * Uso: node scripts/test-mcp.js [url]
 * Ejemplo: node scripts/test-mcp.js http://localhost:3000
 */

const BASE_URL = process.argv[2] || 'http://localhost:3000'
const MCP_ENDPOINT = `${BASE_URL}/api/mcp`

async function testMCP() {
  console.log('🧪 Probando servidor MCP...\n')
  console.log(`📍 Endpoint: ${MCP_ENDPOINT}\n`)

  // Test 1: GET - Información del servidor
  console.log('📋 Test 1: GET - Información del servidor')
  try {
    const getResponse = await fetch(MCP_ENDPOINT)
    const getData = await getResponse.json()
    console.log('✅ Respuesta:', JSON.stringify(getData, null, 2))
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
  console.log('\n')

  // Test 2: Initialize
  console.log('📋 Test 2: Initialize')
  try {
    const initResponse = await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {},
      }),
    })
    const initData = await initResponse.json()
    console.log('✅ Respuesta:', JSON.stringify(initData, null, 2))
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
  console.log('\n')

  // Test 3: List Tools
  console.log('📋 Test 3: List Tools')
  try {
    const listResponse = await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {},
      }),
    })
    const listData = await listResponse.json()
    console.log('✅ Respuesta:', JSON.stringify(listData, null, 2))
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
  console.log('\n')

  // Test 4: Call Tool - get_system_info
  console.log('📋 Test 4: Call Tool - get_system_info')
  try {
    const toolResponse = await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'get_system_info',
          arguments: {},
        },
      }),
    })
    const toolData = await toolResponse.json()
    console.log('✅ Respuesta:', JSON.stringify(toolData, null, 2))
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
  console.log('\n')

  // Test 5: Call Tool - get_empleados_count
  console.log('📋 Test 5: Call Tool - get_empleados_count')
  try {
    const empleadosResponse = await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'get_empleados_count',
          arguments: {},
        },
      }),
    })
    const empleadosData = await empleadosResponse.json()
    console.log('✅ Respuesta:', JSON.stringify(empleadosData, null, 2))
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
  console.log('\n')

  // Test 6: Call Tool - get_users_count
  console.log('📋 Test 6: Call Tool - get_users_count')
  try {
    const usersResponse = await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: {
          name: 'get_users_count',
          arguments: {},
        },
      }),
    })
    const usersData = await usersResponse.json()
    console.log('✅ Respuesta:', JSON.stringify(usersData, null, 2))
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
  console.log('\n')

  console.log('✨ Pruebas completadas!')
}

// Ejecutar pruebas
testMCP().catch(console.error)





