import { PrismaClient } from '../src/generated/prisma'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Hash para la contraseña por defecto: "password123"
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Crear SUPERADMIN
  const superadmin = await prisma.user.upsert({
    where: { email: 'superadmin@example.com' },
    update: {},
    create: {
      email: 'superadmin@example.com',
      name: 'Super Administrador',
      password: hashedPassword,
      role: 'SUPERADMIN',
    },
  })
  console.log('✅ SUPERADMIN creado:', superadmin.email)

  // Crear ADMIN
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })
  console.log('✅ ADMIN creado:', admin.email)

  // Crear USER
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Usuario Regular',
      password: hashedPassword,
      role: 'USER',
    },
  })
  console.log('✅ USER creado:', user.email)

  console.log('\n📊 Resumen de usuarios creados:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Email: superadmin@example.com | Rol: SUPERADMIN | Contraseña: password123')
  console.log('Email: admin@example.com       | Rol: ADMIN      | Contraseña: password123')
  console.log('Email: user@example.com        | Rol: USER       | Contraseña: password123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n✨ Seed completado exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
