import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'superadmin@systemtime.com'
  const password = 'super123'
  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Super Administrador',
      password: hashedPassword,
      role: 'SUPERADMIN',
    },
  })

  console.log('✅ Usuario SUPERADMIN creado/actualizado:')
  console.log('📧 Email:', email)
  console.log('🔑 Contraseña:', password)
  console.log('👤 Rol:', user.role)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
