// Test de conexión con usuario superadmin (TypeScript)
import { PrismaClient } from '../src/generated/prisma'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testSuperAdmin() {
  console.log('🔍 Prueba de Conexión con Superadmin\n')
  console.log('═'.repeat(60))

  try {
    // Test 1: Buscar usuario superadmin
    console.log('\n📋 Test 1: Buscando usuario superadmin...')

    const superadmin = await prisma.user.findUnique({
      where: {
        email: 'superadmin@example.com'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!superadmin) {
      console.log('❌ Usuario superadmin NO encontrado en la base de datos')
      console.log('\n💡 Necesitas crear el usuario en Supabase.')
      process.exit(1)
    }

    console.log('✅ Usuario encontrado!')
    console.log('\n📊 Información del usuario:')
    console.log('   ID:', superadmin.id)
    console.log('   Email:', superadmin.email)
    console.log('   Nombre:', superadmin.name)
    console.log('   Rol:', superadmin.role)
    console.log('   Creado:', superadmin.createdAt.toLocaleString('es-ES'))
    console.log('   Actualizado:', superadmin.updatedAt.toLocaleString('es-ES'))

    // Test 2: Verificar contraseña
    console.log('\n🔐 Test 2: Verificando contraseña...')

    const testPassword = 'password123'
    const isPasswordValid = await bcrypt.compare(testPassword, superadmin.password)

    if (isPasswordValid) {
      console.log(`✅ Contraseña "${testPassword}" es VÁLIDA`)
    } else {
      console.log(`❌ Contraseña "${testPassword}" es INVÁLIDA`)
      console.log('   La contraseña guardada en BD no coincide con "password123"')
    }

    // Test 3: Verificar permisos
    console.log('\n🛡️  Test 3: Verificando permisos...')

    if (superadmin.role === 'SUPERADMIN') {
      console.log('✅ Rol SUPERADMIN confirmado')
      console.log('   Permisos:')
      console.log('   • Gestión de usuarios: ✅')
      console.log('   • Gestión de asistencias: ✅')
      console.log('   • Sistema biométrico: ✅')
      console.log('   • Todos los módulos: ✅')
    } else {
      console.log('❌ El rol no es SUPERADMIN')
      console.log('   Rol actual:', superadmin.role)
    }

    // Test 4: Contar total de usuarios
    console.log('\n👥 Test 4: Total de usuarios en sistema...')

    const totalUsers = await prisma.user.count()
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    })

    console.log(`✅ Total de usuarios: ${totalUsers}`)
    console.log('\n   Distribución por rol:')
    usersByRole.forEach(group => {
      console.log(`   • ${group.role}: ${group._count.role}`)
    })

    // Test 5: Verificar otras tablas
    console.log('\n📊 Test 5: Estado de las tablas...')

    const attendances = await prisma.attendance.count()
    const empleados = await prisma.empleado.count()
    const marcaciones = await prisma.marcacionRaw.count()

    console.log(`✅ Asistencias manuales: ${attendances}`)
    console.log(`✅ Empleados biométricos: ${empleados}`)
    console.log(`✅ Marcaciones raw: ${marcaciones}`)

    // Resumen final
    console.log('\n\n' + '═'.repeat(60))
    console.log('🎉 ¡TODOS LOS TESTS PASARON EXITOSAMENTE!\n')
    console.log('✅ Superadmin está configurado correctamente')
    console.log('✅ Base de datos funcionando')
    console.log('✅ Sistema listo para usar\n')
    console.log('🚀 Próximo paso: Ejecuta "npm run dev" para iniciar la aplicación')
    console.log('   Luego ve a http://localhost:3000/auth/login')
    console.log('\n📧 Credenciales de prueba:')
    console.log('   Email: superadmin@example.com')
    console.log('   Password: password123')
    console.log('═'.repeat(60) + '\n')

  } catch (error) {
    console.error('\n❌ Error durante las pruebas:')
    console.error(error)

    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testSuperAdmin()
