const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    console.log('\n=== USUARIOS EN LA BASE DE DATOS ===\n');
    console.log(`Total de usuarios: ${users.length}\n`);

    if (users.length === 0) {
      console.log('⚠️  No hay usuarios registrados en la base de datos.');
      console.log('💡 Puedes crear un usuario accediendo a: http://localhost:3000/auth/register');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || 'Sin nombre'}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   👤 Rol: ${user.role}`);
        console.log(`   📅 Creado: ${user.createdAt.toLocaleDateString('es-ES')}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Error al consultar usuarios:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
