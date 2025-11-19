// Script para verificar conexión con Supabase
require('dotenv').config();
const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando conexión con Supabase...\n');

  try {
    // Test 1: Conexión básica
    console.log('Test 1: Conectando a la base de datos...');
    await prisma.$connect();
    console.log('✅ Conexión exitosa\n');

    // Test 2: Contar usuarios
    console.log('Test 2: Verificando usuarios...');
    const userCount = await prisma.user.count();
    console.log(`✅ Total de usuarios: ${userCount}`);

    if (userCount > 0) {
      console.log('\n📋 Lista de usuarios:');
      console.log('═'.repeat(60));
      const users = await prisma.user.findMany({
        select: {
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      });

      users.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Rol: ${user.role}`);
        console.log(`   Creado: ${user.createdAt.toLocaleDateString('es-ES')}`);
      });
      console.log('\n' + '═'.repeat(60));
    }

    // Test 3: Verificar tablas del sistema biométrico
    console.log('\n\nTest 3: Verificando tablas del sistema biométrico...');
    const empleadoCount = await prisma.empleado.count();
    const marcacionCount = await prisma.marcacionRaw.count();
    const asistenciaCount = await prisma.asistenciaDiaria.count();

    console.log(`✅ Empleados: ${empleadoCount}`);
    console.log(`✅ Marcaciones raw: ${marcacionCount}`);
    console.log(`✅ Asistencias diarias: ${asistenciaCount}`);

    // Test 4: Info de la base de datos
    console.log('\n\nTest 4: Información de la base de datos...');
    const dbInfo = await prisma.$queryRaw`
      SELECT
        current_database() as database,
        current_user as user,
        version() as version
    `;

    console.log('✅ Base de datos:', dbInfo[0].database);
    console.log('✅ Usuario:', dbInfo[0].user);
    console.log('✅ Versión PostgreSQL:', dbInfo[0].version.split(',')[0]);

    console.log('\n\n🎉 ¡Todas las verificaciones pasaron exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   • Conexión a Supabase: ✅ Funcionando`);
    console.log(`   • Usuarios en sistema: ${userCount}`);
    console.log(`   • Tablas biométricas: ✅ Creadas y funcionales`);
    console.log(`   • Prisma Client: ✅ v6.19.0`);
    console.log('\n✨ Tu base de datos está lista para usar!\n');

  } catch (error) {
    console.error('\n❌ Error durante la verificación:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();