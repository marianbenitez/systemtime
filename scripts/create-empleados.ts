import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  const empleados = [
    {
      numeroAC: '12345678', // DNI
      numeroId: '001', // Legajo/Rol
      nombre: 'Juan',
      apellido: 'Pérez',
      departamento: 'Escuela de Ingeniería',
      activo: true
    },
    {
      numeroAC: '23456789',
      numeroId: '002',
      nombre: 'María',
      apellido: 'González',
      departamento: 'Escuela de Medicina',
      activo: true
    },
    {
      numeroAC: '34567890',
      numeroId: '003',
      nombre: 'Carlos',
      apellido: 'Rodríguez',
      departamento: 'Escuela de Derecho',
      activo: true
    },
    {
      numeroAC: '45678901',
      numeroId: '004',
      nombre: 'Ana',
      apellido: 'Martínez',
      departamento: 'Escuela de Economía',
      activo: true
    },
    {
      numeroAC: '56789012',
      numeroId: '005',
      nombre: 'Luis',
      apellido: 'López',
      departamento: 'Escuela de Arquitectura',
      activo: true
    }
  ]

  console.log('🔄 Creando empleados de prueba...\n')

  for (const emp of empleados) {
    const empleado = await prisma.empleado.upsert({
      where: { numeroAC: emp.numeroAC },
      update: {},
      create: emp
    })

    console.log(`✅ ${empleado.apellido}, ${empleado.nombre}`)
    console.log(`   DNI: ${empleado.numeroAC} | Legajo: ${empleado.numeroId}`)
    console.log(`   Escuela: ${empleado.departamento}\n`)
  }

  console.log(`\n✨ Total de empleados creados: ${empleados.length}`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
