const { PrismaClient } = require('./src/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function crearUsuarioPrueba() {
  try {
    console.log('\n🔧 Creando usuario de prueba...\n');

    // Contraseña simple para pruebas: "password123"
    const passwordHash = await bcrypt.hash('password123', 10);

    const usuario = await prisma.user.upsert({
      where: { email: 'prueba@test.com' },
      update: {
        password: passwordHash,
        name: 'Usuario Prueba',
        role: 'USER'
      },
      create: {
        email: 'prueba@test.com',
        password: passwordHash,
        name: 'Usuario Prueba',
        role: 'USER'
      }
    });

    console.log('✅ Usuario de prueba creado/actualizado:\n');
    console.log('   📧 Email:     prueba@test.com');
    console.log('   🔑 Password:  password123');
    console.log('   👤 Rol:       USER');
    console.log('   🆔 ID:        ' + usuario.id);
    console.log('\n💡 Puedes usar estas credenciales para probar el login en:');
    console.log('   http://localhost:3001/auth/login\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

crearUsuarioPrueba();
