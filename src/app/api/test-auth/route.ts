import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test 1: Verificar variables de entorno de NextAuth
    const hasNextAuthUrl = !!process.env.NEXTAUTH_URL
    const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET
    const nextAuthUrl = process.env.NEXTAUTH_URL

    // Test 2: Verificar que podemos acceder a la base de datos
    const userCount = await prisma.user.count()

    // Test 3: Intentar buscar el usuario superadmin
    const superadmin = await prisma.user.findUnique({
      where: { email: 'superadmin@example.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true
      }
    })

    // Test 4: Verificar que la contraseña se puede comparar
    let passwordTestResult = null
    if (superadmin?.password) {
      const testPassword = 'password123'
      const isValid = await bcrypt.compare(testPassword, superadmin.password)
      passwordTestResult = {
        testPassword,
        isValid,
        hashedPasswordLength: superadmin.password.length,
        hashedPasswordPrefix: superadmin.password.substring(0, 10) + '...'
      }
    }

    return NextResponse.json({
      status: 'success',
      message: '✅ Test de autenticación completado',
      environment: {
        hasNextAuthUrl,
        nextAuthUrl: nextAuthUrl || 'NOT SET',
        hasNextAuthSecret,
        nextAuthSecretLength: process.env.NEXTAUTH_SECRET?.length || 0,
        nodeEnv: process.env.NODE_ENV
      },
      database: {
        totalUsers: userCount,
        superadminExists: !!superadmin,
        superadminData: superadmin ? {
          id: superadmin.id,
          email: superadmin.email,
          name: superadmin.name,
          role: superadmin.role
        } : null
      },
      passwordTest: passwordTestResult,
      recommendations: generateRecommendations(
        nextAuthUrl,
        hasNextAuthSecret,
        !!superadmin,
        passwordTestResult?.isValid
      ),
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Auth test error:', error)

    return NextResponse.json({
      status: 'error',
      message: error.message || 'Error en test de autenticación',
      error: {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      timestamp: new Date().toISOString()
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

function generateRecommendations(
  nextAuthUrl: string | undefined,
  hasSecret: boolean,
  superadminExists: boolean,
  passwordValid: boolean | undefined
): string[] {
  const recommendations: string[] = []

  if (!nextAuthUrl) {
    recommendations.push('❌ NEXTAUTH_URL no está configurado')
  } else if (nextAuthUrl.includes('localhost')) {
    recommendations.push('⚠️ NEXTAUTH_URL apunta a localhost - debe ser la URL de Vercel')
  } else {
    recommendations.push('✅ NEXTAUTH_URL configurado correctamente')
  }

  if (!hasSecret) {
    recommendations.push('❌ NEXTAUTH_SECRET no está configurado')
  } else {
    recommendations.push('✅ NEXTAUTH_SECRET está presente')
  }

  if (!superadminExists) {
    recommendations.push('❌ Usuario superadmin no existe en la base de datos')
  } else {
    recommendations.push('✅ Usuario superadmin existe')
  }

  if (passwordValid === false) {
    recommendations.push('❌ La contraseña "password123" NO coincide con el hash en BD')
  } else if (passwordValid === true) {
    recommendations.push('✅ La contraseña "password123" es válida')
  }

  return recommendations
}
